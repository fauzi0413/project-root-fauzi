<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Jobs\SendTaskAssignedNotification;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class TaskController extends Controller
{
    /**
     * Helper to resolve the authenticated user from JWT token, guard, or request.
     */
    private function resolveAuthUser(?Request $request = null)
    {
        $user = null;

        if ($request && $request->bearerToken()) {
            try {
                $user = JWTAuth::setToken($request->bearerToken())->toUser();
            } catch (\Throwable $e) {
                // Ignore token decode errors
            }
        }

        if (!$user) {
            $user = auth('api')->user();
        }

        if (!$user && $request) {
            $user = $request->user('api') ?: $request->user();
        }

        if (!$user) {
            $user = auth()->user();
        }

        return $user;
    }

    /**
     * Get list of tasks with pagination, filtering, searching, and sorting.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Task::query();

        $user = $this->resolveAuthUser($request);

        // If user is a member, ONLY show tasks assigned to them (their own tasks)
        if ($user && $user->role === 'member') {
            $query->where('assigned_user_id', $user->id);
        } elseif ($request->has('assigned_user_id') && $request->assigned_user_id !== 'all') {
            $query->where('assigned_user_id', $request->assigned_user_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        // Search by title
        if ($request->has('search') && $request->search !== '') {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if (in_array($sortBy, ['created_at', 'due_date', 'priority'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $tasks = $query->with(['creator:id,name,email', 'assignee:id,name,email'])
            ->paginate($perPage);

        return response()->json([
            'data' => $tasks->items(),
            'current_page' => $tasks->currentPage(),
            'last_page' => $tasks->lastPage(),
            'total' => $tasks->total(),
            'per_page' => $tasks->perPage(),
        ], 200);
    }

    /**
     * Create a new task.
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $user = $this->resolveAuthUser($request);
        $validated = $request->validated();
        $validated['created_by'] = $user?->id ?: auth('api')->id() ?: auth()->id();

        // If user is a member, automatically assign task to themselves
        if ($user && $user->role === 'member') {
            $validated['assigned_user_id'] = $user->id;
        }

        $task = Task::create($validated);

        // Dispatch background job for sending assignment notification
        if ($task->assigned_user_id) {
            SendTaskAssignedNotification::dispatch($task);
        }

        return response()->json([
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'priority' => $task->priority,
            'assigned_user_id' => $task->assigned_user_id,
            'created_by' => $task->created_by,
            'due_date' => $task->due_date?->format('Y-m-d H:i:s'),
            'created_at' => $task->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $task->updated_at->format('Y-m-d H:i:s'),
        ], 201);
    }

    /**
     * Get task detail with relations.
     */
    public function show(Task $task): JsonResponse
    {
        $user = $this->resolveAuthUser(request());
        if ($user && $user->role === 'member') {
            if ($task->assigned_user_id !== $user->id && $task->created_by !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized. You do not have access to this task.',
                ], 403);
            }
        }

        $task->load([
            'creator:id,name,email',
            'assignee:id,name,email',
            'attachments:id,task_id,file_name,file_path,file_size,mime_type,uploaded_at',
            'comments' => function ($query) {
                $query->with('user:id,name,email')->orderBy('created_at', 'desc');
            },
        ]);

        return response()->json([
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'priority' => $task->priority,
            'assigned_user_id' => $task->assigned_user_id,
            'assigned_user' => $task->assignee,
            'assignee' => $task->assignee,
            'created_by' => $task->creator,
            'due_date' => $task->due_date?->format('Y-m-d H:i:s'),
            'attachments' => $task->attachments,
            'comments' => $task->comments,
            'created_at' => $task->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $task->updated_at->format('Y-m-d H:i:s'),
        ], 200);
    }

    /**
     * Update a task.
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $user = $this->resolveAuthUser($request);
        if ($user && $user->role === 'member') {
            if ($task->assigned_user_id !== $user->id && $task->created_by !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized. You can only update your own tasks.',
                ], 403);
            }
        }

        $validated = $request->validated();

        // If member, ensure assigned_user_id cannot be changed to another member
        if ($user && $user->role === 'member') {
            $validated['assigned_user_id'] = $task->assigned_user_id ?: $user->id;
        }

        $task->update($validated);

        return response()->json([
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'priority' => $task->priority,
            'assigned_user_id' => $task->assigned_user_id,
            'created_by' => $task->created_by,
            'due_date' => $task->due_date?->format('Y-m-d H:i:s'),
            'created_at' => $task->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $task->updated_at->format('Y-m-d H:i:s'),
        ], 200);
    }

    /**
     * Delete a task (cascade delete attachments and comments).
     */
    public function destroy(Task $task): JsonResponse
    {
        $user = $this->resolveAuthUser(request());
        if ($user && $user->role === 'member') {
            if ($task->created_by !== $user->id && $task->assigned_user_id !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized. Only admins or task owners can delete this task.',
                ], 403);
            }
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully',
        ], 200);
    }
}

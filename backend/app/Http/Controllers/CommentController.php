<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Get all comments for a specific task.
     */
    public function index(Task $task): JsonResponse
    {
        $comments = $task->comments()
            ->with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $comments,
        ], 200);
    }

    /**
     * Add a new comment to a task.
     */
    public function store(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'comment' => 'required|string|min:1',
        ]);

        $comment = $task->comments()->create([
            'user_id' => auth()->id(),
            'comment' => $validated['comment'],
        ]);

        $comment->load('user:id,name,email');

        return response()->json([
            'id' => $comment->id,
            'task_id' => $comment->task_id,
            'user' => $comment->user,
            'comment' => $comment->comment,
            'created_at' => $comment->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $comment->updated_at->format('Y-m-d H:i:s'),
        ], 201);
    }

    /**
     * Delete a comment.
     */
    public function destroy(TaskComment $comment): JsonResponse
    {
        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully',
        ], 200);
    }
}

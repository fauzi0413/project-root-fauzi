<?php

namespace App\Observers;

use App\Models\Task;
use Illuminate\Support\Facades\Cache;

class TaskObserver
{
    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        $this->broadcastTaskEvent('task.created', $task);
    }

    /**
     * Handle the Task "updated" event.
     */
    public function updated(Task $task): void
    {
        $this->broadcastTaskEvent('task.updated', $task);
    }

    /**
     * Handle the Task "deleted" event.
     */
    public function deleted(Task $task): void
    {
        $this->broadcastTaskEvent('task.deleted', [
            'id' => $task->id,
            'title' => $task->title,
        ]);
    }

    /**
     * Broadcast task event to all connected clients.
     */
    private function broadcastTaskEvent(string $eventType, Task|array $task): void
    {
        // Get all users who might be listening
        $users = \App\Models\User::pluck('id');

        foreach ($users as $userId) {
            $cacheKey = 'task_events_' . $userId;
            $events = Cache::get($cacheKey, []);

            $eventId = count($events) + 1;
            $events[] = [
                'id' => $eventId,
                'type' => $eventType,
                'data' => is_array($task) ? $task : [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'status' => $task->status,
                    'priority' => $task->priority,
                    'assigned_user_id' => $task->assigned_user_id,
                    'due_date' => $task->due_date?->format('Y-m-d H:i:s'),
                    'created_at' => $task->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $task->updated_at->format('Y-m-d H:i:s'),
                ],
                'timestamp' => now()->format('Y-m-d H:i:s'),
            ];

            // Keep only last 100 events in cache for 24 hours
            $events = array_slice($events, -100);
            Cache::put($cacheKey, $events, 86400);
        }
    }
}

<?php

namespace App\Observers;

use App\Models\TaskComment;
use Illuminate\Support\Facades\Cache;

class TaskCommentObserver
{
    /**
     * Handle the TaskComment "created" event.
     */
    public function created(TaskComment $comment): void
    {
        $this->broadcastCommentEvent('comment.created', $comment);
    }

    /**
     * Handle the TaskComment "deleted" event.
     */
    public function deleted(TaskComment $comment): void
    {
        $this->broadcastCommentEvent('comment.deleted', [
            'id' => $comment->id,
            'task_id' => $comment->task_id,
        ]);
    }

    /**
     * Broadcast comment event to all connected clients.
     */
    private function broadcastCommentEvent(string $eventType, TaskComment|array $comment): void
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
                'data' => is_array($comment) ? $comment : [
                    'id' => $comment->id,
                    'task_id' => $comment->task_id,
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'email' => $comment->user->email,
                    ],
                    'comment' => $comment->comment,
                    'created_at' => $comment->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $comment->updated_at->format('Y-m-d H:i:s'),
                ],
                'timestamp' => now()->format('Y-m-d H:i:s'),
            ];

            // Keep only last 100 events in cache for 24 hours
            $events = array_slice($events, -100);
            Cache::put($cacheKey, $events, 86400);
        }
    }
}

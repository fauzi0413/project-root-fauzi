<?php

namespace App\Jobs;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendTaskAssignedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(protected Task $task)
    {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Simulate sending email notification
        if ($this->task->assigned_user_id) {
            $assignee = $this->task->assignee;
            $creator = $this->task->creator;

            Log::info('Task Assignment Notification', [
                'task_id' => $this->task->id,
                'task_title' => $this->task->title,
                'assigned_to' => $assignee?->email,
                'assigned_by' => $creator?->email,
                'timestamp' => now()->format('Y-m-d H:i:s'),
            ]);

            // In production, this would send an actual email:
            // Mail::send('emails.task-assigned', [
            //     'task' => $this->task,
            //     'assignee' => $assignee,
            // ], function ($message) use ($assignee) {
            //     $message->to($assignee->email)
            //             ->subject("Task Assigned: {$this->task->title}");
            // });
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Task Assignment Notification Failed', [
            'task_id' => $this->task->id,
            'error' => $exception->getMessage(),
        ]);
    }
}

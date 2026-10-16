<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskCommentSeeder extends Seeder
{
    /**
     * Seed the task_comments table.
     */
    public function run(): void
    {
        $tasks = Task::all();
        $users = User::all();

        $comments = [
            [
                'task_id' => $tasks[0]->id,
                'user_id' => $users[1]->id,
                'comment' => 'I\'ve started working on the database schema. Need to confirm the relationships with the product team.',
            ],
            [
                'task_id' => $tasks[0]->id,
                'user_id' => $users[0]->id,
                'comment' => 'Great! Let\'s sync up tomorrow at 10 AM to review the schema design.',
            ],
            [
                'task_id' => $tasks[1]->id,
                'user_id' => $users[1]->id,
                'comment' => 'JWT implementation is 80% complete. Testing token refresh mechanism now.',
            ],
            [
                'task_id' => $tasks[1]->id,
                'user_id' => $users[3]->id,
                'comment' => 'Please ensure we\'re following security best practices for token storage.',
            ],
            [
                'task_id' => $tasks[2]->id,
                'user_id' => $users[2]->id,
                'comment' => 'Completed the dashboard wireframes. Check Figma for the latest designs.',
            ],
            [
                'task_id' => $tasks[3]->id,
                'user_id' => $users[1]->id,
                'comment' => 'Task CRUD endpoints are ready. Need to add validation and error handling.',
            ],
            [
                'task_id' => $tasks[3]->id,
                'user_id' => $users[4]->id,
                'comment' => 'Let me review the code before we merge to main. I\'ll add test cases too.',
            ],
            [
                'task_id' => $tasks[4]->id,
                'user_id' => $users[2]->id,
                'comment' => 'Started implementing the file upload system. Using Laravel\'s Storage facade.',
            ],
            [
                'task_id' => $tasks[6]->id,
                'user_id' => $users[2]->id,
                'comment' => 'Comment system architecture is ready. Planning to use SSE for real-time updates.',
            ],
            [
                'task_id' => $tasks[10]->id,
                'user_id' => $users[2]->id,
                'comment' => 'Login page design is complete with error validation states.',
            ],
        ];

        foreach ($comments as $comment) {
            TaskComment::create($comment);
        }
    }
}

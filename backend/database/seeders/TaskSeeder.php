<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Seed the tasks table.
     */
    public function run(): void
    {
        $users = User::all();
        $admin = $users->where('role', 'admin')->first();
        $members = $users->where('role', 'member')->all();

        $tasks = [
            [
                'title' => 'Setup Database Schema',
                'description' => 'Create database schema with migrations and relationships',
                'status' => 'completed',
                'priority' => 'high',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[0]->id ?? null,
                'due_date' => now()->addDays(5),
            ],
            [
                'title' => 'Implement Authentication API',
                'description' => 'Create JWT-based authentication endpoints for login, logout, and me endpoint',
                'status' => 'in_progress',
                'priority' => 'high',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[0]->id ?? null,
                'due_date' => now()->addDays(10),
            ],
            [
                'title' => 'Design Task Management UI',
                'description' => 'Create beautiful dashboard and task detail components for Next.js frontend',
                'status' => 'in_progress',
                'priority' => 'high',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[1]->id ?? null,
                'due_date' => now()->addDays(12),
            ],
            [
                'title' => 'Develop Task CRUD Endpoints',
                'description' => 'Create endpoints for creating, reading, updating, and deleting tasks with filtering',
                'status' => 'in_progress',
                'priority' => 'high',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[0]->id ?? null,
                'due_date' => now()->addDays(8),
            ],
            [
                'title' => 'Build File Upload System',
                'description' => 'Implement file upload functionality with validation and storage to local filesystem',
                'status' => 'pending',
                'priority' => 'medium',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[2]->id ?? null,
                'due_date' => now()->addDays(15),
            ],
            [
                'title' => 'Create Thumbnail Generation Job',
                'description' => 'Setup background queue job for creating image thumbnails asynchronously',
                'status' => 'pending',
                'priority' => 'medium',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[0]->id ?? null,
                'due_date' => now()->addDays(18),
            ],
            [
                'title' => 'Implement Comment System',
                'description' => 'Add comment endpoints and real-time comment updates using Server-Sent Events',
                'status' => 'pending',
                'priority' => 'medium',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[1]->id ?? null,
                'due_date' => now()->addDays(16),
            ],
            [
                'title' => 'Setup Real-time Server-Sent Events',
                'description' => 'Configure SSE endpoint for pushing task updates and new comments to frontend',
                'status' => 'pending',
                'priority' => 'medium',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[0]->id ?? null,
                'due_date' => now()->addDays(20),
            ],
            [
                'title' => 'Develop Notification System',
                'description' => 'Create email notification job when task is assigned to a user',
                'status' => 'pending',
                'priority' => 'low',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[2]->id ?? null,
                'due_date' => now()->addDays(22),
            ],
            [
                'title' => 'Write API Documentation',
                'description' => 'Document all API endpoints with examples and response formats',
                'status' => 'pending',
                'priority' => 'low',
                'created_by' => $admin->id,
                'assigned_user_id' => null,
                'due_date' => now()->addDays(25),
            ],
            [
                'title' => 'Create Frontend Login Page',
                'description' => 'Build login form with validation and token storage in Next.js',
                'status' => 'in_progress',
                'priority' => 'high',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[1]->id ?? null,
                'due_date' => now()->addDays(7),
            ],
            [
                'title' => 'Build Task Dashboard Layout',
                'description' => 'Create responsive dashboard with task list, filters, and search functionality',
                'status' => 'in_progress',
                'priority' => 'high',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[1]->id ?? null,
                'due_date' => now()->addDays(11),
            ],
            [
                'title' => 'Implement Drag-and-Drop File Upload',
                'description' => 'Create drag-and-drop area component for file uploads with progress indicator',
                'status' => 'pending',
                'priority' => 'medium',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[1]->id ?? null,
                'due_date' => now()->addDays(14),
            ],
            [
                'title' => 'Setup Route Protection Middleware',
                'description' => 'Implement Next.js middleware to protect routes and redirect unauthenticated users',
                'status' => 'pending',
                'priority' => 'medium',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[0]->id ?? null,
                'due_date' => now()->addDays(9),
            ],
            [
                'title' => 'Conduct Integration Testing',
                'description' => 'Write and run integration tests for API endpoints and frontend components',
                'status' => 'pending',
                'priority' => 'low',
                'created_by' => $admin->id,
                'assigned_user_id' => $members[2]->id ?? null,
                'due_date' => now()->addDays(28),
            ],
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}

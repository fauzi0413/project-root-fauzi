<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $assignee;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');

        // Create test users
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $this->assignee = User::factory()->create([
            'email' => 'assignee@example.com',
            'password' => bcrypt('password123'),
            'role' => 'member',
        ]);

        // Use Laravel's actingAs() helper to mock authenticated user
        $this->actingAs($this->user, 'api');
    }

    // ==================== Auth Tests ====================

    /**
     * Test login returns JWT token
     */
    public function test_login_returns_token(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);
    }

    /**
     * Test get current user
     */
    public function test_get_current_user(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('email', 'test@example.com')
            ->assertJsonPath('role', 'admin');
    }

    // ==================== Task CRUD Tests ====================

    /**
     * Test list tasks with pagination
     */
    public function test_list_tasks_with_pagination(): void
    {
        Task::factory()->count(15)->create([
            'created_by' => $this->user->id,
        ]);

        $response = $this->getJson('/api/tasks?page=1&per_page=10');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'status', 'priority'],
                ],
                'current_page',
                'last_page',
                'total',
                'per_page',
            ])
            ->assertJsonPath('per_page', 10)
            ->assertJsonPath('total', 15);
    }

    /**
     * Test list tasks with status filter
     */
    public function test_list_tasks_with_status_filter(): void
    {
        Task::factory()->create([
            'status' => 'pending',
            'created_by' => $this->user->id,
        ]);
        Task::factory()->create([
            'status' => 'in_progress',
            'created_by' => $this->user->id,
        ]);

        $response = $this->getJson('/api/tasks?status=pending');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'pending');
    }

    /**
     * Test list tasks with priority filter
     */
    public function test_list_tasks_with_priority_filter(): void
    {
        Task::factory()->create([
            'priority' => 'high',
            'created_by' => $this->user->id,
        ]);
        Task::factory()->create([
            'priority' => 'low',
            'created_by' => $this->user->id,
        ]);

        $response = $this->getJson('/api/tasks?priority=high');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.priority', 'high');
    }

    /**
     * Test create task
     */
    public function test_create_task(): void
    {
        $response = $this->postJson('/api/tasks', [
            'title' => 'New Task',
            'description' => 'Task description',
            'status' => 'pending',
            'priority' => 'high',
            'assigned_user_id' => $this->assignee->id,
            'due_date' => '2026-12-31 17:00:00',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('title', 'New Task')
            ->assertJsonPath('status', 'pending');

        $this->assertDatabaseHas('tasks', [
            'title' => 'New Task',
            'status' => 'pending',
        ]);
    }

    /**
     * Test create task with invalid data
     */
    public function test_create_task_with_invalid_data(): void
    {
        $response = $this->postJson('/api/tasks', [
            'title' => '',
            'description' => 'Task description',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    /**
     * Test get task detail
     */
    public function test_get_task_detail(): void
    {
        $task = Task::factory()->create([
            'created_by' => $this->user->id,
        ]);

        $response = $this->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $task->id);
    }

    /**
     * Test update task
     */
    public function test_update_task(): void
    {
        $task = Task::factory()->create([
            'created_by' => $this->user->id,
            'status' => 'pending',
        ]);

        $response = $this->putJson("/api/tasks/{$task->id}", [
            'title' => 'Updated Title',
            'status' => 'in_progress',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'in_progress');

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => 'in_progress',
        ]);
    }

    /**
     * Test delete task
     */
    public function test_delete_task(): void
    {
        $task = Task::factory()->create([
            'created_by' => $this->user->id,
        ]);

        $response = $this->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id,
        ]);
    }

    // ==================== Attachment Tests ====================

    /**
     * Test upload attachment
     */
    public function test_upload_attachment(): void
    {
        $task = Task::factory()->create([
            'created_by' => $this->user->id,
        ]);

        $file = UploadedFile::fake()->create('document.pdf', 500, 'application/pdf');

        $response = $this->postJson("/api/tasks/{$task->id}/attachments", [
            'file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'task_id', 'file_name', 'file_path']);

        $this->assertDatabaseHas('task_attachments', [
            'task_id' => $task->id,
            'file_name' => 'document.pdf',
        ]);
    }

    /**
     * Test upload invalid file type
     */
    public function test_upload_invalid_file_type(): void
    {
        $task = Task::factory()->create([
            'created_by' => $this->user->id,
        ]);

        $file = UploadedFile::fake()->create('malicious.exe', 1000);

        $response = $this->postJson("/api/tasks/{$task->id}/attachments", [
            'file' => $file,
        ]);

        $response->assertStatus(422);
    }

    // ==================== Comment Tests ====================

    /**
     * Test add comment on task
     */
    public function test_add_comment_on_task(): void
    {
        $task = Task::factory()->create([
            'created_by' => $this->user->id,
        ]);

        $response = $this->postJson("/api/tasks/{$task->id}/comments", [
            'comment' => 'Test comment',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('comment', 'Test comment');

        $this->assertDatabaseHas('task_comments', [
            'task_id' => $task->id,
            'user_id' => $this->user->id,
        ]);
    }

    /**
     * Test add empty comment
     */
    public function test_add_empty_comment(): void
    {
        $task = Task::factory()->create([
            'created_by' => $this->user->id,
        ]);

        $response = $this->postJson("/api/tasks/{$task->id}/comments", [
            'comment' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['comment']);
    }

    /**
     * Test that a member only sees tasks assigned to or created by them
     */
    public function test_member_only_sees_their_own_tasks(): void
    {
        // Task for assignee (member)
        Task::factory()->create([
            'title' => 'Member Task',
            'assigned_user_id' => $this->assignee->id,
            'created_by' => $this->user->id,
        ]);

        // Task for another user (not assignee)
        Task::factory()->create([
            'title' => 'Other Task',
            'assigned_user_id' => $this->user->id,
            'created_by' => $this->user->id,
        ]);

        // Act as member
        $this->actingAs($this->assignee, 'api');

        $response = $this->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Member Task');
    }
}

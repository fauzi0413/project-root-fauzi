<?php

use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\EventStreamController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
});

// Protected routes (require JWT authentication)
Route::middleware('auth:api')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });

    // Task routes
    Route::apiResource('tasks', TaskController::class);

    // User routes for assignment
    Route::get('users', [UserController::class, 'index']);

    // Attachment routes
    Route::post('tasks/{task}/attachments', [AttachmentController::class, 'upload']);
    Route::get('attachments/{attachment}/download', [AttachmentController::class, 'download']);
    Route::delete('attachments/{attachment}', [AttachmentController::class, 'destroy']);

    // Comment routes
    Route::prefix('tasks/{task}')->group(function () {
        Route::get('comments', [CommentController::class, 'index']);
        Route::post('comments', [CommentController::class, 'store']);
    });

    Route::delete('comments/{comment}', [CommentController::class, 'destroy']);

    // Server-Sent Events (SSE) for real-time updates
    Route::get('tasks/events', [EventStreamController::class, 'tasks']);
});


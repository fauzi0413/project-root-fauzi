<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateThumbnailJob;
use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    /**
     * Upload file attachment to a task.
     */
    public function upload(Request $request, ?Task $task = null): JsonResponse
    {
        $taskId = $task?->id ?? $request->task_id ?? $request->route('task');
        if ($taskId instanceof Task) {
            $taskId = $taskId->id;
        }
        if ($taskId) {
            $request->merge(['task_id' => $taskId]);
        }

        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'file' => 'required|file|max:26214400', // 25MB in bytes
        ]);

        $file = $request->file('file');
        
        // Validate MIME type (documents and images only, no videos)
        $allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
        ];

        if (!in_array($file->getMimeType(), $allowedMimes)) {
            return response()->json([
                'message' => 'File type not allowed. Only documents (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV) and images (JPEG, PNG, GIF, WEBP) are permitted. Video files are not allowed.',
            ], 422);
        }

        // Generate unique filename
        $originalName = $file->getClientOriginalName();
        $fileName = Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '_' . 
                   uniqid() . '.' . $file->getClientOriginalExtension();

        // Store file
        $path = $file->storeAs('attachments', $fileName, 'public');

        // Save to database
        $attachment = TaskAttachment::create([
            'task_id' => $validated['task_id'],
            'file_name' => $originalName,
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_at' => now(),
        ]);

        // Dispatch thumbnail generation job if image
        if (str_starts_with($file->getMimeType(), 'image/')) {
            GenerateThumbnailJob::dispatch($attachment);
        }

        return response()->json([
            'id' => $attachment->id,
            'task_id' => $attachment->task_id,
            'file_name' => $attachment->file_name,
            'file_path' => $attachment->file_path,
            'file_size' => $attachment->file_size,
            'mime_type' => $attachment->mime_type,
            'uploaded_at' => $attachment->uploaded_at?->format('Y-m-d H:i:s') ?? now()->format('Y-m-d H:i:s'),
        ], 201);
    }

    /**
     * Download file attachment.
     */
    public function download(TaskAttachment $attachment): \Symfony\Component\HttpFoundation\StreamedResponse|JsonResponse
    {
        if (!Storage::disk('public')->exists($attachment->file_path)) {
            return response()->json([
                'message' => 'File not found',
            ], 404);
        }

        return Storage::disk('public')->download(
            $attachment->file_path,
            $attachment->file_name
        );
    }

    /**
     * Delete file attachment.
     */
    public function destroy(TaskAttachment $attachment): JsonResponse
    {
        // Delete physical file
        if (Storage::disk('public')->exists($attachment->file_path)) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        // Delete thumbnail if exists
        $thumbnailPath = 'attachments/thumbnails/' . basename($attachment->file_path);
        if (Storage::disk('public')->exists($thumbnailPath)) {
            Storage::disk('public')->delete($thumbnailPath);
        }

        // Delete from database
        $attachment->delete();

        return response()->json([
            'message' => 'Attachment deleted successfully',
        ], 200);
    }
}

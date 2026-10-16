<?php

namespace App\Jobs;

use App\Models\TaskAttachment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class GenerateThumbnailJob implements ShouldQueue
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
    public function __construct(protected TaskAttachment $attachment)
    {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Check if file exists
            if (!Storage::disk('public')->exists($this->attachment->file_path)) {
                Log::warning('Thumbnail generation: File not found', [
                    'file_path' => $this->attachment->file_path,
                ]);
                return;
            }

            // Get file path
            $fullPath = Storage::disk('public')->path($this->attachment->file_path);

            // Create thumbnails directory if not exists
            $thumbnailDir = Storage::disk('public')->path('attachments/thumbnails');
            if (!is_dir($thumbnailDir)) {
                mkdir($thumbnailDir, 0755, true);
            }

            // Generate thumbnail
            $thumbnailName = basename($this->attachment->file_path);
            $thumbnailPath = $thumbnailDir . '/' . $thumbnailName;

            // Use Intervention Image to resize
            $image = Image::make($fullPath);
            $image->resize(150, 150, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
            $image->save($thumbnailPath, 85);

            Log::info('Thumbnail generated successfully', [
                'attachment_id' => $this->attachment->id,
                'thumbnail_path' => 'attachments/thumbnails/' . $thumbnailName,
            ]);

            // Update attachment record with thumbnail path
            $this->attachment->update([
                'thumbnail_path' => 'attachments/thumbnails/' . $thumbnailName,
            ]);

        } catch (\Exception $e) {
            Log::error('Thumbnail generation failed', [
                'attachment_id' => $this->attachment->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Thumbnail generation job failed', [
            'attachment_id' => $this->attachment->id,
            'error' => $exception->getMessage(),
        ]);
    }
}

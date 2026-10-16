<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EventStreamController extends Controller
{
    /**
     * Stream Server-Sent Events for task updates and comments.
     */
    public function tasks(Request $request): StreamedResponse
    {
        $lastEventId = $request->header('Last-Event-ID', 0);
        $cacheKey = 'task_events_' . auth()->id();

        return response()->stream(function () use ($cacheKey, $lastEventId) {
            // Set appropriate headers for SSE
            header('Content-Type: text/event-stream');
            header('Cache-Control: no-cache');
            header('Connection: keep-alive');
            header('X-Accel-Buffering: no');

            $checkInterval = 2; // Check for events every 2 seconds
            $maxDuration = 3600; // Keep connection alive for 1 hour
            $startTime = time();

            while ((time() - $startTime) < $maxDuration) {
                // Get events from cache
                $events = Cache::get($cacheKey, []);

                // Send only new events
                foreach ($events as $event) {
                    if ($event['id'] > $lastEventId) {
                        echo "id: {$event['id']}\n";
                        echo "event: {$event['type']}\n";
                        echo "data: " . json_encode($event['data']) . "\n\n";
                        $lastEventId = $event['id'];
                    }
                }

                // Send a comment every 20 seconds to keep connection alive
                echo ": heartbeat\n\n";

                ob_flush();
                flush();

                sleep($checkInterval);
            }

        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}

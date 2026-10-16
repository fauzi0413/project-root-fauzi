<?php

namespace App\Providers;

use App\Models\Task;
use App\Models\TaskComment;
use App\Observers\TaskCommentObserver;
use App\Observers\TaskObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Task::observe(TaskObserver::class);
        TaskComment::observe(TaskCommentObserver::class);
    }
}


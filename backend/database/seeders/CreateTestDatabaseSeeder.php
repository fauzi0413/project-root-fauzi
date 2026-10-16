<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CreateTestDatabaseSeeder extends Seeder
{
    /**
     * Create test database if it doesn't exist.
     * Run: php artisan db:seed --class=Database\\Seeders\\CreateTestDatabaseSeeder
     */
    public function run(): void
    {
        $testDbName = config('database.connections.testing.database') ?? 'task_management_testing';
        
        // Only run when in testing environment to prevent accidents
        if (app()->environment('testing')) {
            return;
        }

        try {
            $defaultConnection = DB::connection('mysql');
            
            // Create testing database
            $defaultConnection->statement("CREATE DATABASE IF NOT EXISTS `{$testDbName}`;");
            
            echo "✓ Test database '{$testDbName}' created/verified successfully\n";
        } catch (\Exception $e) {
            echo "✗ Error creating test database: " . $e->getMessage() . "\n";
            throw $e;
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the users table.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ],
            [
                'name' => 'John Developer',
                'email' => 'john@example.com',
                'password' => Hash::make('password123'),
                'role' => 'member',
            ],
            [
                'name' => 'Sarah Designer',
                'email' => 'sarah@example.com',
                'password' => Hash::make('password123'),
                'role' => 'member',
            ],
            [
                'name' => 'Mike Manager',
                'email' => 'mike@example.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ],
            [
                'name' => 'Lisa Tester',
                'email' => 'lisa@example.com',
                'password' => Hash::make('password123'),
                'role' => 'member',
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Get list of users for task assignment and team overview.
     */
    public function index(): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'role')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($users, 200);
    }
}

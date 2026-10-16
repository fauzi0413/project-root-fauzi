<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'priority' => 'sometimes|in:low,medium,high',
            'assigned_user_id' => 'sometimes|nullable|exists:users,id',
            'due_date' => 'sometimes|nullable|date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.max' => 'Task title must not exceed 255 characters',
            'status.in' => 'Invalid status value',
            'priority.in' => 'Invalid priority value',
            'assigned_user_id.exists' => 'The selected user does not exist',
            'due_date.date' => 'Due date must be a valid date',
        ];
    }
}

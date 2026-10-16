import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_user_id: number | null;
  assigned_user?: { id: number; name: string; email: string } | null;
  assignee?: { id: number; name: string; email: string } | null;
  created_by: number;
  creator?: { id: number; name: string; email: string };
  due_date: string | null;
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: number;
  task_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  user?: { id: number; name: string; email: string };
  comment: string;
  created_at: string;
  updated_at: string;
}

export const useTasks = (page = 1, filters?: any) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '10',
        ...filters,
      });
      const response = await api.get(`/tasks?${params}`);
      setTasks(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, pagination, refetch: fetchTasks };
};

export const useTaskDetail = (taskId: number | null) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/tasks/${taskId}`);
      setTask(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch task');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return { task, loading, error, refetch: fetchTask };
};

export const useCreateTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/tasks', data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create task';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createTask, loading, error };
};

export const useUpdateTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTask = async (taskId: number, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/tasks/${taskId}`, data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update task';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateTask, loading, error };
};

export const useDeleteTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTask = async (taskId: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete task';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteTask, loading, error };
};

export interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export const useUsers = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
};


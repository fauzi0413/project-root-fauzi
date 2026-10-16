import { useEffect, useCallback } from 'react';

interface TaskEvent {
  id: number;
  type: 'task.created' | 'task.updated' | 'task.deleted' | 'comment.created' | 'comment.deleted';
  data: any;
  timestamp: string;
}

export const useSSE = (onEvent: (event: TaskEvent) => void) => {
  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const eventSource = new EventSource(`${baseUrl}/tasks/events`, {
      headers: { Authorization: `Bearer ${token}` },
    } as any);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEvent(data);
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };

    return () => eventSource.close();
  }, [onEvent]);

  useEffect(() => {
    const disconnect = connect();
    return () => disconnect?.();
  }, [connect]);
};

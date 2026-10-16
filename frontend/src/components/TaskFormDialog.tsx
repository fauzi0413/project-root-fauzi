'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task, useCreateTask, useUpdateTask, useUsers } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import FileDropzone from '@/components/FileDropzone';
import api from '@/lib/api';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSuccess: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export default function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSuccess,
}: TaskFormDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createTask, loading: createLoading } = useCreateTask();
  const { updateTask, loading: updateLoading } = useUpdateTask();
  const { users } = useUsers();
  const [formError, setFormError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assigned_user_id: string;
    due_date: string;
  }>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assigned_user_id: '',
    due_date: '',
  });

  useEffect(() => {
    setFormError(null);
    setFiles([]);
    if (task) {
      const assignedId =
        task.assigned_user_id !== undefined && task.assigned_user_id !== null
          ? task.assigned_user_id.toString()
          : task.assigned_user?.id
          ? task.assigned_user.id.toString()
          : task.assignee?.id
          ? task.assignee.id.toString()
          : '';

      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assigned_user_id: assignedId,
        due_date: task.due_date ? task.due_date.split(' ')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assigned_user_id: user?.role === 'member' ? user.id.toString() : '',
        due_date: '',
      });
    }
  }, [task, open, user]);

  const getAssigneeLabel = () => {
    if (!formData.assigned_user_id || formData.assigned_user_id === 'unassigned') {
      return 'Unassigned';
    }
    const found = users.find((u) => u.id.toString() === formData.assigned_user_id);
    if (found) {
      return `${found.name} (${found.role})`;
    }
    if (task?.assigned_user && task.assigned_user.id.toString() === formData.assigned_user_id) {
      return `${task.assigned_user.name}`;
    }
    if (task?.assignee && task.assignee.id.toString() === formData.assigned_user_id) {
      return `${task.assignee.name}`;
    }
    return 'Unassigned';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Task title is required');
      toast({ title: 'Error', description: 'Task title is required', variant: 'destructive' });
      return;
    }

    try {
      const payload: Record<string, any> = {
        title: formData.title.trim(),
        status: formData.status,
        priority: formData.priority,
      };

      if (formData.description && formData.description.trim()) {
        payload.description = formData.description.trim();
      }

      if (user?.role === 'member') {
        payload.assigned_user_id = user.id;
      } else if (formData.assigned_user_id) {
        payload.assigned_user_id = parseInt(formData.assigned_user_id);
      } else if (task) {
        payload.assigned_user_id = null;
      }

      if (formData.due_date && formData.due_date.trim()) {
        // Send in Y-m-d H:i:s format
        payload.due_date = formData.due_date.includes(' ')
          ? formData.due_date
          : `${formData.due_date} 23:59:59`;
      }

      let taskId = task?.id;

      if (task) {
        await updateTask(task.id, payload);
      } else {
        const created = await createTask(payload);
        taskId = created?.id;
      }

      // Upload queued attachments if any
      if (files.length > 0 && taskId) {
        setIsUploadingFiles(true);
        try {
          for (const file of files) {
            const formDataObj = new FormData();
            formDataObj.append('task_id', taskId.toString());
            formDataObj.append('file', file);
            await api.post(`/tasks/${taskId}/attachments`, formDataObj, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          }
        } catch (uploadErr: any) {
          console.error('File upload error:', uploadErr);
          toast({
            title: 'File upload warning',
            description: 'Task was saved, but some files could not be uploaded.',
            variant: 'destructive',
          });
        } finally {
          setIsUploadingFiles(false);
        }
      }

      toast({
        title: 'Success',
        description:
          files.length > 0
            ? `Task ${task ? 'updated' : 'created'} with ${files.length} attachment(s)`
            : `Task ${task ? 'updated' : 'created'} successfully`,
      });

      setFiles([]);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        (error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : null) ||
        error.message ||
        'Failed to save task';

      setFormError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const loading = createLoading || updateLoading || isUploadingFiles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {task ? 'Update task details and assignments' : 'Add a new task to your team workflow'}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="p-3 my-2 rounded-lg bg-destructive/15 border border-destructive/30 text-xs text-destructive flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement payment gateway"
              disabled={loading}
              className="bg-background text-sm h-10"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide context and requirements..."
              disabled={loading}
              className="bg-background text-sm min-h-[80px]"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-background text-sm h-10">
                  <SelectValue>{STATUS_LABELS[formData.status] || 'Select status'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Priority
              </label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger className="bg-background text-sm h-10">
                  <SelectValue>{PRIORITY_LABELS[formData.priority] || 'Select priority'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assign To
              </label>
              <Select
                value={formData.assigned_user_id || (user?.role === 'member' ? user.id.toString() : 'unassigned')}
                disabled={loading || user?.role === 'member'}
                onValueChange={(value) =>
                  setFormData({ ...formData, assigned_user_id: !value || value === 'unassigned' ? '' : value })
                }
              >
                <SelectTrigger className="bg-background text-sm h-10 disabled:opacity-80">
                  <SelectValue>{getAssigneeLabel()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {user?.role === 'member' && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  As a member, tasks are assigned to yourself.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Due Date
              </label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                disabled={loading}
                className="bg-background text-sm h-10"
              />
            </div>
          </div>

          {/* File Attachments Drag & Drop */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Attachments (Drag & Drop)
            </label>
            <FileDropzone
              files={files}
              onFilesChange={setFiles}
              disabled={loading}
              maxSizeMB={25}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border/60">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-primary text-primary-foreground gap-1.5"
            >
              {isUploadingFiles ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading {files.length} file(s)...</span>
                </>
              ) : loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : task ? (
                'Update Task'
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

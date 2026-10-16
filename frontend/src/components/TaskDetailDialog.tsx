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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useTaskDetail, useDeleteTask, Task } from '@/lib/hooks';
import { Trash2, Download, Upload, Send, AlertTriangle, Loader2, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number | null;
  onEdit?: (task: Task) => void;
  onSuccess: () => void;
}

export default function TaskDetailDialog({
  open,
  onOpenChange,
  taskId,
  onEdit,
  onSuccess,
}: TaskDetailDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { task, refetch: refetchTask } = useTaskDetail(taskId);
  const { deleteTask, loading: deleteLoading } = useDeleteTask();
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isCreator = task?.created_by?.id === user?.id;
  const isAssignee = task?.assigned_user_id === user?.id || task?.assignee?.id === user?.id;
  const canDelete = isAdmin || isCreator;
  const canEdit = onEdit && task && (isAdmin || isAssignee || isCreator);

  const handleDeleteTask = async () => {
    if (!task) return;
    try {
      await deleteTask(task.id);
      toast({ title: 'Success', description: 'Task deleted successfully' });
      setConfirmDeleteDialogOpen(false);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      await api.delete(`/attachments/${attachmentId}`);
      toast({ title: 'Success', description: 'Attachment deleted' });
      refetchTask();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete attachment',
        variant: 'destructive',
      });
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!task || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append('task_id', task.id.toString());
      formData.append('file', file);

      await api.post(`/tasks/${task.id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({ title: 'Success', description: 'File uploaded successfully' });
      refetchTask();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddComment = async () => {
    if (!task || !commentText.trim()) return;
    setIsSubmittingComment(true);

    try {
      await api.post(`/tasks/${task.id}/comments`, {
        comment: commentText,
      });
      toast({ title: 'Success', description: 'Comment added' });
      setCommentText('');
      refetchTask();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (!task) return null;

  const renderPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return <Badge variant="destructive">HIGH</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30">MEDIUM</Badge>;
      case 'low':
      default:
        return <Badge variant="secondary">LOW</Badge>;
    }
  };

  const renderStatusBadge = () => {
    switch (task.status) {
      case 'completed':
        return <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30">In Progress</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {renderPriorityBadge()}
            {renderStatusBadge()}
          </div>
          <DialogTitle className="text-xl font-bold text-foreground leading-snug">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Description */}
          {task.description && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Description</h3>
              <p className="text-foreground/90 text-sm whitespace-pre-wrap leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Task Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm p-4 rounded-lg bg-muted/20 border border-border/50">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Assigned To</p>
              <p className="text-foreground font-medium mt-1">{task.assigned_user?.name || task.assignee?.name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Due Date</p>
              <p className="text-foreground font-medium mt-1">
                {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}
              </p>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Attachments ({task.attachments?.length || 0})
              </h3>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-xs font-medium cursor-pointer transition border border-border shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  onChange={handleUploadFile}
                  disabled={uploadingFile}
                  className="hidden"
                />
              </label>
            </div>

            {task.attachments && task.attachments.length > 0 ? (
              <div className="space-y-2">
                {task.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 bg-muted/30 border border-border/60 rounded-lg hover:border-border transition"
                  >
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/attachments/${att.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline text-sm truncate flex-1 font-medium"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span className="truncate">{att.file_name}</span>
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAttachment(att.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No files attached yet.</p>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Comments ({task.comments?.length || 0})
            </h3>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-muted/30 border border-border/60 rounded-lg text-sm space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{comment.user?.name || 'User'}</span>
                      <span>{new Date(comment.created_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed text-sm">{comment.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No comments yet. Start the conversation!</p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                disabled={isSubmittingComment}
                className="bg-background text-sm min-h-[60px]"
              />
              <Button
                onClick={handleAddComment}
                disabled={isSubmittingComment || !commentText.trim()}
                className="self-end h-10 px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t border-border/60">
          {canDelete ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDeleteDialogOpen(true)}
              disabled={deleteLoading}
              className="gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Task
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit!(task!)}
                className="gap-1.5 text-xs font-medium"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Task
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Modern Delete Confirmation Dialog */}
    <Dialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
      <DialogContent className="max-w-md bg-card border border-border text-foreground p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/15 text-destructive flex items-center justify-center border border-destructive/25 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-lg font-bold text-foreground">
              Delete Task?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-foreground">&ldquo;{task?.title}&rdquo;</span>? This action cannot be undone and will permanently remove this task and its attachments.
            </DialogDescription>
          </div>

          <div className="flex w-full items-center justify-end gap-2.5 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteDialogOpen(false)}
              disabled={deleteLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteTask}
              disabled={deleteLoading}
              className="flex-1 gap-1.5"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Delete</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

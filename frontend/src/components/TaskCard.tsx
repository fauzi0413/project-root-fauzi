'use client';

import { Task } from '@/lib/hooks';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User as UserIcon, Clock, AlertTriangle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'completed';

  const renderPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return (
          <Badge variant="destructive" className="font-semibold text-[11px] px-2 py-0.5 tracking-wide">
            HIGH
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 font-semibold text-[11px] px-2 py-0.5 tracking-wide">
            MEDIUM
          </Badge>
        );
      case 'low':
      default:
        return (
          <Badge variant="secondary" className="font-semibold text-[11px] px-2 py-0.5 tracking-wide">
            LOW
          </Badge>
        );
    }
  };

  const renderStatusBadge = () => {
    switch (task.status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 text-[11px] font-medium px-2 py-0.5">
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 text-[11px] font-medium px-2 py-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            In Progress
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground border-border text-[11px] font-medium px-2 py-0.5">
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer border border-border/80 bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
    >
      <div className="p-5 space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {renderPriorityBadge()}
            {renderStatusBadge()}
          </div>
          {isOverdue && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-destructive">
              <AlertTriangle className="w-3.5 h-3.5" />
              Overdue
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span>
            {dueDate
              ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'No deadline'}
          </span>
        </div>

        {task.assigned_user || task.assignee ? (
          <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
            <div className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
              {(task.assigned_user?.name || task.assignee?.name || '').charAt(0).toUpperCase()}
            </div>
            <span className="truncate max-w-[110px]">{task.assigned_user?.name || task.assignee?.name}</span>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground/60 italic">Unassigned</span>
        )}
      </div>
    </Card>
  );
}

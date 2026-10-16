'use client';

import { useState, useMemo } from 'react';
import { useTasks, Task } from '@/lib/hooks';
import { useSSE } from '@/lib/useSSE';
import TaskCard from '@/components/TaskCard';
import TaskFormDialog from '@/components/TaskFormDialog';
import TaskDetailDialog from '@/components/TaskDetailDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const STATUS_LABELS: Record<string, string> = {
  all: 'All Status',
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const PRIORITY_LABELS: Record<string, string> = {
  all: 'All Priority',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const SORT_LABELS: Record<string, string> = {
  created_at: 'Created Date',
  due_date: 'Due Date',
};

const ORDER_LABELS: Record<string, string> = {
  desc: 'Descending',
  asc: 'Ascending',
};

export default function DashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const filters = useMemo(
    () => ({
      ...(search && { search }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(priorityFilter !== 'all' && { priority: priorityFilter }),
      ...(user?.role === 'member' && { assigned_user_id: user.id.toString() }),
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    [search, statusFilter, priorityFilter, user, sortBy, sortOrder]
  );

  const { tasks, loading, pagination, refetch } = useTasks(page, filters);

  const stats = useMemo(
    () => ({
      total: pagination.total,
      completed: tasks.filter((t) => t.status === 'completed').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      pending: tasks.filter((t) => t.status === 'pending').length,
    }),
    [tasks, pagination]
  );

  const hasActiveFilters = search !== '' || statusFilter !== 'all' || priorityFilter !== 'all' || sortBy !== 'created_at' || sortOrder !== 'desc';

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  const handleTaskClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setDetailDialogOpen(true);
  };

  // Real-time SSE listener
  useSSE((event) => {
    if (event.type === 'task.created' || event.type === 'task.updated' || event.type === 'task.deleted') {
      toast({
        title: 'Task Updated',
        description: `Task has been ${event.type.split('.')[1]}`,
      });
      refetch();
    } else if (event.type === 'comment.created' || event.type === 'comment.deleted') {
      if (detailDialogOpen && selectedTaskId) {
        // Handled inside TaskDetailDialog
      }
    }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <Card className="border border-border/70 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Tasks
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.role === 'member' ? 'Your assigned tasks' : 'All recorded items'}
            </p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="border border-border/70 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{stats.completed}</div>
            <p className="text-xs text-emerald-500/80 font-medium mt-1">
              {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% done` : 'No tasks yet'}
            </p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="border border-border/70 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              In Progress
            </CardTitle>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">Actively working</p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border border-border/70 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <AlertCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting start</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {user?.role === 'member' ? 'My Tasks' : 'Tasks'}
              </h2>
              <Badge variant="secondary" className="font-semibold text-xs px-2 py-0.5">
                {pagination.total} total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'member'
                ? 'Manage, prioritize, and track your assigned tasks'
                : 'Manage, prioritize, and track all your team assignments'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-9"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </Button>
            )}
            <Button
              onClick={() => {
                setEditingTask(null);
                setFormDialogOpen(true);
              }}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm h-9"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <Card className="p-3 border border-border/70 bg-card/60 backdrop-blur-xs shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 bg-background/60 text-sm"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (value) {
                  setStatusFilter(value);
                  setPage(1);
                }
              }}
            >
              <SelectTrigger className="h-9 bg-background/60 text-sm">
                <SelectValue>{STATUS_LABELS[statusFilter] || 'Status'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select
              value={priorityFilter}
              onValueChange={(value) => {
                if (value) {
                  setPriorityFilter(value);
                  setPage(1);
                }
              }}
            >
              <SelectTrigger className="h-9 bg-background/60 text-sm">
                <SelectValue>{PRIORITY_LABELS[priorityFilter] || 'Priority'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Field */}
            <Select
              value={sortBy}
              onValueChange={(value) => {
                if (value) setSortBy(value);
              }}
            >
              <SelectTrigger className="h-9 bg-background/60 text-sm">
                <SelectValue>{SORT_LABELS[sortBy] || 'Sort By'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Direction */}
            <Select
              value={sortOrder}
              onValueChange={(value) => {
                if (value) setSortOrder(value);
              }}
            >
              <SelectTrigger className="h-9 bg-background/60 text-sm">
                <SelectValue>{ORDER_LABELS[sortOrder] || 'Sort Order'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* Task List Section */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-5 border border-border/50 bg-card/40 animate-pulse space-y-4">
                <div className="flex gap-2">
                  <div className="w-14 h-5 bg-muted rounded-full" />
                  <div className="w-20 h-5 bg-muted rounded-full" />
                </div>
                <div className="w-3/4 h-5 bg-muted rounded" />
                <div className="w-full h-10 bg-muted/60 rounded" />
                <div className="w-1/2 h-4 bg-muted/40 rounded mt-4" />
              </Card>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <Card className="border border-border/80 border-dashed bg-card/40 p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">No tasks found</h3>
              <p className="text-sm text-muted-foreground text-center">
                {hasActiveFilters
                  ? 'No tasks matched your search or filters. Try adjusting your search query or reset filters.'
                  : 'Get started by creating your first task for the team.'}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2">
                  Reset Filters
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setFormDialogOpen(true)}
                  className="mt-2 gap-1.5 bg-primary text-primary-foreground"
                >
                  <Plus className="w-4 h-4" />
                  Create Task
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  Showing page <span className="font-semibold text-foreground">{page}</span> of{' '}
                  <span className="font-semibold text-foreground">{pagination.last_page}</span> ({pagination.total} tasks)
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="gap-1 h-8 px-3 text-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.last_page }, (_, idx) => idx + 1)
                      .filter((p) => p === 1 || p === pagination.last_page || Math.abs(p - page) <= 1)
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <div key={p} className="flex items-center">
                            {prev && p - prev > 1 && (
                              <span className="px-1 text-xs text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={p === page ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => setPage(p)}
                              className={`h-8 w-8 p-0 text-xs ${
                                p === page ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {p}
                            </Button>
                          </div>
                        );
                      })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pagination.last_page}
                    onClick={() => setPage(page + 1)}
                    className="gap-1 h-8 px-3 text-xs"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        onSuccess={() => {
          refetch();
        }}
      />

      <TaskDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        taskId={selectedTaskId}
        onEdit={(task) => {
          setDetailDialogOpen(false);
          setEditingTask(task);
          setFormDialogOpen(true);
        }}
        onSuccess={() => {
          refetch();
          setDetailDialogOpen(false);
        }}
      />
    </div>
  );
}

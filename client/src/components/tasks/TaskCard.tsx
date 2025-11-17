import { Task, taskService } from "@services/taskService";
import { Card, CardContent } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { getPriorityColor, getStatusColor, formatDate } from "@utils/helpers";
import { Trash2, ChevronRight, Edit2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@hooks/useAuth";
import { EditTaskDialog } from "../dialogs/EditTaskDialog";

interface TaskCardProps {
  task: Task;
  onTaskUpdated: () => void;
}

export function TaskCard({ task, onTaskUpdated }: TaskCardProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const statusOptions = [
    { value: "TODO" as const, label: "To Do" },
    { value: "IN_PROGRESS" as const, label: "In Progress" },
    { value: "DONE" as const, label: "Done" },
  ];

  const handleStatusChange = async (
    newStatus: "TODO" | "IN_PROGRESS" | "DONE",
  ) => {
    if (newStatus === task.status) {
      setShowStatusMenu(false);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const response = await taskService.update(task._id, {
        status: newStatus,
      });
      if (response.success) {
        setShowStatusMenu(false);
        onTaskUpdated();
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this task?")) return;

    setIsDeleting(true);
    try {
      const response = await taskService.delete(task._id);
      if (response.success) {
        onTaskUpdated();
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine if current user can delete: ADMIN can delete any, otherwise only creator can delete
  const canDelete = (() => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    // check createdBy
    if (task.createdBy && task.createdBy._id) {
      return task.createdBy._id === user._id;
    }
    return false;
  })();

  return (
    <Card className="hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
      <CardContent className="pt-4 space-y-3 select-none">
        <h3 className="font-semibold text-foreground">{task.title}</h3>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>

          {/* Status Badge with Dropdown */}
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusMenu(!showStatusMenu);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                task.status,
              )} hover:opacity-80 transition-opacity`}
              disabled={isUpdatingStatus}
            >
              {task.status === "IN_PROGRESS" ? "In Progress" : task.status}
              <ChevronRight className="h-3 w-3" />
            </button>

            {/* Status dropdown menu */}
            {showStatusMenu && (
              <div className="absolute top-full mt-1 left-0 bg-white dark:bg-slate-800 border border-border rounded-lg shadow-lg z-10 min-w-[140px]">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={isUpdatingStatus || option.value === task.status}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg last:rounded-b-lg ${
                      option.value === task.status
                        ? "bg-muted font-semibold"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {task.assignedTo && (
          <p className="text-sm text-muted-foreground">
            Assigned to: {task.assignedTo.name}
          </p>
        )}

        {task.dueDate && (
          <p className="text-sm text-muted-foreground">
            Due: {formatDate(task.dueDate)}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setEditDialogOpen(true);
            }}
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
            onTouchStart={(e: React.TouchEvent) => e.stopPropagation()}
            title="Edit task"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleDelete(e);
              }}
              onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
              onTouchStart={(e: React.TouchEvent) => e.stopPropagation()}
              disabled={isDeleting}
              title="Delete task"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "..." : "Delete"}
            </Button>
          )}
        </div>

        <EditTaskDialog
          task={task}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={onTaskUpdated}
        />
      </CardContent>
    </Card>
  );
}

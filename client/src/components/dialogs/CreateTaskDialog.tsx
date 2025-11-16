import { useState, useEffect } from "react";
import { taskService } from "@services/taskService";
import teamService from "@services/teamService";
import { useAuth } from "@hooks/useAuth";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Label } from "@components/ui/Label";
import { Textarea } from "@components/ui/Textarea";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface CreateTaskDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTaskDialog({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: CreateTaskDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    assignedTo: "",
  });

  useEffect(() => {
    if (open && user && teamMembers.length === 0) {
      fetchTeamMembers();
    }
  }, [open, user]);

  const fetchTeamMembers = async () => {
    try {
      const response = await teamService.getMembers();
      if (response.success) {
        setTeamMembers(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const taskData: any = {
        title: formData.title,
        description: formData.description,
        projectId,
        priority: formData.priority as "LOW" | "MEDIUM" | "HIGH",
        dueDate: formData.dueDate || undefined,
      };

      // Only add assignedTo if the user has permission (ADMIN or MANAGER)
      const canAssign = user?.role === "ADMIN" || user?.role === "MANAGER";
      if (canAssign && formData.assignedTo) {
        taskData.assignedTo = formData.assignedTo;
      }

      const response = await taskService.create(taskData);

      if (response.success) {
        console.log("Task created successfully:", response.data);
        setFormData({
          title: "",
          description: "",
          priority: "MEDIUM",
          dueDate: "",
          assignedTo: "",
        });
        onOpenChange(false);
        // Small delay to ensure backend has time to persist
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create task";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Task title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Task description..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                title="Select task priority"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            {user && (user.role === "ADMIN" || user.role === "MANAGER") ? (
              <>
                <Label htmlFor="assignedTo">Assign To</Label>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  title="Select team member to assign task"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Assigning tasks is available to Managers and Admins only.
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </div>
  );
}

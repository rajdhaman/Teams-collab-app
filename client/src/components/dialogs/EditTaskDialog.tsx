import { useState, useEffect } from "react";
import { Task, taskService } from "@services/taskService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Label } from "@components/ui/Label";
import { Textarea } from "@components/ui/Textarea";
import { useAuth } from "@hooks/useAuth";
import teamService from "@services/teamService";

interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  teamMembers?: Array<{ _id: string; name: string; email: string }>;
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  onSuccess,
  teamMembers = [],
}: EditTaskDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState(teamMembers);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    dueDate: "",
    assignedTo: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "MEDIUM",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        assignedTo: task.assignedTo?._id || "",
      });
    }
  }, [task, open]);

  // Fetch team members if not provided
  useEffect(() => {
    if (members.length === 0 && open) {
      const fetchMembers = async () => {
        try {
          const data = await teamService.getMembers();
          if (Array.isArray(data)) {
            setMembers(data);
          }
        } catch (error) {
          console.error("Failed to fetch team members:", error);
        }
      };
      fetchMembers();
    }
  }, [open, members.length]);

  const handleSave = async () => {
    if (!task) return;

    setLoading(true);
    try {
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate,
      };

      // Only add assignedTo if user is ADMIN or MANAGER
      const canAssign = user?.role === "ADMIN" || user?.role === "MANAGER";
      if (canAssign) {
        updateData.assignedTo = formData.assignedTo || null;
      }

      const response = await taskService.update(task._id, updateData);
      if (response.success) {
        onOpenChange(false);
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <p className="text-sm text-gray-500">
            Update task details and assignment
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Task title"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Task description"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                title="Select task priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as "LOW" | "MEDIUM" | "HIGH",
                  })
                }
                className="w-full px-3 py-2 rounded border border-input bg-background text-foreground"
                disabled={loading}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>

          {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
            <div>
              <Label htmlFor="assignedTo">Assign To</Label>
              <select
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
                className="w-full px-3 py-2 rounded border border-input bg-background text-foreground"
                disabled={loading}
                title="Select team member to assign task"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !formData.title}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

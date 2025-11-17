import { useState, useEffect } from "react";
import { Project, projectService } from "@services/projectService";
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

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSuccess: () => void;
}

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: EditProjectDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (project && open) {
      setFormData({
        name: project.name,
        description: project.description || "",
      });
      setError(null);
    }
  }, [project, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setError(null);
    setLoading(true);

    try {
      const response = await projectService.update(project._id, formData);
      if (response.success) {
        onOpenChange(false);
        onSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update project";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    if (
      !confirm(
        "Are you sure you want to delete this project? This cannot be undone.",
      )
    )
      return;

    setDeleting(true);
    setError(null);

    try {
      const response = await projectService.delete(project._id);
      if (response.success) {
        onOpenChange(false);
        onSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete project";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  if (!open || !project) return null;

  const isAdmin = user?.role === "ADMIN";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="My Project"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Project description..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || deleting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || deleting}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            {isAdmin && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading || deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </div>
  );
}

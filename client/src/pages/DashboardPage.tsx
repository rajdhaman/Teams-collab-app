import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { projectService, Project } from "@services/projectService";
import { Button } from "@components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/Card";
import { Sidebar } from "@components/layout/Sidebar";
import { Header } from "@components/layout/Header";
import { CreateProjectDialog } from "@components/dialogs/CreateProjectDialog";
import { EditProjectDialog } from "@components/dialogs/EditProjectDialog";
import { useAuth } from "@hooks/useAuth";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, setProjects } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/kanban/${projectId}`);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditDialog(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This cannot be undone."
      )
    )
      return;

    try {
      setLoading(true);
      const response = await projectService.delete(projectId);
      if (response.success) {
        loadProjects();
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Projects
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                  Manage your team's projects and tasks
                </p>
              </div>
              {user && (user.role === "ADMIN" || user.role === "MANAGER") && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                >
                  + New Project
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : projects.length === 0 ? (
              <Card className="border-2 border-dashed border-blue-300 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <p className="text-slate-600 dark:text-slate-300 text-lg mb-4">
                      No projects yet
                    </p>
                    {user &&
                    (user.role === "ADMIN" || user.role === "MANAGER") ? (
                      <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      >
                        Create Your First Project
                      </Button>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Ask a Manager or Admin to create a project.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project: Project) => (
                  <Card
                    key={project._id}
                    className="hover:shadow-xl hover:scale-105 transition-all border-0 bg-white dark:bg-slate-800 rounded-xl overflow-hidden group"
                  >
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900 dark:text-white">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        {project.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Created by{" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {project.createdBy.name}
                          </span>
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            onClick={() => handleViewProject(project._id)}
                          >
                            View
                          </Button>
                          {user &&
                            (user.role === "ADMIN" ||
                              user.role === "MANAGER") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                onClick={() => handleEditProject(project)}
                              >
                                Edit
                              </Button>
                            )}
                          {user && user.role === "ADMIN" && (
                            <Button
                              size="sm"
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => handleDeleteProject(project._id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadProjects}
      />

      <EditProjectDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        project={selectedProject}
        onSuccess={loadProjects}
      />
    </div>
  );
}

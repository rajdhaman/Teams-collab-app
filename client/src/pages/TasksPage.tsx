import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@components/layout/Sidebar";
import { Header } from "@components/layout/Header";
import { Button } from "@components/ui/Button";
import { Card, CardContent } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { taskService, Task } from "@services/taskService";
import { ChevronDown } from "lucide-react";

export default function TasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectMap, setProjectMap] = useState<
    Record<string, { name: string; id: string }>
  >({});
  const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasksAndProjects();
  }, []);

  const loadTasksAndProjects = async () => {
    try {
      setLoading(true);

      // Load all tasks (now includes project info from backend)
      const tasksResponse = await taskService.getAll();
      if (tasksResponse.success) {
        // Build project map for quick lookup
        const map: Record<string, { name: string; id: string }> = {};
        tasksResponse.data.forEach((task) => {
          const projectId =
            typeof task.projectId === "string"
              ? task.projectId
              : task.projectId._id;
          const projectName =
            typeof task.projectId === "string"
              ? "Unknown Project"
              : task.projectId.name;

          if (!map[projectId]) {
            map[projectId] = { name: projectName, id: projectId };
          }
        });
        setProjectMap(map);
        setTasks(tasksResponse.data);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200";
      case "DONE":
        return "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200";
      case "HIGH":
        return "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleTaskClick = (task: Task) => {
    // Navigate to the project's Kanban board
    const projectId =
      typeof task.projectId === "string" ? task.projectId : task.projectId._id;

    if (projectId) {
      navigate(`/kanban/${projectId}`);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: "TODO" | "IN_PROGRESS" | "DONE"
  ) => {
    setUpdatingTaskId(taskId);
    try {
      await taskService.update(taskId, { status: newStatus });
      // Update local state
      setTasks(
        tasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
      setStatusMenuOpen(null);
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-12">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Tasks
              </h1>
              <p className="text-muted-foreground">
                View all tasks across your projects
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : tasks.length === 0 ? (
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No tasks yet. Create a project and add tasks to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <Card
                    key={task._id}
                    className="cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all bg-white dark:bg-slate-800 border-l-4 border-l-blue-500 dark:border-l-blue-400"
                    onClick={() => handleTaskClick(task)}
                  >
                    <CardContent className="pt-6 pb-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {task.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const projectId =
                                typeof task.projectId === "string"
                                  ? task.projectId
                                  : task.projectId._id;
                              const projectName =
                                typeof task.projectId === "string"
                                  ? projectMap[projectId]?.name
                                  : task.projectId.name;

                              return (
                                projectName && (
                                  <Badge variant="outline">{projectName}</Badge>
                                )
                              );
                            })()}

                            {/* Status Dropdown */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStatusMenuOpen(
                                    statusMenuOpen === task._id
                                      ? null
                                      : task._id
                                  );
                                }}
                                disabled={updatingTaskId === task._id}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border-0 shadow-sm hover:shadow-md transition-all ${getStatusColor(
                                  task.status
                                )} hover:opacity-80 transition-opacity disabled:opacity-50`}
                              >
                                {task.status === "IN_PROGRESS"
                                  ? "In Progress"
                                  : task.status}
                                <ChevronDown className="h-3 w-3" />
                              </button>

                              {statusMenuOpen === task._id && (
                                <div className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-10 min-w-[140px] overflow-hidden">
                                  {[
                                    { value: "TODO" as const, label: "To Do" },
                                    {
                                      value: "IN_PROGRESS" as const,
                                      label: "In Progress",
                                    },
                                    { value: "DONE" as const, label: "Done" },
                                  ].map((option) => (
                                    <button
                                      key={option.value}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (option.value !== task.status) {
                                          handleStatusChange(
                                            task._id,
                                            option.value
                                          );
                                        }
                                      }}
                                      disabled={updatingTaskId === task._id}
                                      className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
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

                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            {task.assignedTo && (
                              <Badge variant="outline">
                                {task.assignedTo.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end">
                          {task.dueDate && (
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          )}
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskClick(task);
                            }}
                          >
                            Open →
                          </Button>
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
    </div>
  );
}

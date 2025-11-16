import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DragStart,
  DragUpdate,
} from "@hello-pangea/dnd";
import { taskService, Task } from "@services/taskService";
import { Sidebar } from "@components/layout/Sidebar";
import { Header } from "@components/layout/Header";
import { TaskCard } from "@components/tasks/TaskCard";
import { Button } from "@components/ui/Button";
import { CreateTaskDialog } from "@components/dialogs/CreateTaskDialog";
import { useSocket } from "@hooks/useSocket";

interface DragState {
  isDragging: boolean;
  sourceColumn: string | null;
  draggedTaskId: string | null;
}

export default function KanbanPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { on, off } = useSocket();
  const [tasks, setTasks] = useState<Record<string, Task[]>>({
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  });
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    sourceColumn: null,
    draggedTaskId: null,
  });

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  useEffect(() => {
    // Listen for task updates via socket
    const handleTaskChanged = () => {
      loadTasks();
    };

    const handleTaskRemoved = () => {
      loadTasks();
    };

    on("task-changed", handleTaskChanged);
    on("task-removed", handleTaskRemoved);

    return () => {
      off("task-changed", handleTaskChanged);
      off("task-removed", handleTaskRemoved);
    };
  }, [on, off]);

  const loadTasks = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const response = await taskService.getAll(projectId);
      if (response.success) {
        const grouped: Record<string, Task[]> = {
          TODO: [],
          IN_PROGRESS: [],
          DONE: [],
        };
        response.data.forEach((task) => {
          grouped[task.status].push(task);
        });
        setTasks(grouped);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = useCallback((result: DragStart) => {
    const { source, draggableId } = result;
    setDragState({
      isDragging: true,
      sourceColumn: source.droppableId,
      draggedTaskId: draggableId,
    });
  }, []);

  const handleDragUpdate = useCallback((_result: DragUpdate) => {
    // Can be used for real-time feedback like changing column highlight
    // This is called as the user drags
  }, []);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;

      // Reset drag state
      setDragState({
        isDragging: false,
        sourceColumn: null,
        draggedTaskId: null,
      });

      if (
        !destination ||
        (source.droppableId === destination.droppableId &&
          source.index === destination.index)
      ) {
        return;
      }

      const task =
        tasks[source.droppableId as keyof typeof tasks][source.index];

      try {
        // Optimistic update
        const newTasks = { ...tasks };
        newTasks[source.droppableId as keyof typeof tasks].splice(
          source.index,
          1
        );
        newTasks[destination.droppableId as keyof typeof tasks].splice(
          destination.index,
          0,
          task
        );
        setTasks(newTasks);

        // Update on server
        await taskService.update(draggableId, {
          status: destination.droppableId as "TODO" | "IN_PROGRESS" | "DONE",
        });
        // Reload tasks from server to ensure UI is up-to-date
        loadTasks();
      } catch (error) {
        console.error("Failed to update task:", error);
        loadTasks();
      }
    },
    [tasks]
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Kanban Board
                </h1>
                <p className="text-muted-foreground">
                  Organize and track your team's work
                </p>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                + Add Task
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DragDropContext
                onDragStart={handleDragStart}
                onDragUpdate={handleDragUpdate}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {["TODO", "IN_PROGRESS", "DONE"].map((status) => (
                    <div key={status} className="flex flex-col">
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 flex-1 flex flex-col shadow-md hover:shadow-lg transition-shadow">
                        <div className="mb-6 pb-4 border-b-2 border-gradient-to-r from-blue-400 to-purple-400 dark:border-purple-600">
                          <h2 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            {status === "IN_PROGRESS" ? "In Progress" : status}
                          </h2>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {tasks[status as keyof typeof tasks].length} task
                            {tasks[status as keyof typeof tasks].length !== 1
                              ? "s"
                              : ""}
                          </p>
                        </div>
                        <Droppable droppableId={status}>
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`flex-1 space-y-3 rounded-lg p-4 min-h-[500px] transition-all duration-200 ${
                                snapshot.isDraggingOver
                                  ? "bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 ring-2 ring-blue-400 shadow-inner"
                                  : "bg-slate-100/50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700"
                              } ${dragState.isDragging ? "cursor-grab" : ""}`}
                            >
                              {tasks[status as keyof typeof tasks].map(
                                (task, index) => (
                                  <Draggable
                                    key={task._id}
                                    draggableId={task._id}
                                    index={index}
                                    isDragDisabled={false}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        style={
                                          provided.draggableProps
                                            .style as React.CSSProperties
                                        }
                                        className={`transition-all duration-200 ${
                                          snapshot.isDragging
                                            ? "opacity-50 shadow-2xl scale-105 rotate-3"
                                            : ""
                                        } ${
                                          dragState.draggedTaskId ===
                                            task._id &&
                                          dragState.sourceColumn === status
                                            ? "opacity-60"
                                            : ""
                                        }`}
                                      >
                                        <div
                                          {...provided.dragHandleProps}
                                          className="hover:cursor-grab active:cursor-grabbing"
                                        >
                                          <TaskCard
                                            task={task}
                                            onTaskUpdated={loadTasks}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                )
                              )}
                              {provided.placeholder}
                              {tasks[status as keyof typeof tasks].length ===
                                0 && (
                                <div className="flex items-center justify-center h-32 text-muted-foreground rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/20">
                                  <p>Drop tasks here</p>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  ))}
                </div>
              </DragDropContext>
            )}
          </div>
        </main>
      </div>

      <CreateTaskDialog
        projectId={projectId || ""}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadTasks}
      />
    </div>
  );
}

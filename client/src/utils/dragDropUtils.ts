/**
 * Drag and Drop Utilities for Kanban Board
 * Provides helper functions for drag-and-drop operations with React Beautiful DnD
 */

import { Task } from "@services/taskService";

/**
 * Reorder tasks within the same column
 */
export const reorderTasks = (
  list: Task[],
  startIndex: number,
  endIndex: number
): Task[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

/**
 * Move task from one column to another
 */
export const moveTask = (
  source: Task[],
  destination: Task[],
  droppableSource: { index: number },
  droppableDestination: { index: number }
): { source: Task[]; destination: Task[] } => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  return {
    source: sourceClone,
    destination: destClone,
  };
};

/**
 * Validates if a task can be dropped at the destination
 */
export const canDropTask = (
  taskStatus: "TODO" | "IN_PROGRESS" | "DONE",
  destinationStatus: string
): boolean => {
  const validTransitions: Record<"TODO" | "IN_PROGRESS" | "DONE", string[]> = {
    TODO: ["TODO", "IN_PROGRESS"],
    IN_PROGRESS: ["TODO", "IN_PROGRESS", "DONE"],
    DONE: ["DONE", "IN_PROGRESS"],
  };

  return validTransitions[taskStatus]?.includes(destinationStatus) ?? false;
};

/**
 * Get drag-over styling based on column status
 */
export const getDragOverStyle = (
  isDraggingOver: boolean,
  isDraggingWithin: boolean
): string => {
  if (isDraggingOver && isDraggingWithin) {
    return "bg-green-50 dark:bg-green-900 ring-2 ring-green-400";
  }
  if (isDraggingOver) {
    return "bg-blue-50 dark:bg-blue-900 ring-2 ring-blue-400";
  }
  return "bg-muted/30";
};

/**
 * Get drag preview styling based on drag state
 */
export const getDragPreviewStyle = (
  isDragging: boolean,
  isDraggingWithin: boolean
): string => {
  if (isDragging) {
    return isDraggingWithin
      ? "opacity-50 shadow-2xl scale-105 rotate-3"
      : "opacity-30 shadow-2xl scale-105 rotate-3";
  }
  return "";
};

/**
 * Format task count with proper grammar
 */
export const formatTaskCount = (count: number): string => {
  return `${count} task${count !== 1 ? "s" : ""}`;
};

/**
 * Get status color for visual feedback
 */
export const getStatusColor = (
  status: "TODO" | "IN_PROGRESS" | "DONE"
): string => {
  switch (status) {
    case "TODO":
      return "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200";
    case "IN_PROGRESS":
      return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
    case "DONE":
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
    default:
      return "";
  }
};

/**
 * Check if drag operation resulted in actual change
 */
export const isDragResultValid = (
  sourceId: string,
  destinationId: string | undefined,
  sourceIndex: number,
  destinationIndex: number | undefined
): boolean => {
  return (
    !!destinationId &&
    (sourceId !== destinationId || sourceIndex !== destinationIndex)
  );
};

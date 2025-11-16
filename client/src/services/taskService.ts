import api from "./api";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  projectId: string | { _id: string; name: string };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  // creator of the task
  createdBy?: {
    _id: string;
    name?: string;
    email?: string;
  };
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  assignedTo?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  assignedTo?: string;
  position?: number;
}

export const taskService = {
  async getAll(
    projectId?: string
  ): Promise<{ success: boolean; data: Task[] }> {
    const response = await api.get("/tasks", {
      params: { projectId },
    });
    // Normalize response to handle both direct data and wrapped data
    return {
      success: response.data.success ?? true,
      data: response.data.data ?? response.data,
    };
  },

  async getById(id: string): Promise<{ success: boolean; data: Task }> {
    const response = await api.get(`/tasks/${id}`);
    return {
      success: response.data.success ?? true,
      data: response.data.data ?? response.data,
    };
  },

  async create(
    data: CreateTaskRequest
  ): Promise<{ success: boolean; data: Task }> {
    const response = await api.post("/tasks", data);
    return {
      success: response.data.success ?? true,
      data: response.data.data ?? response.data,
    };
  },

  async update(
    id: string,
    data: UpdateTaskRequest
  ): Promise<{ success: boolean; data: Task }> {
    const response = await api.put(`/tasks/${id}`, data);
    return {
      success: response.data.success ?? true,
      data: response.data.data ?? response.data,
    };
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

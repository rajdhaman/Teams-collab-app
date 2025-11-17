import api from "./api";

export interface Project {
  _id: string;
  name: string;
  description?: string;
  teamId: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: "ACTIVE" | "ARCHIVED" | "COMPLETED";
}

export const projectService = {
  async getAll(): Promise<{ success: boolean; data: Project[] }> {
    const response = await api.get("/projects");
    return response.data;
  },

  async getById(id: string): Promise<{ success: boolean; data: Project }> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async create(
    data: CreateProjectRequest,
  ): Promise<{ success: boolean; data: Project }> {
    const response = await api.post("/projects", data);
    return response.data;
  },

  async update(
    id: string,
    data: UpdateProjectRequest,
  ): Promise<{ success: boolean; data: Project }> {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

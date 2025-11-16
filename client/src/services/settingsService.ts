import api from "./api";

export interface UserSettings {
  email: string;
  name: string;
  profilePicture?: string;
  notifications?: {
    emailNotifications: boolean;
    taskAssignmentNotifications: boolean;
  };
}

export interface TeamSettings {
  name: string;
  description?: string;
}

export const settingsService = {
  async getUserSettings(): Promise<{ success: boolean; data: UserSettings }> {
    const response = await api.get("/settings/user");
    return response.data;
  },

  async updateUserSettings(
    data: Partial<UserSettings>
  ): Promise<{ success: boolean; data: UserSettings }> {
    const response = await api.put("/settings/user", data);
    return response.data;
  },

  async getTeamSettings(): Promise<{ success: boolean; data: TeamSettings }> {
    const response = await api.get("/settings/team");
    return response.data;
  },

  async updateTeamSettings(
    data: Partial<TeamSettings>
  ): Promise<{ success: boolean; data: TeamSettings }> {
    const response = await api.put("/settings/team", data);
    return response.data;
  },

  async deleteAccount(): Promise<{ success: boolean }> {
    const response = await api.delete("/settings/user");
    return response.data;
  },
};

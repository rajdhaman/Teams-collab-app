import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const teamService = {
  getMembers: async () => {
    try {
      const response = await axios.get(`${API_URL}/teams/members`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("idToken")}`,
        },
      });
      // Normalize to return the actual data payload
      return response.data.data ?? response.data;
    } catch (error) {
      console.error("Failed to fetch team members:", error);
      throw error;
    }
  },

  getTeamInfo: async () => {
    try {
      const response = await axios.get(`${API_URL}/teams`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("idToken")}`,
        },
      });
      // Server responds with { success: true, data: { ... } }
      // Return the inner data object for convenience
      return response.data.data ?? response.data;
    } catch (error) {
      console.error("Failed to fetch team info:", error);
      throw error;
    }
  },

  updateMemberRole: async (
    memberId: string,
    role: "ADMIN" | "MANAGER" | "MEMBER",
  ) => {
    try {
      const response = await axios.put(
        `${API_URL}/teams/members/${memberId}`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update member role:", error);
      throw error;
    }
  },

  removeMember: async (memberId: string) => {
    try {
      const response = await axios.delete(
        `${API_URL}/teams/members/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to remove member:", error);
      throw error;
    }
  },
};

export default teamService;

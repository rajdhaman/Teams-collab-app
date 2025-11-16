import api from "./api";

export interface Message {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
  };
  teamId: string;
  messageType: "TEXT" | "SYSTEM" | "NOTIFICATION";
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  content: string;
  messageType?: "TEXT" | "SYSTEM" | "NOTIFICATION";
}

export const messageService = {
  async getMessages(
    limit: number = 50,
    skip: number = 0
  ): Promise<{
    success: boolean;
    data: Message[];
  }> {
    const response = await api.get("/messages", {
      params: { limit, skip },
    });
    return response.data;
  },

  async sendMessage(data: SendMessageRequest): Promise<{
    success: boolean;
    data: Message;
  }> {
    const response = await api.post("/messages", data);
    return response.data;
  },

  async deleteMessage(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },

  async markAsRead(id: string): Promise<{ success: boolean }> {
    const response = await api.put(`/messages/${id}/read`);
    return response.data;
  },
};

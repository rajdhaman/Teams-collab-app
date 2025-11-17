import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { authService } from "@services/authService";

const SOCKET_URL =
  (import.meta as any).env?.VITE_SOCKET_URL || "http://localhost:3001";

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const token = authService.getStoredToken();
    const user = authService.getStoredUser();

    if (!token || !user) return;

    socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      setIsConnected(true);
      if (user.teamId) {
        // Extract teamId string if it's an object (populated from backend)
        const teamId =
          typeof user.teamId === "string"
            ? user.teamId
            : (user.teamId as any)._id;
        socket?.emit("join-team", {
          teamId,
          userId: user._id,
        });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("user-typing", () => {
      setIsTyping(true);
    });

    socket.on("user-stopped-typing", () => {
      setIsTyping(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, []);

  const on = useCallback(
    (event: string, callback: (...args: unknown[]) => void) => {
      if (socket) {
        socket.on(event, callback);
      }
      return () => {
        if (socket) {
          socket.off(event, callback);
        }
      };
    },
    [],
  );

  const off = useCallback(
    (event: string, callback?: (...args: unknown[]) => void) => {
      if (socket) {
        if (callback) {
          socket.off(event, callback);
        } else {
          socket.off(event);
        }
      }
    },
    [],
  );

  return {
    socket,
    isConnected,
    isTyping,
    emit,
    on,
    off,
  };
};

export const getSocket = (): Socket | null => socket;

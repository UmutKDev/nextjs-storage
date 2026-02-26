"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/Constants/API.constant";
import type {
  NotificationPayload,
  UseNotificationsOptions,
  UseNotificationsReturn,
} from "../types/notification.types";

export function useNotifications(
  options: UseNotificationsOptions = {},
): UseNotificationsReturn {
  const { enabled = true, sessionId, onNotification } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  useEffect(() => {
    if (!enabled || !sessionId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socket = io(`${API_URL}/notifications`, {
      auth: { SessionId: sessionId },
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      if (process.env.NODE_ENV === "development") {
        console.log("[Notifications] Connected:", socket.id);
      }
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      if (process.env.NODE_ENV === "development") {
        console.log("[Notifications] Disconnected:", reason);
      }
    });

    socket.on("connect_error", (error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("[Notifications] Connection error:", error.message);
      }
    });

    socket.on("notification", (payload: NotificationPayload) => {
      onNotificationRef.current?.(payload);
    });

    socket.io.on("reconnect", (attemptNumber) => {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Notifications] Reconnected after ${attemptNumber} attempts`,
        );
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, sessionId]);

  return { isConnected };
}

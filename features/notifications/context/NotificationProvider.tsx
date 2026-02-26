"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useNotifications } from "../hooks/useNotifications";
import {
  NotificationType,
  type NotificationPayload,
} from "../types/notification.types";

interface NotificationContextValue {
  isConnected: boolean;
}

const NotificationContext =
  React.createContext<NotificationContextValue | null>(null);

function showNotificationToast(payload: NotificationPayload): void {
  const { Type, Title, Message } = payload;

  switch (Type) {
    case NotificationType.ERROR:
    case NotificationType.RATE_LIMIT:
    case NotificationType.QUOTA_EXCEEDED:
    case NotificationType.UPLOAD_FAILED:
      toast.error(Title, { description: Message });
      break;

    case NotificationType.QUOTA_WARNING:
      toast.warning(Title, { description: Message });
      break;

    case NotificationType.UPLOAD_COMPLETE:
    case NotificationType.FILE_DELETED:
    case NotificationType.FILE_MOVED:
    case NotificationType.TEAM_INVITATION_ACCEPTED:
    case NotificationType.SUBSCRIPTION_CHANGED:
      toast.success(Title, { description: Message });
      break;

    case NotificationType.TEAM_INVITATION_RECEIVED:
    case NotificationType.TEAM_INVITATION_DECLINED:
    case NotificationType.SUBSCRIPTION_CANCELLED:
      toast.info(Title, { description: Message });
      break;

    default:
      toast(Title, { description: Message });
      break;
  }
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const sessionId = session?.sessionId ?? session?.user?.sessionId ?? null;

  const { isConnected } = useNotifications({
    enabled: isAuthenticated,
    sessionId,
    onNotification: showNotificationToast,
  });

  return (
    <NotificationContext.Provider value={{ isConnected }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  }
  return context;
}

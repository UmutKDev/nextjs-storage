"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useNotifications } from "../hooks/useNotifications";
import {
  NotificationType,
  type NotificationPayload,
  type NotificationSubscriber,
} from "../types/notification.types";

interface NotificationContextValue {
  isConnected: boolean;
  subscribe: (fn: NotificationSubscriber) => () => void;
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
    case NotificationType.ARCHIVE_CREATE_FAILED:
    case NotificationType.ARCHIVE_EXTRACT_FAILED:
    case NotificationType.DUPLICATE_SCAN_FAILED:
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
    case NotificationType.ARCHIVE_CREATE_COMPLETE:
    case NotificationType.ARCHIVE_EXTRACT_COMPLETE:
    case NotificationType.DUPLICATE_SCAN_COMPLETE:
      toast.success(Title, { description: Message });
      break;

    case NotificationType.TEAM_INVITATION_RECEIVED:
    case NotificationType.TEAM_INVITATION_DECLINED:
    case NotificationType.SUBSCRIPTION_CANCELLED:
    case NotificationType.DUPLICATE_SCAN_CANCELLED:
      toast.info(Title, { description: Message });
      break;

    case NotificationType.ARCHIVE_CREATE_PROGRESS:
    case NotificationType.ARCHIVE_EXTRACT_PROGRESS:
    case NotificationType.DUPLICATE_SCAN_PROGRESS:
      return;

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

  const subscribersRef = React.useRef(new Set<NotificationSubscriber>());

  React.useEffect(() => {
    subscribersRef.current.add(showNotificationToast);
    return () => {
      subscribersRef.current.delete(showNotificationToast);
    };
  }, []);

  const { isConnected } = useNotifications({
    enabled: isAuthenticated,
    sessionId,
    subscribersRef,
  });

  const subscribe = React.useCallback((fn: NotificationSubscriber) => {
    subscribersRef.current.add(fn);
    return () => {
      subscribersRef.current.delete(fn);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ isConnected, subscribe }}>
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

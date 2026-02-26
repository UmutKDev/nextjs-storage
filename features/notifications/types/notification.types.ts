export enum NotificationType {
  // File Operations
  UPLOAD_COMPLETE = "UPLOAD_COMPLETE",
  UPLOAD_FAILED = "UPLOAD_FAILED",
  FILE_DELETED = "FILE_DELETED",
  FILE_MOVED = "FILE_MOVED",

  // Quota
  QUOTA_WARNING = "QUOTA_WARNING",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",

  // Team
  TEAM_INVITATION_RECEIVED = "TEAM_INVITATION_RECEIVED",
  TEAM_INVITATION_ACCEPTED = "TEAM_INVITATION_ACCEPTED",
  TEAM_INVITATION_DECLINED = "TEAM_INVITATION_DECLINED",

  // Subscription
  SUBSCRIPTION_CHANGED = "SUBSCRIPTION_CHANGED",
  SUBSCRIPTION_CANCELLED = "SUBSCRIPTION_CANCELLED",

  // Errors
  ERROR = "ERROR",
  RATE_LIMIT = "RATE_LIMIT",
}

export interface NotificationPayload {
  Type: NotificationType;
  Title: string;
  Message: string;
  Data?: Record<string, unknown> | null;
  Timestamp: string; // ISO 8601 UTC
}

export interface UseNotificationsOptions {
  enabled?: boolean;
  sessionId?: string | null;
  onNotification?: (payload: NotificationPayload) => void;
}

export interface UseNotificationsReturn {
  isConnected: boolean;
}

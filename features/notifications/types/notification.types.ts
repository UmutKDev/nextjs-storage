import type { MutableRefObject } from "react";

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

  // Archive
  ARCHIVE_CREATE_PROGRESS = "ARCHIVE_CREATE_PROGRESS",
  ARCHIVE_CREATE_COMPLETE = "ARCHIVE_CREATE_COMPLETE",
  ARCHIVE_CREATE_FAILED = "ARCHIVE_CREATE_FAILED",
  ARCHIVE_EXTRACT_PROGRESS = "ARCHIVE_EXTRACT_PROGRESS",
  ARCHIVE_EXTRACT_COMPLETE = "ARCHIVE_EXTRACT_COMPLETE",
  ARCHIVE_EXTRACT_FAILED = "ARCHIVE_EXTRACT_FAILED",

  // Duplicate Scan
  DUPLICATE_SCAN_PROGRESS = "DUPLICATE_SCAN_PROGRESS",
  DUPLICATE_SCAN_COMPLETE = "DUPLICATE_SCAN_COMPLETE",
  DUPLICATE_SCAN_FAILED = "DUPLICATE_SCAN_FAILED",
  DUPLICATE_SCAN_CANCELLED = "DUPLICATE_SCAN_CANCELLED",

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
  subscribersRef: MutableRefObject<Set<NotificationSubscriber>>;
}

export type NotificationSubscriber = (payload: NotificationPayload) => void;

export interface UseNotificationsReturn {
  isConnected: boolean;
}

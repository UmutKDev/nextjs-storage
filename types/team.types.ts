export type {
  TeamResponseModel,
  TeamDetailResponseModel,
  TeamMemberResponseModel,
  TeamInvitationResponseModel,
  TeamCreateRequestModel,
  TeamUpdateRequestModel,
  TeamMemberUpdateRoleRequestModel,
  TeamInvitationCreateRequestModel,
  TeamInvitationAcceptRequestModel,
  TeamInvitationDeclineRequestModel,
  TeamTransferOwnershipRequestModel,
  TeamResponseListModelResult,
  TeamMemberResponseListModelResult,
  TeamInvitationResponseListModelResult,
} from "@/Service/Generates/api";

export {
  TeamInvitationCreateRequestModelRoleEnum,
  TeamMemberUpdateRoleRequestModelRoleEnum,
} from "@/Service/Generates/api";

export const TeamRole = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  VIEWER: "VIEWER",
} as const;
export type TeamRole = (typeof TeamRole)[keyof typeof TeamRole];

export const TeamStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type TeamStatus = (typeof TeamStatus)[keyof typeof TeamStatus];

export const TeamInvitationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;
export type TeamInvitationStatus =
  (typeof TeamInvitationStatus)[keyof typeof TeamInvitationStatus];

export type Workspace =
  | { type: "personal" }
  | { type: "team"; teamId: string; teamName: string; myRole: TeamRole };

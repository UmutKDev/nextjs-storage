import {
  AccountApiFactory,
  AccountSecurityApiFactory,
  AuthenticationApiFactory,
  CloudApiFactory,
  CloudArchiveApiFactory,
  CloudDirectoriesApiFactory,
  CloudUploadApiFactory,
  TeamApiFactory,
  TeamInvitationsApiFactory,
  TeamMembersApiFactory,
} from "./Generates";
import Instance from "./Instance";

export const authenticationApiFactory = AuthenticationApiFactory(
  undefined,
  undefined,
  Instance,
);

export const accountSecurityApiFactory = AccountSecurityApiFactory(
  undefined,
  undefined,
  Instance,
);

export const accountApiFactory = AccountApiFactory(
  undefined,
  undefined,
  Instance,
);

export const cloudApiFactory = CloudApiFactory(undefined, undefined, Instance);

export const cloudDirectoriesApiFactory = CloudDirectoriesApiFactory(
  undefined,
  undefined,
  Instance,
);

export const cloudUploadApiFactory = CloudUploadApiFactory(
  undefined,
  undefined,
  Instance,
);

export const cloudArchiveApiFactory = CloudArchiveApiFactory(
  undefined,
  undefined,
  Instance,
);

export const teamApiFactory = TeamApiFactory(undefined, undefined, Instance);

export const teamInvitationsApiFactory = TeamInvitationsApiFactory(
  undefined,
  undefined,
  Instance,
);

export const teamMembersApiFactory = TeamMembersApiFactory(
  undefined,
  undefined,
  Instance,
);

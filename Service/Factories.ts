import {
  AccountApiFactory,
  AuthenticationApiFactory,
  CloudApiFactory,
} from "./Generates";
import Instance from "./Instance";

export const authenticationApiFactory = AuthenticationApiFactory(
  undefined,
  undefined,
  Instance
);

export const accountApiFactory = AccountApiFactory(
  undefined,
  undefined,
  Instance
);

export const cloudApiFactory = CloudApiFactory(undefined, undefined, Instance);

import { AuthenticationApiFactory, CloudApiFactory } from "./Generates";
import Instance from "./Instance";

export const authenticationApiFactory = AuthenticationApiFactory(
  undefined,
  undefined,
  Instance
);

export const cloudApiFactory = CloudApiFactory(undefined, undefined, Instance);

/**
 * Convenience wrapper: fetch user storage usage and return the typed result object.
 * This avoids consumers having to unwrap response.data.result everywhere.
 */
export async function userStorageUsage() {
  const resp = await cloudApiFactory.userStorageUsage();
  return resp.data?.result;
}

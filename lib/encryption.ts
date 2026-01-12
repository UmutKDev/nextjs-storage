import { sessionManager } from "./SessionManager";

export const getSessionTokenForPath = (path: string): string | null => {
  return sessionManager.getSession(path);
};

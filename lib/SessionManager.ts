import { EventEmitter } from "events";

interface SessionData {
  token: string;
  expiresAt: number;
}

interface StoredSessions {
  [path: string]: SessionData;
}

export class SessionManager extends EventEmitter {
  private static instances = new Map<string, SessionManager>();
  private sessions: StoredSessions = {};
  private storageKey: string;

  private constructor(storageKey: string) {
    super();
    this.storageKey = storageKey;
    if (typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem(this.storageKey);
        if (stored) {
          this.sessions = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to restore sessions", e);
      }
    }
  }

  public static getInstanceForKey(key: string): SessionManager {
    if (!SessionManager.instances.has(key)) {
      SessionManager.instances.set(key, new SessionManager(key));
    }
    return SessionManager.instances.get(key)!;
  }

  public static getInstance(): SessionManager {
    return SessionManager.getInstanceForKey("encrypted_folder_sessions");
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          this.storageKey,
          JSON.stringify(this.sessions),
        );
      } catch (e) {
        console.error("Failed to save sessions", e);
      }
    }
    this.emit("change", this.sessions);
  }

  private normalizePath(path: string): string {
    return path.replace(/^\/+|\/+$/g, "");
  }

  public setSession(path: string, token: string, expiresAt: number) {
    const normalized = this.normalizePath(path);
    this.sessions[normalized] = { token, expiresAt };
    this.persist();
  }

  public getSession(path: string): string | null {
    const normalized = this.normalizePath(path);
    const now = Math.floor(Date.now() / 1000);

    // 1. Direct match
    if (this.sessions[normalized]) {
      const session = this.sessions[normalized];
      if (session.expiresAt > now) {
        return session.token;
      } else {
        // Lazy cleanup
        delete this.sessions[normalized];
        this.persist();
      }
    }

    // 2. Parent match
    // Check all possible parent paths
    const segments = normalized.split("/").filter(Boolean);
    // iterate from longest parent to root
    for (let i = segments.length - 1; i > 0; i--) {
      const parentPath = segments.slice(0, i).join("/");
      const session = this.sessions[parentPath];
      if (session) {
        if (session.expiresAt > now) {
          return session.token;
        } else {
          delete this.sessions[parentPath];
          this.persist();
        }
      }
    }

    return null;
  }

  public clearSession(path: string) {
    const normalized = this.normalizePath(path);
    if (this.sessions[normalized]) {
      delete this.sessions[normalized];
      this.persist();
    }
  }

  public clearAll() {
    this.sessions = {};
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(this.storageKey);
    }
    this.emit("change", this.sessions);
  }

  public getAllSessions(): StoredSessions {
    return { ...this.sessions };
  }
}

export const sessionManager = SessionManager.getInstance();
export const hiddenSessionManager = SessionManager.getInstanceForKey(
  "hidden_folder_sessions",
);

import { API_URL } from "@/Constants";
import axios, {
  AxiosError,
  AxiosResponse,
  type AxiosRequestHeaders,
} from "axios";
import { getSession } from "next-auth/react";
import type { Session } from "next-auth";

const Instance = axios.create({
  baseURL: API_URL,
  headers: {
    "X-Tunnel-Skip-AntiPhishing-Page": "true",
  },
});

const onSuccess = (response: AxiosResponse) => {
  return response;
};

// Client token cache — prefer calling setClientToken from your client app (once)
// to avoid calling getSession repeatedly.
let clientToken: string | null = null;

/**
 * setClientToken
 * Use this from client-side code (eg. in a top-level provider) to cache the
 * access token in memory and avoid calling getSession on each request.
 */
export function setClientToken(token?: string | null) {
  clientToken = token ?? null;

  if (!token) {
    delete Instance.defaults.headers.common["Authorization"];
  } else {
    Instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onError = (error: AxiosError<any>) => {
  // response available but we purposely handle its structured error later

  if (error.response && error.response.data) {
    const { Message } = error.response.data;
    if (Message) {
      return Promise.reject(Message);
    } else {
      return Promise.reject("Bir hata oluştu.");
    }
  } else {
    return Promise.reject("Bir hata oluştu.");
  }
};

Instance.interceptors.response.use(onSuccess, onError);

/**
 * Request interceptor
 * - In browser: read token from next-auth client session (getSession) and attach it to requests.
 *   We do NOT use localStorage for tokens.
 * - On server: do not attempt to read session/cookies here — pass token from server code using setServerToken
 */
Instance.interceptors.request.use(
  async (config) => {
    // In browser: try to get token from next-auth's session and attach it to the
    // request Authorization header. We avoid localStorage usage entirely.
    // If we have a cached client token, use it. This avoids calling getSession
    // on every request. setClientToken should be called by your top-level
    // provider (see app/providers.tsx) when session changes.
    if (clientToken && typeof window !== "undefined") {
      if (!config.headers) config.headers = {} as AxiosRequestHeaders;
      (config.headers as AxiosRequestHeaders)[
        "Authorization"
      ] = `Bearer ${clientToken}`;
    } else if (typeof window !== "undefined") {
      try {
        // getSession returns the current client session and typing comes from types/next-auth.d.ts
        // NOTE: we avoid calling getSession every request; this branch will only run
        // if no clientToken is cached yet. Prefer calling setClientToken during app init.
        const session = (await getSession()) as Session | null;
        const token = session?.accessToken ?? session?.user?.accessToken;

        if (token) {
          if (!config.headers) {
            // headers for this request — initialize with typed AxiosRequestHeaders
            config.headers = {} as AxiosRequestHeaders;
          }

          (config.headers as AxiosRequestHeaders)[
            "Authorization"
          ] = `Bearer ${token}`;
        }
      } catch {
        // If anything fails, we just continue without Authorization header.
        // Server-side requests should use setServerToken to provide token.
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default Instance;

/**
 * setServerToken
 * Use this helper in server-side code (API routes, getServerSideProps, route handlers, etc.) to set
 * the Authorization header when calling APIs from server code. Server code should retrieve the
 * token via getToken/getServerSession and then call setServerToken(token) before using the Instance.
 */
export function setServerToken(token?: string | null) {
  if (!token) {
    delete Instance.defaults.headers.common["Authorization"];
  } else {
    Instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

/* USAGE NOTES
 - Client-side (browser): Instance automatically picks up the access token from next-auth's
   client session (getSession). No manual token handling or localStorage access required.

   Example (client):
     // logged-in pages / components
     const { data } = await Instance.get('/my/protected/resource');

 - Server-side: retrieve the token in server code (getToken / getServerSession in NextAuth),
   call setServerToken(token) before making requests using Instance.

   Example (server):
     import { setServerToken } from '@/Service/Instance';
     const token = await getToken({ req }); // or getServerSession
     setServerToken(token?.accessToken);
     const res = await Instance.get('/my/protected/resource');
*/

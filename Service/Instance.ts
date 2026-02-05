import { API_URL } from "@/Constants";
import { getSessionTokenForPath } from "@/lib/encryption";
import axios, { AxiosError, AxiosResponse } from "axios";

const Instance = axios.create({
  baseURL: API_URL,
  headers: {
    "X-Tunnel-Skip-AntiPhishing-Page": "true",
  },
});

const onSuccess = (response: AxiosResponse) => {
  return response;
};

export function setClientToken(token?: string | null) {
  if (!token) {
    delete Instance.defaults.headers.common["X-Session-Id"];
  } else {
    Instance.defaults.headers.common["X-Session-Id"] = token;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onError = (error: AxiosError<any>) => {
  if (typeof window !== "undefined") {
    const status = error.response?.status;

    // Handle Authentication Errors
    if (status === 401) {
      // Avoid infinite loops if we are already trying to login/logout
      if (
        !window.location.pathname.startsWith("/authentication") &&
        !window.location.pathname.startsWith("/api/auth")
      ) {
        // Import dynamically to avoid build-time issues if used in non-browser context unexpectedly
        import("next-auth/react").then(({ signOut }) => {
          signOut({ callbackUrl: "/authentication" });
        });
      }
      return Promise.reject(error);
    }

    // Handle Network Errors (No response received)
    // // We explicitly check if response is missing to avoid redirecting on 500/404/etc
    // if (!error.response && (error.code === "ERR_NETWORK" || error.request)) {
    //   if (!window.location.pathname.startsWith("/server-error")) {
    //     window.location.href = "/server-error";
    //   }
    //   return Promise.reject(error);
    // }
  }

  // response available but we purposely handle its structured error later

  // Don't transform 403 errors - let them pass through for encrypted folder handling
  if (error.response?.status === 403) {
    if (process.env.NODE_ENV === "development") {
      console.log("[403 Error]", error.response.data);
    }
    return Promise.reject(error);
  }

  if (error.response && error.response.data) {
    if (process.env.NODE_ENV === "development") {
      console.log(error.response.data);
    }
    return Promise.reject("Bir hata oluştu.");
  }

  return Promise.reject(error);
};

Instance.interceptors.response.use(onSuccess, onError);

Instance.interceptors.request.use(
  async (config) => {
    // Cloud API endpoints check
    const url = config.url || "";
    if (url.includes("/Api/Cloud/")) {
      let path = config.params?.Path || config.params?.Key;

      if (!path && url.includes("?")) {
        const query = url.split("?")[1];
        const params = new URLSearchParams(query);
        path = params.get("Path") || params.get("Key") || undefined;
      }

      if (path && typeof path === "string") {
        const sessionToken = getSessionTokenForPath(path);
        if (sessionToken) {
          config.headers = config.headers || {};
          if (!config.headers["X-Folder-Session"]) {
            config.headers["X-Folder-Session"] = sessionToken;
          }
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default Instance;

export function setServerToken(token?: string | null) {
  if (!token) {
    delete Instance.defaults.headers.common["Authorization"];
  } else {
    Instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

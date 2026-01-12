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
    delete Instance.defaults.headers.common["Authorization"];
  } else {
    Instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onError = (error: AxiosError<any>) => {
  if (typeof window !== "undefined") {
    const status = error.response?.status;

    // Handle Authentication Errors
    if (status === 401) {
      if (!window.location.pathname.startsWith("/authentication")) {
        window.location.href = "/authentication";
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
    console.log("[403 Error]", error.response.data);
    return Promise.reject(error);
  }

  if (error.response && error.response.data) {
    console.log(error.response.data);
    return Promise.reject("Bir hata oluştu.");
  }

  return Promise.reject(error);
};

Instance.interceptors.response.use(onSuccess, onError);

Instance.interceptors.request.use(
  async (config) => {
    // Cloud API endpoints check
    if (config.url?.startsWith("/Cloud/")) {
      const path = config.params?.Path || config.params?.Key;
      if (path && typeof path === "string") {
        const sessionToken = getSessionTokenForPath(path);
        if (sessionToken && !config.headers["X-Folder-Session"]) {
          config.headers["X-Folder-Session"] = sessionToken;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default Instance;

export function setServerToken(token?: string | null) {
  if (!token) {
    delete Instance.defaults.headers.common["Authorization"];
  } else {
    Instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

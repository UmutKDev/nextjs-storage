import { API_URL } from "@/Constants";
import axios, { AxiosError, AxiosResponse } from "axios";
import { getSession } from "next-auth/react";

const Instance = axios.create({
  baseURL: API_URL,
});

const onSuccess = (response: AxiosResponse) => {
  console.log(response);
  return response;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onError = (error: AxiosError<any>) => {
  if (error?.response) {
    // Yanıt varsa (API'den dönen hata)
    const { data } = error.response;
    console.log(data);
  }

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
 * - In browser: try to get token from next-auth's session (preferred) and fallback to localStorage
 * - On server: do not attempt to read session/cookies here — pass token from server code using setServerToken
 */
Instance.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      try {
        const session = await getSession();
        const token =
          session?.accessToken || localStorage.getItem("accessToken");
        if (token) {
          config.headers = config.headers || {};
          config.headers["Authorization"] =
            config.headers["Authorization"] || `Bearer ${token}`;
        }
      } catch (error) {
        // non-fatal: log and try fallback below
        console.warn("Failed to retrieve next-auth session:", error);
        // if getSession fails for any reason, keep whatever Authorization header exists (or fallback to localStorage)
        config.headers = config.headers || {};
        config.headers["Authorization"] =
          config.headers["Authorization"] ||
          `Bearer ${
            (typeof window !== "undefined" &&
              localStorage.getItem("accessToken")) ||
            ""
          }`;
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

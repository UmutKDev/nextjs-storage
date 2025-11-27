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

export function setClientToken(token?: string | null) {
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
    //   const { Message } = error.response.data;
    //   if (Message) {
    //     return Promise.reject(Message);
    //   } else {
    //     return Promise.reject("Bir hata oluştu.");
    //   }
    // } else {
    return Promise.reject("Bir hata oluştu.");
  }
};

Instance.interceptors.response.use(onSuccess, onError);

Instance.interceptors.request.use(
  async (config) => {
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

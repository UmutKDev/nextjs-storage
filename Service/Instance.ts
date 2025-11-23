import { API_URL } from "@/Constants";
import axios, { AxiosError, AxiosResponse } from "axios";

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
    const { status, data } = error.response;
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

// Instance.interceptors.request.use(
//   (config) => {

//     if (!decodedUser && !config.url?.includes("/api/crmusers/login")) {
//       const cancelTokenSource = axios.CancelToken.source();
//       config.cancelToken = cancelTokenSource.token;
//       cancelTokenSource.cancel("No access token available. Request canceled.");
//       window.location.replace("/");

//       return Promise.reject("Oturum Sonlandırıldı");
//     }

//     config.headers["AccessToken"] =
//       config.headers["AccessToken"] || decodedUser?.accessToken;

//     if (config.method !== "get") {
//       console.log(config);
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export default Instance;

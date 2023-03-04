import axios from "axios";
import { Message, Notification } from "@arco-design/web-vue";

export const baseURL = import.meta.env.DEV
  ? "//127.0.0.1:2017"
  : location.origin;

export const ajax = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  responseType: "json",
  withCredentials: import.meta.env.DEV ? true : false,
});

axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    // iView.LoadingBar.start();
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

ajax.interceptors.response.use(
  ({ data = {}, request }) => {
    if (request.responseURL.includes("github")) {
      return data;
    }

    // iView.LoadingBar.finish();
    if (data && data.code !== 0) {
      if (data.code === 401) {
        Notification.error({
          title: "发生错误",
          content: "请检查Accesskey、SecretKey是否正确",
        });
      } else if (typeof data.message === "string") {
        Message.error(data.message);
      } else if (Array.isArray(data.message)) {
        data.message.forEach((item: string) => Message.error(item));
      }

      return Promise.reject(data);
    }
    return data;
  },
  (error: Error) => {
    if (axios.isCancel(error)) {
      console.log("Request canceled", error.message);
    } else {
      Message.error((error as Error).message || "发生错误");
    }

    return Promise.reject(error);
  }
);

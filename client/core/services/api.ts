import axios from "axios";

let token: string | null = null;

const setToken = (newToken: string) => (token = newToken);

const clientInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

const serverInstance = axios.create({
  baseURL: process.env.SERVER_API_URL,
});

[clientInstance, serverInstance].forEach((instance) => {
  instance.interceptors.request.use((config) => {
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response?.status === 401 &&
        location?.pathname !== "/auth/signin"
      ) {
        if (typeof location !== "undefined") {
          location.href = "/auth/signin";
          return;
        }
      }
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      return Promise.reject(error);
    }
  );
});

const getInstance = (type: "client" | "server" = "client") =>
  type === "server" ? serverInstance : clientInstance;

export { setToken, getInstance };

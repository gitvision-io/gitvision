import axios from "axios";

let token = null;

const setToken = (newToken) => (token = newToken);

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

const getInstance = () => instance;

export { setToken, getInstance };

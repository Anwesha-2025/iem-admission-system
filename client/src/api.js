import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("iem_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const assetUrl = (path) =>
  path?.startsWith("http")
    ? path
    : `${API_URL.replace(/\/api$/, "")}${path || ""}`;

export default api;

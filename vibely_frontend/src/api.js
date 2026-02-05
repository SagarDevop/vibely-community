// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 - try refresh token once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        try {
          const res = await axios.post(
            "http://127.0.0.1:8000/api/token/refresh/",
            { refresh },
            { headers: { "Content-Type": "application/json" } }
          );
          localStorage.setItem("access", res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api.request(originalRequest);
        } catch {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/auth";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

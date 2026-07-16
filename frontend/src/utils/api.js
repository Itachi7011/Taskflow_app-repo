// utils/api.js
// one axios instance for the whole app, baseURL is just "/api" because
// vite's dev proxy (or the nginx config in prod) takes care of forwarding
// that to the actual backend, frontend code never needs to know the
// real backend url
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// attach the jwt on every outgoing request if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("taskflow-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// if a 401 comes back, the token is dead, might as well clear it so the
// user isnt stuck in a weird half logged in state
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("taskflow-token");
    }
    return Promise.reject(err);
  },
);

export default api;

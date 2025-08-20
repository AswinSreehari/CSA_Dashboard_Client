import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, 
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

// add interceptors here if needed for auth/logging.
// api.interceptors.response.use(...)

export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "https://customer-sentiment-analysis-server.netlify.app/", 
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

// add interceptors here if needed for auth/logging.
// api.interceptors.response.use(...)

export default api;

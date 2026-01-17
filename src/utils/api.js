import axios from "axios";

// Get backend URL from environment variable or use relative path
const getBaseURL = () => {
  // If VITE_API_URL is set, use it (for cross-origin deployments)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Otherwise use relative path (for same-origin deployment)
  return "/api";
};

const API = axios.create({
  baseURL: getBaseURL(),
});

export default API;

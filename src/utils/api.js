import axios from "axios";

const getBaseURL = () => {
  // Try environment variable first
  if (import.meta.env.VITE_BACKEND_BASE_URL) {
    return import.meta.env.VITE_BACKEND_BASE_URL;
  }
  
  // Development fallback
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  
  // Production fallback - use current origin
  return window.location.origin;
};

const API = axios.create({
  baseURL: getBaseURL(),
});

export default API;

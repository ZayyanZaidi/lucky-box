import axios from "axios";

// Use relative paths - works since frontend and backend are served from same origin
const API = axios.create({
  baseURL: "/api",
});

export default API;

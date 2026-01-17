import axios from "axios";

// Use relative paths - works regardless of deployment domain
const API = axios.create({
  baseURL: "/api",
});

export default API;

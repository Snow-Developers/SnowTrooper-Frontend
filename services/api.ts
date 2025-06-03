import axios from "axios";

const API_URL = "http://192.168.1.100:8080/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  }
});

export default api;

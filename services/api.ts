// import axios from "axios";

const API_URL = "http://192.168.1.100:8080/api";
let apiToken: any;

export function getAPIToken() {
  return apiToken;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

//Login credentials
const credentials = {
  username: "user",
  password: "password",
};

//Initial connection with API
api
  .post(`/login`, credentials, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
  .then((response) => {
    apiToken = response.data;
  })
  .catch((error) => {
    console.error("API login error:", error.response?.data || error.message);
  });

// export default api;

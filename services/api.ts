import axios from "axios";

const API_URL = "http://localhost:8080/api";
let apiToken: any;

export function getAPIToken() {
  return apiToken;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

//Login credentials
const credentials = {
  username: "user",
  password: "password",
};

api.post(`/login`, credentials, {
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
}).then((response) => {
    apiToken = response.data;
    console.log("Logged into API");
}).catch((error) => { console.log("An error has occurred: ", error)});

export default api;

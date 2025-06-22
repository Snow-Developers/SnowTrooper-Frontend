import axios from "axios";
import { Platform } from "react-native";

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8080" // Android emulator
    : "http://localhost:8080/api"; 

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

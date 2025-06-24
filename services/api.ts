import axios from "axios";

const API_URL = "https://allegedly-harmless-egret.ngrok-free.app/api/"; 
// const API_URL = "http://192.168.1.100:8080/api/";

let apiToken: any;

export function getAPIToken() {
  return apiToken;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

//Login credentials
const credentials = {
  username: "user",
  password: "password",
};

api.post(`/login`, credentials, {
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "ngrok-skip-browser-warning": "11111",
  },
}).then((response) => {
    apiToken = response.data;
    console.log("Logged into API");
}).catch((error) => { console.log("An error has occurred: ", error)});

export default api;

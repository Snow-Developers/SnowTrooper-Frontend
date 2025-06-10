import axios from "axios";

const API_URL = "http://api.weatherapi.com/v1";
let weatherAPIKey = process.env.EXPO_PUBLIC_WEATHERAPI_KEY;

export function getWeatherAPIKey(){
    return weatherAPIKey;
}


const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  }
});


export default api;

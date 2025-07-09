import axios from "axios";

const API_URL = "https://allegedly-harmless-egret.ngrok-free.app/api/";
// const API_URL = "http://localhost:8082/api/";

let apiToken: any = null;
let loginPromise: Promise<any> | null = null;

export function getAPIToken() {
  return apiToken;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

// Login credentials
const credentials = {
  username: "user",
  password: "password",
};

// Function to login and get API token
async function loginToAPI(): Promise<any> {
  if (apiToken) {
    return Promise.resolve(apiToken);
  }

  if (loginPromise) {
    return loginPromise;
  }

  console.log("Attempting API login...");

  loginPromise = api
    .post(`/login`, credentials, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "ngrok-skip-browser-warning": "11111",
      },
    })
    .then((response) => {
      apiToken = response.data;
      console.log("API login successful");
      loginPromise = null;
      return apiToken;
    })
    .catch((error) => {
      console.error("API login failed:", error);
      loginPromise = null;
      throw error;
    });

  return loginPromise;
}

// Add request interceptor to handle authentication for specific endpoints
api.interceptors.request.use(
  async (config) => {
    // Only auto-authenticate for specific endpoints that need it
    const needsAuth =
      config.url?.includes("/order/") ||
      config.url?.includes("/users/") ||
      config.url?.includes("/contractor/");

    if (needsAuth && !apiToken) {
      try {
        console.log("Auto-authenticating for protected endpoint:", config.url);
        await loginToAPI();
      } catch (error) {
        console.error("Auto-authentication failed:", error);
        // Don't block the request, let it proceed and handle the error
      }
    }

    // Add standard headers for ngrok
    config.headers = config.headers || {};
    config.headers["ngrok-skip-browser-warning"] = "11111";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export the login function for manual use if needed
export async function ensureAPIAuthentication() {
  try {
    await loginToAPI();
    return true;
  } catch (error) {
    console.error("Failed to authenticate with API:", error);
    return false;
  }
}

export default api;

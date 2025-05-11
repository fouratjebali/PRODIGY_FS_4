import axios from "axios";

const API_BASE_URL = "http://localhost:3000"; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle responses (e.g., for token refresh or global error handling)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // const originalRequest = error.config;
    // Example: Handle 401 Unauthorized (e.g., token expired)
    if (error.response && error.response.status === 401) {
      // if (!originalRequest._retry) {
      //   originalRequest._retry = true;
      //   // Attempt to refresh token here
      //   // localStorage.removeItem("accessToken");
      //   // window.location.href = "/login"; // or trigger a logout action
      //   console.error("Unauthorized request or token expired. Logging out.");
      //   localStorage.removeItem("accessToken");
      //   localStorage.removeItem("user");
      //   // This should ideally trigger a global state update to redirect to login
      //   // For now, simple redirect if not on auth page
      //   if (!window.location.pathname.includes("/auth")) {
      //       // window.location.href = "/auth"; // Or use react-router for navigation
      //   }
      // }
      // For now, just log out if 401 occurs and not on auth page
      if (!window.location.pathname.startsWith("/auth")) {
        console.error("API request failed with 401. Clearing token and redirecting to login.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        // This is a hard redirect, ideally use React Router's navigation
        // window.location.href = "/auth"; 
        // Post a message or dispatch an event that App.tsx can listen to for logout
        window.dispatchEvent(new CustomEvent("authError"));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;


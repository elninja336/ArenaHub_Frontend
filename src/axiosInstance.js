// src/axiosInstance.js
import axios from "axios";

// Create an Axios instance with the base URL of your backend server
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api", // <-- Change this to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

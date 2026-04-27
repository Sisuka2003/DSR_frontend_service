import axios from "axios";
import { encryptPayload, decryptResponse } from "./encryption";

const axiosInstance = axios.create({
    baseURL: "https://localhost:8000",
    withCredentials: true, // sends session cookie with every request
    headers: {
        "Content-Type": "application/json"
    }
});

// Encrypt every outgoing POST/PUT/PATCH request body
axiosInstance.interceptors.request.use(async (config) => {
    if (config.data) {
        config.data = await encryptPayload(config.data);
    }
    return config;
}, (error) => Promise.reject(error));

// Decrypt every incoming response body
axiosInstance.interceptors.response.use(async (response) => {
    try {
        const data = response.data;

        // Only decrypt if response has both iv and ciphertext fields
        if (data && typeof data === "object" && data.iv && data.ciphertext) {
            response.data = await decryptResponse(data.iv, data.ciphertext);
        }
    } catch (error) {
        console.error("Decryption failed for response:", error);
    }
    return response;
}, (error) => Promise.reject(error));

export default axiosInstance;
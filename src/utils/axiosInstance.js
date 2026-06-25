import axios from "axios";
import { encryptPayload, decryptResponse } from "./encryption";

const axiosInstance = axios.create({
    baseURL: "https://localhost:8000",
    withCredentials: true, 
    headers: {
        "Content-Type": "application/json"
    }
});

axiosInstance.interceptors.request.use(async (config) => {
    if (config.data) {
        config.data = await encryptPayload(config.data);
    }
    return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use(async (response) => {
    try {
        const data = response.data;

        if (data && typeof data === "object" && data.iv && data.ciphertext) {
            response.data = await decryptResponse(data.iv, data.ciphertext);
        }
    } catch (error) {
        console.error("Decryption failed for response:", error);
    }
    return response;
}, async (error) => {
    try {
        if (error.response && error.response.data) {
            const data = error.response.data;
            if (data && typeof data === "object" && data.iv && data.ciphertext) {
                error.response.data = await decryptResponse(data.iv, data.ciphertext);
            }
        }
    } catch (decryptError) {
        console.error("Decryption failed for error response:", decryptError);
    }
    return Promise.reject(error);
});

export default axiosInstance;
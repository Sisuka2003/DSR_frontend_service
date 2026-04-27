import axiosInstance from "../utils/axiosInstance";

const API_BASE_URL = "/api/v1/admin";
const API_ADMIN_BASE_URL = "/app/v1/commons";

class AdminOperations {

  GetAdminData(payload) {
    console.log("Get Admin Data Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/getAdminDetails`, payload);
  }

  UpdateAdminData(payload) {
    console.log("Update Admin Data Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/updateAdminData`, payload);
  }

  getAdminDashboardData(payload) {
    console.log("Get Admin Dashboard Data Payload:", payload);
    return axiosInstance.post(`${API_ADMIN_BASE_URL}/getAllCounts`, payload);
  }
}

export default new AdminOperations();
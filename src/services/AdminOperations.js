import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1/admin";
const API_ADMIN_BASE_URL = "http://localhost:8000/app/v1/commons";

class AdminOperations {

   GetAdminData(payload) {
    console.log("Get Admin Data Payload:", payload);
    return axios.post(`${API_BASE_URL}/getAdminDetails`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  
   UpdateAdminData(payload) {
    console.log("Update Admin Data Payload:", payload);
    return axios.post(`${API_BASE_URL}/updateAdminData`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  getAdminDashboardData(payload) {
    console.log("Get Admin DashbaordData Payload:", payload);
    return axios.post(`${API_ADMIN_BASE_URL}/getAllCounts`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export default new AdminOperations();

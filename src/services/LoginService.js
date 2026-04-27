import axiosInstance from "../utils/axiosInstance";

const API_BASE_URL = "/app/v1/login";

class LoginService {
  LoginDataSubject(payload) {
    console.log("LoginService data subject Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/datasubject`, payload);
  }

  LoginDataController(payload) {
    console.log("LoginService data controller Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/datacontroller`, payload);
  }
}

export default new LoginService();
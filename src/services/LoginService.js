import axios from "axios";

const API_BASE_URL = "http://localhost:8000/app/v1/login";

class LoginService {
  LoginDataSubject(payload) {
    console.log("LoginService data subject Payload:", payload);
    return axios.post(`${API_BASE_URL}/datasubject`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

   LoginDataController(payload) {
    console.log("LoginService data controller Payload:", payload);
    return axios.post(`${API_BASE_URL}/datacontroller`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export default new LoginService();

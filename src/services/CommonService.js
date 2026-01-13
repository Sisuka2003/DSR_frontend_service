import axios from "axios";

const ACT_ORGANIZATION_RETRIEVAL_FOR_DROPDOWN_URL =
  "http://localhost:8000/app/v1/commons/getActiveOrganizations";
const API_OTP_BASE_URL = "http://localhost:8000/api/v1/operations/datasubject";

class CommonDataExtraction {
  getActiveOrganizationsForDropdown() {
    return axios.get(ACT_ORGANIZATION_RETRIEVAL_FOR_DROPDOWN_URL);
  }

  otpCodeRequest(payload) {
    console.log("otpCodeRequest data subject Payload:", payload);
    return axios.post(`${API_OTP_BASE_URL}/generateOtpCode`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  otpCodeVerification(payload) {
    console.log("otpCodeVerification data subject Payload:", payload);
    return axios.post(`${API_OTP_BASE_URL}/verifyOtpCode`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export default new CommonDataExtraction();

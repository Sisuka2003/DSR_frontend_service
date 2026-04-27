import axiosInstance from "../utils/axiosInstance";

const ACT_ORGANIZATION_RETRIEVAL_FOR_DROPDOWN_URL = "/app/v1/commons/getActiveOrganizations";
const ACT_IDENTIFIER_RETRIEVAL_FOR_DROPDOWN_URL = "/app/v1/commons/getKeyIdentifiers";
const API_OTP_BASE_URL = "/api/v1/operations/datasubject";

class CommonDataExtraction {
  getActiveOrganizationsForDropdown() {
    return axiosInstance.get(ACT_ORGANIZATION_RETRIEVAL_FOR_DROPDOWN_URL);
  }

  getActiveIdentifiers() {
    return axiosInstance.get(ACT_IDENTIFIER_RETRIEVAL_FOR_DROPDOWN_URL);
  }

  otpCodeRequest(payload) {
    console.log("otpCodeRequest data subject Payload:", payload);
    return axiosInstance.post(`${API_OTP_BASE_URL}/generateOtpCode`, payload);
  }

  otpCodeVerification(payload) {
    console.log("otpCodeVerification data subject Payload:", payload);
    return axiosInstance.post(`${API_OTP_BASE_URL}/verifyOtpCode`, payload);
  }
}

export default new CommonDataExtraction();
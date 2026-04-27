import axiosInstance from "../utils/axiosInstance";

const API_BASE_URL = "/api/v1/operations/datasubject";

class DataSubjectOperations {
  modifyDataSubjectData(payload) {
    console.log("Modify data subject data Payload:", payload);
    return axiosInstance.put(`${API_BASE_URL}/modifyDataSubjectData`, payload);
  }

  requestDataSubjectData(payload) {
    console.log("Request data subject data Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/requestDataSubjectData`, payload);
  }

  requestDataSubjectRelatedDataFromOrganization(payload) {
    console.log("requestDataSubjectRelatedDataFromOrganization Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/requestDataSubjectRelatedDataFromOrganization`, payload);
  }

  deleteDataSubjectData(payload) {
    console.log("Delete data subject data payload:", payload);
    return axiosInstance.delete(`${API_BASE_URL}/deleteDataSubjectData`, { data: payload });
  }

  generateDataSubjectDataReport(payload) {
    console.log("Generate Report for data subject data Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/generateDsrReport`, payload, {
      responseType: "blob", // ← kept — needed for PDF/binary response
    });
  }
}

export default new DataSubjectOperations();
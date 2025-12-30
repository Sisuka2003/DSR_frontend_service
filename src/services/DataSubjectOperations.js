import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1/operations/datasubject";

class DataSubjectOperations {
  modifyDataSubjectData(payload) {
    console.log("Modify data subject data Payload:", payload);
    return axios.put(`${API_BASE_URL}/modifyDataSubjectData`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  requestDataSubjectData(payload) {
    console.log("Request data subject data Payload:", payload);
    return axios.post(`${API_BASE_URL}/requestDataSubjectData`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  deleteDataSubjectData(payload) {
    console.log("Delete data subject data payload:", payload);
    return axios.delete(`${API_BASE_URL}/deleteDataSubjectData`, {
      data: payload,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  generateDataSubjectDataReport(payload) {
    console.log("Generate Report for data subject data Payload:", payload);
    return axios.post(`${API_BASE_URL}/generateDsrReport`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "blob",
    });
  }
}

export default new DataSubjectOperations();

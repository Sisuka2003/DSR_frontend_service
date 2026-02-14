import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1/operations/datacontroller";

class DataControllerOperations {
  modifyDataControllerData(payload) {
    console.log("Modify data controller data Payload:", payload);
    return axios.put(`${API_BASE_URL}/modifyDataControllerData`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  requestDataControllerData(payload) {
    console.log("Request data controller data Payload:", payload);
    return axios.post(`${API_BASE_URL}/requestDataControllerData`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  addNewDataController(payload) {
    console.log("Insert data controller data Payload:", payload);
    return axios.post(`${API_BASE_URL}/addNewDataController`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  requestAssociatedDataSubjectsWithOrganization(payload) {
    console.log("Request Associate Data Subject data from data controller Payload:", payload);
    return axios.post(`${API_BASE_URL}/requestAssociatedDataSubjectsWithOrganization`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  deleteDataControllerData(payload) {
    console.log("Delete data controller data payload:", payload);
    return axios.delete(`${API_BASE_URL}/deleteDataControllerData`, {
      data: payload,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  rejectDataSubjectDataModificationRequest(payload) {
    console.log("Reject Data Subject Data Modification Request payload :", payload);
    return axios.post(`${API_BASE_URL}/rejectDataSubjectDataModificationRequest`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export default new DataControllerOperations();

import axiosInstance from "../utils/axiosInstance";

const API_BASE_URL = "/api/v1/operations/datacontroller";

class DataControllerOperations {
  modifyDataControllerData(payload) {
    console.log("Modify data controller data Payload:", payload);
    return axiosInstance.put(`${API_BASE_URL}/modifyDataControllerData`, payload);
  }

  requestDataControllerData(payload) {
    console.log("Request data controller data Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/requestDataControllerData`, payload);
  }

  addNewDataController(payload) {
    console.log("Insert data controller data Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/addNewDataController`, payload);
  }

  requestAssociatedDataSubjectsWithOrganization(payload) {
    console.log("Request Associate Data Subject data from data controller Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/requestAssociatedDataSubjectsWithOrganization`, payload);
  }

  deleteDataControllerData(payload) {
    console.log("Delete data controller data payload:", payload);
    return axiosInstance.delete(`${API_BASE_URL}/deleteDataControllerData`, { data: payload });
  }

  rejectDataSubjectDataModificationRequest(payload) {
    console.log("Reject Data Subject Data Modification Request payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/rejectDataSubjectDataModificationRequest`, payload);
  }
}

export default new DataControllerOperations();
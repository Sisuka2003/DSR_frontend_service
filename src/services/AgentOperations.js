import axiosInstance from "../utils/axiosInstance";

const API_BASE_URL = "/api/agent/operations";

class AgentOperations {
  LoginAgentDataController(payload) {
    console.log("Login Agent Controller Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/loginControllerAgent`, payload);
  }

  FetchAgentInformation(payload) {
    console.log("Fetch Agent Information Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/fetchAgentInformation`, payload);
  }

  UpdateAgentData(payload) {
    console.log("Update Agent Controller Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/updateAgentRecord`, payload);
  }

  DeactivateAgentrecord(payload) {
    console.log("Deactivate Agent Controller Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/deactivateAgentRecord`, payload);
  }

  FetchAllAgentInformation(payload) {
    console.log("Fetch All Agent Information Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/fetchAllAgentInformation`, payload);
  }

  assignTaskToAgent(payload) {
    console.log("assignTaskToAgent Payload:", payload);
    return axiosInstance.post(`${API_BASE_URL}/assignTaskToAgent`, payload);
  }
}

export default new AgentOperations();
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/agent/operations";

class AgentOperations {

   LoginAgentDataController(payload) {
    console.log("Login Agent Controller Payload:", payload);
    return axios.post(`${API_BASE_URL}/loginControllerAgent`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

   FetchAgentInformation(payload) {
    console.log("Fetch Agent Information Payload:", payload);
    return axios.post(`${API_BASE_URL}/fetchAgentInformation`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

   UpdateAgentData(payload) {
    console.log("Update Agent Controller Payload:", payload);
    return axios.post(`${API_BASE_URL}/updateAgentRecord`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

   DeactivateAgentrecord(payload) {
    console.log("Deactivate Agent Controller Payload:", payload);
    return axios.post(`${API_BASE_URL}/deactivateAgentRecord`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export default new AgentOperations();

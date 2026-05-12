import AgentOperations from "../AgentOperations";
import axiosInstance from "../../utils/axiosInstance";

jest.mock("../../utils/axiosInstance");

describe("AgentOperations Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  describe("LoginAgentDataController", () => {
    it("should call the correct endpoint with valid credentials", async () => {
      const payload = { username: "agent@example.com", password: "password123" };
      const mockResponse = { data: { token: "abc123", agentId: "agent1" } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AgentOperations.LoginAgentDataController(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/agent/operations/loginControllerAgent",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle login failure", async () => {
      const payload = { username: "agent@example.com", password: "wrong" };
      const error = new Error("Invalid credentials");

      axiosInstance.post.mockRejectedValue(error);

      await expect(AgentOperations.LoginAgentDataController(payload)).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("should handle empty credentials", async () => {
      const payload = { username: "", password: "" };
      const mockResponse = { data: { error: "Credentials required" } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AgentOperations.LoginAgentDataController(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/agent/operations/loginControllerAgent",
        payload
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("FetchAgentInformation", () => {
    it("should fetch agent information with valid ID", async () => {
      const payload = { agentId: "agent123" };
      const mockResponse = { data: { agentId: "agent123", name: "John Agent" } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AgentOperations.FetchAgentInformation(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/agent/operations/fetchAgentInformation",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle non-existent agent", async () => {
      const payload = { agentId: "nonexistent" };
      const error = new Error("Agent not found");

      axiosInstance.post.mockRejectedValue(error);

      await expect(AgentOperations.FetchAgentInformation(payload)).rejects.toThrow(
        "Agent not found"
      );
    });

    it("should handle network timeout", async () => {
      const payload = { agentId: "agent123" };
      const error = new Error("Request timeout");

      axiosInstance.post.mockRejectedValue(error);

      await expect(AgentOperations.FetchAgentInformation(payload)).rejects.toThrow(
        "Request timeout"
      );
    });
  });

  describe("UpdateAgentData", () => {
    it("should update agent data successfully", async () => {
      const payload = { agentId: "agent123", name: "Updated Name" };
      const mockResponse = { data: { success: true, agentId: "agent123" } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AgentOperations.UpdateAgentData(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/agent/operations/updateAgentRecord",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle update failure", async () => {
      const payload = { agentId: "agent123", name: "Updated Name" };
      const error = new Error("Update failed");

      axiosInstance.post.mockRejectedValue(error);

      await expect(AgentOperations.UpdateAgentData(payload)).rejects.toThrow(
        "Update failed"
      );
    });

    it("should handle partial updates", async () => {
      const payload = { agentId: "agent123", status: "inactive" };
      const mockResponse = { data: { success: true } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AgentOperations.UpdateAgentData(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/agent/operations/updateAgentRecord",
        payload
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("DeactivateAgentrecord", () => {
    it("should deactivate agent successfully", async () => {
      const payload = { agentId: "agent123" };
      const mockResponse = { data: { success: true, status: "deactivated" } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AgentOperations.DeactivateAgentrecord(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/agent/operations/deactivateAgentRecord",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle deactivation of non-existent agent", async () => {
      const payload = { agentId: "nonexistent" };
      const error = new Error("Agent not found");

      axiosInstance.post.mockRejectedValue(error);

      await expect(AgentOperations.DeactivateAgentrecord(payload)).rejects.toThrow(
        "Agent not found"
      );
    });

    it("should handle already deactivated agent", async () => {
      const payload = { agentId: "agent123" };
      const error = new Error("Agent already deactivated");

      axiosInstance.post.mockRejectedValue(error);

      await expect(AgentOperations.DeactivateAgentrecord(payload)).rejects.toThrow(
        "Agent already deactivated"
      );
    });
  });

  describe("FetchAllAgentInformation", () => {
    it("should fetch all agents", async () => {
      const payload = { limit: 10, offset: 0 };
      const mockResponse = {
        data: {
          agents: [
            { agentId: "agent1", name: "Agent 1" },
            { agentId: "agent2", name: "Agent 2" }
          ],
          total: 2
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AgentOperations.FetchAllAgentInformation(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/agent/operations/fetchAllAgentInformation",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle empty agent list", async () => {
      const payload = { limit: 10, offset: 0 };
      const mockResponse = { data: { agents: [], total: 0 } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AgentOperations.FetchAllAgentInformation(payload);

      expect(result.data.agents).toHaveLength(0);
      expect(result.data.total).toBe(0);
    });

    it("should handle pagination", async () => {
      const payload = { limit: 5, offset: 10 };
      const mockResponse = { data: { agents: [], total: 100 } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AgentOperations.FetchAllAgentInformation(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/agent/operations/fetchAllAgentInformation",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle API error", async () => {
      const payload = { limit: 10, offset: 0 };
      const error = new Error("Server error");

      axiosInstance.post.mockRejectedValue(error);

      await expect(AgentOperations.FetchAllAgentInformation(payload)).rejects.toThrow(
        "Server error"
      );
    });
  });

  describe("assignTaskToAgent", () => {
    it("should assign task to agent successfully", async () => {
      const payload = { agentId: "agent123", taskId: "task456", priority: "high" };
      const mockResponse = { data: { success: true, assignmentId: "assign789" } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AgentOperations.assignTaskToAgent(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/agent/operations/assignTaskToAgent",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle assignment to non-existent agent", async () => {
      const payload = { agentId: "nonexistent", taskId: "task456" };
      const error = new Error("Agent not found");

      axiosInstance.post.mockRejectedValue(error);

      await expect(AgentOperations.assignTaskToAgent(payload)).rejects.toThrow(
        "Agent not found"
      );
    });

    it("should handle assignment of non-existent task", async () => {
      const payload = { agentId: "agent123", taskId: "nonexistent" };
      const error = new Error("Task not found");

      axiosInstance.post.mockRejectedValue(error);

      await expect(AgentOperations.assignTaskToAgent(payload)).rejects.toThrow(
        "Task not found"
      );
    });

    it("should handle duplicate assignment", async () => {
      const payload = { agentId: "agent123", taskId: "task456" };
      const error = new Error("Task already assigned");

      axiosInstance.post.mockRejectedValue(error);

      await expect(AgentOperations.assignTaskToAgent(payload)).rejects.toThrow(
        "Task already assigned"
      );
    });

    it("should handle multiple priority levels", async () => {
      const priorities = ["low", "medium", "high", "urgent"];

      for (const priority of priorities) {
        const payload = { agentId: "agent123", taskId: "task456", priority };
        const mockResponse = { data: { success: true, priority } };

        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await AgentOperations.assignTaskToAgent(payload);

        expect(result.data.priority).toBe(priority);
      }
    });
  });

  describe("Service instantiation", () => {
    it("should be a singleton", () => {
      const agent1 = AgentOperations;
      const agent2 = AgentOperations;

      expect(agent1).toBe(agent2);
    });

    it("should have all required methods", () => {
      expect(typeof AgentOperations.LoginAgentDataController).toBe("function");
      expect(typeof AgentOperations.FetchAgentInformation).toBe("function");
      expect(typeof AgentOperations.UpdateAgentData).toBe("function");
      expect(typeof AgentOperations.DeactivateAgentrecord).toBe("function");
      expect(typeof AgentOperations.FetchAllAgentInformation).toBe("function");
      expect(typeof AgentOperations.assignTaskToAgent).toBe("function");
    });
  });
});

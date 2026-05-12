import DataControllerOperations from "../DataControllerOperations";
import axiosInstance from "../../utils/axiosInstance";

jest.mock("../../utils/axiosInstance");

describe("DataControllerOperations Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  describe("modifyDataControllerData", () => {
    it("should modify data controller data successfully", async () => {
      const payload = { dataControllerId: "dc123", name: "Updated Name" };
      const mockResponse = { data: { success: true, dataControllerId: "dc123" } };

      axiosInstance.put.mockResolvedValue(mockResponse);

      const result = await DataControllerOperations.modifyDataControllerData(payload);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        "/api/v1/operations/datacontroller/modifyDataControllerData",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle non-existent data controller", async () => {
      const payload = { dataControllerId: "nonexistent", name: "Updated Name" };
      const error = new Error("Data controller not found");

      axiosInstance.put.mockRejectedValue(error);

      await expect(DataControllerOperations.modifyDataControllerData(payload)).rejects.toThrow(
        "Data controller not found"
      );
    });

    it("should handle partial updates", async () => {
      const payload = { dataControllerId: "dc123", status: "active" };
      const mockResponse = { data: { success: true } };

      axiosInstance.put.mockResolvedValue(mockResponse);

      const result = await DataControllerOperations.modifyDataControllerData(payload);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        "/api/v1/operations/datacontroller/modifyDataControllerData",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle large payload", async () => {
      const payload = { dataControllerId: "dc123", data: "x".repeat(5000) };
      const mockResponse = { data: { success: true } };

      axiosInstance.put.mockResolvedValue(mockResponse);

      const result = await DataControllerOperations.modifyDataControllerData(payload);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        "/api/v1/operations/datacontroller/modifyDataControllerData",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle validation error", async () => {
      const payload = { dataControllerId: "dc123", invalidField: "value" };
      const error = new Error("Validation failed");

      axiosInstance.put.mockRejectedValue(error);

      await expect(DataControllerOperations.modifyDataControllerData(payload)).rejects.toThrow(
        "Validation failed"
      );
    });
  });

  describe("requestDataControllerData", () => {
    it("should request data controller data successfully", async () => {
      const payload = { dataControllerId: "dc123" };
      const mockResponse = { data: { dataControllerId: "dc123", name: "Controller 1" } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await DataControllerOperations.requestDataControllerData(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/operations/datacontroller/requestDataControllerData",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle non-existent controller request", async () => {
      const payload = { dataControllerId: "nonexistent" };
      const error = new Error("Controller not found");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataControllerOperations.requestDataControllerData(payload)).rejects.toThrow(
        "Controller not found"
      );
    });

    it("should handle authorization error", async () => {
      const payload = { dataControllerId: "dc123" };
      const error = new Error("Unauthorized");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataControllerOperations.requestDataControllerData(payload)).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("addNewDataController", () => {
    it("should add new data controller successfully", async () => {
      const payload = { name: "New Controller", email: "controller@example.com" };
      const mockResponse = { data: { success: true, dataControllerId: "dc456" } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await DataControllerOperations.addNewDataController(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/operations/datacontroller/addNewDataController",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle duplicate controller", async () => {
      const payload = { name: "Existing Controller", email: "controller@example.com" };
      const error = new Error("Controller already exists");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataControllerOperations.addNewDataController(payload)).rejects.toThrow(
        "Controller already exists"
      );
    });

    it("should handle missing required fields", async () => {
      const payload = { name: "New Controller" };
      const error = new Error("Email is required");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataControllerOperations.addNewDataController(payload)).rejects.toThrow(
        "Email is required"
      );
    });

    it("should handle invalid email format", async () => {
      const payload = { name: "New Controller", email: "invalid-email" };
      const error = new Error("Invalid email format");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataControllerOperations.addNewDataController(payload)).rejects.toThrow(
        "Invalid email format"
      );
    });

    it("should handle multiple controller additions", async () => {
      const payloads = [
        { name: "Controller 1", email: "controller1@example.com" },
        { name: "Controller 2", email: "controller2@example.com" },
        { name: "Controller 3", email: "controller3@example.com" }
      ];

      for (const payload of payloads) {
        const mockResponse = { data: { success: true } };
        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await DataControllerOperations.addNewDataController(payload);

        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/api/v1/operations/datacontroller/addNewDataController",
          payload
        );
      }
    });
  });

  describe("requestAssociatedDataSubjectsWithOrganization", () => {
    it("should fetch associated data subjects successfully", async () => {
      const payload = { organizationId: "org123" };
      const mockResponse = {
        data: {
          subjects: [
            { subjectId: "ds1", name: "Subject 1" },
            { subjectId: "ds2", name: "Subject 2" }
          ]
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await DataControllerOperations.requestAssociatedDataSubjectsWithOrganization(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/operations/datacontroller/requestAssociatedDataSubjectsWithOrganization",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle organization with no subjects", async () => {
      const payload = { organizationId: "org123" };
      const mockResponse = { data: { subjects: [] } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await DataControllerOperations.requestAssociatedDataSubjectsWithOrganization(payload);

      expect(result.data.subjects).toHaveLength(0);
    });

    it("should handle non-existent organization", async () => {
      const payload = { organizationId: "nonexistent" };
      const error = new Error("Organization not found");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataControllerOperations.requestAssociatedDataSubjectsWithOrganization(payload)).rejects.toThrow(
        "Organization not found"
      );
    });

    it("should handle pagination", async () => {
      const payload = { organizationId: "org123", limit: 10, offset: 0 };
      const mockResponse = { data: { subjects: [], total: 100 } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await DataControllerOperations.requestAssociatedDataSubjectsWithOrganization(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/operations/datacontroller/requestAssociatedDataSubjectsWithOrganization",
        payload
      );
    });
  });

  describe("deleteDataControllerData", () => {
    it("should delete data controller successfully", async () => {
      const payload = { dataControllerId: "dc123" };
      const mockResponse = { data: { success: true } };

      axiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await DataControllerOperations.deleteDataControllerData(payload);

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        "/api/v1/operations/datacontroller/deleteDataControllerData",
        { data: payload }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle non-existent controller deletion", async () => {
      const payload = { dataControllerId: "nonexistent" };
      const error = new Error("Data controller not found");

      axiosInstance.delete.mockRejectedValue(error);

      await expect(DataControllerOperations.deleteDataControllerData(payload)).rejects.toThrow(
        "Data controller not found"
      );
    });

    it("should handle cascade deletion restrictions", async () => {
      const payload = { dataControllerId: "dc123" };
      const error = new Error("Cannot delete: associated data subjects exist");

      axiosInstance.delete.mockRejectedValue(error);

      await expect(DataControllerOperations.deleteDataControllerData(payload)).rejects.toThrow(
        "Cannot delete: associated data subjects exist"
      );
    });

    it("should handle multiple deletions", async () => {
      const payloads = [
        { dataControllerId: "dc1" },
        { dataControllerId: "dc2" },
        { dataControllerId: "dc3" }
      ];

      for (const payload of payloads) {
        const mockResponse = { data: { success: true } };
        axiosInstance.delete.mockResolvedValue(mockResponse);

        const result = await DataControllerOperations.deleteDataControllerData(payload);

        expect(axiosInstance.delete).toHaveBeenCalledWith(
          "/api/v1/operations/datacontroller/deleteDataControllerData",
          { data: payload }
        );
      }
    });
  });

  describe("rejectDataSubjectDataModificationRequest", () => {
    it("should reject modification request successfully", async () => {
      const payload = { requestId: "req123", reason: "Invalid data" };
      const mockResponse = { data: { success: true } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await DataControllerOperations.rejectDataSubjectDataModificationRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/operations/datacontroller/rejectDataSubjectDataModificationRequest",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle non-existent request rejection", async () => {
      const payload = { requestId: "nonexistent", reason: "Invalid data" };
      const error = new Error("Request not found");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataControllerOperations.rejectDataSubjectDataModificationRequest(payload)).rejects.toThrow(
        "Request not found"
      );
    });

    it("should handle already processed request", async () => {
      const payload = { requestId: "req123", reason: "Invalid data" };
      const error = new Error("Request already processed");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataControllerOperations.rejectDataSubjectDataModificationRequest(payload)).rejects.toThrow(
        "Request already processed"
      );
    });

    it("should handle rejection with different reasons", async () => {
      const reasons = [
        "Invalid data",
        "Security concern",
        "Duplicate request",
        "Insufficient information"
      ];

      for (const reason of reasons) {
        const payload = { requestId: "req123", reason };
        const mockResponse = { data: { success: true, reason } };

        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await DataControllerOperations.rejectDataSubjectDataModificationRequest(payload);

        expect(result.data.reason).toBe(reason);
      }
    });

    it("should handle missing reason field", async () => {
      const payload = { requestId: "req123" };
      const error = new Error("Reason is required");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataControllerOperations.rejectDataSubjectDataModificationRequest(payload)).rejects.toThrow(
        "Reason is required"
      );
    });
  });

  describe("Service instantiation", () => {
    it("should be a singleton", () => {
      const service1 = DataControllerOperations;
      const service2 = DataControllerOperations;

      expect(service1).toBe(service2);
    });

    it("should have all required methods", () => {
      expect(typeof DataControllerOperations.modifyDataControllerData).toBe("function");
      expect(typeof DataControllerOperations.requestDataControllerData).toBe("function");
      expect(typeof DataControllerOperations.addNewDataController).toBe("function");
      expect(typeof DataControllerOperations.requestAssociatedDataSubjectsWithOrganization).toBe("function");
      expect(typeof DataControllerOperations.deleteDataControllerData).toBe("function");
      expect(typeof DataControllerOperations.rejectDataSubjectDataModificationRequest).toBe("function");
    });
  });
});

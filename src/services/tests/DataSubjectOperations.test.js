import DataSubjectOperations from "../DataSubjectOperations";
import axiosInstance from "../../utils/axiosInstance";

jest.mock("../../utils/axiosInstance");

describe("DataSubjectOperations Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  describe("modifyDataSubjectData", () => {
    it("should modify data subject data successfully", async () => {
      const payload = { dataSubjectId: "ds123", name: "Updated Name" };
      const mockResponse = { data: { success: true, dataSubjectId: "ds123" } };

      axiosInstance.put.mockResolvedValue(mockResponse);

      const result = await DataSubjectOperations.modifyDataSubjectData(payload);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        "/api/v1/operations/datasubject/modifyDataSubjectData",
        payload
      );
      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith("Modify data subject data Payload:", payload);
    });

    it("should handle non-existent data subject", async () => {
      const payload = { dataSubjectId: "nonexistent", name: "Updated Name" };
      const error = new Error("Data subject not found");

      axiosInstance.put.mockRejectedValue(error);

      await expect(DataSubjectOperations.modifyDataSubjectData(payload)).rejects.toThrow(
        "Data subject not found"
      );
    });

    it("should handle partial updates", async () => {
      const payload = { dataSubjectId: "ds123", email: "newemail@example.com" };
      const mockResponse = { data: { success: true } };

      axiosInstance.put.mockResolvedValue(mockResponse);

      const result = await DataSubjectOperations.modifyDataSubjectData(payload);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        "/api/v1/operations/datasubject/modifyDataSubjectData",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle validation error", async () => {
      const payload = { dataSubjectId: "ds123", email: "invalid-email" };
      const error = new Error("Invalid email format");

      axiosInstance.put.mockRejectedValue(error);

      await expect(DataSubjectOperations.modifyDataSubjectData(payload)).rejects.toThrow(
        "Invalid email format"
      );
    });

    it("should handle large payload", async () => {
      const payload = { dataSubjectId: "ds123", data: "x".repeat(5000) };
      const mockResponse = { data: { success: true } };

      axiosInstance.put.mockResolvedValue(mockResponse);

      const result = await DataSubjectOperations.modifyDataSubjectData(payload);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        "/api/v1/operations/datasubject/modifyDataSubjectData",
        payload
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("requestDataSubjectData", () => {
    it("should request data subject data successfully", async () => {
      const payload = { dataSubjectId: "ds123" };
      const mockResponse = { data: { dataSubjectId: "ds123", name: "Subject 1" } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await DataSubjectOperations.requestDataSubjectData(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/operations/datasubject/requestDataSubjectData",
        payload
      );
      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith("Request data subject data Payload:", payload);
    });

    it("should handle non-existent subject request", async () => {
      const payload = { dataSubjectId: "nonexistent" };
      const error = new Error("Subject not found");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataSubjectOperations.requestDataSubjectData(payload)).rejects.toThrow(
        "Subject not found"
      );
    });

    it("should handle authorization error", async () => {
      const payload = { dataSubjectId: "ds123" };
      const error = new Error("Unauthorized access");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataSubjectOperations.requestDataSubjectData(payload)).rejects.toThrow(
        "Unauthorized access"
      );
    });

    it("should handle inactive subject", async () => {
      const payload = { dataSubjectId: "ds123" };
      const error = new Error("Subject is inactive");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataSubjectOperations.requestDataSubjectData(payload)).rejects.toThrow(
        "Subject is inactive"
      );
    });
  });

  describe("requestDataSubjectRelatedDataFromOrganization", () => {
    it("should request related data successfully", async () => {
      const payload = { dataSubjectId: "ds123", organizationId: "org456" };
      const mockResponse = {
        data: {
          relatedData: [
            { dataType: "purchase", count: 5 },
            { dataType: "interaction", count: 12 }
          ]
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await DataSubjectOperations.requestDataSubjectRelatedDataFromOrganization(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/operations/datasubject/requestDataSubjectRelatedDataFromOrganization",
        payload
      );
      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith(
        "requestDataSubjectRelatedDataFromOrganization Payload:",
        payload
      );
    });

    it("should handle non-existent organization", async () => {
      const payload = { dataSubjectId: "ds123", organizationId: "nonexistent" };
      const error = new Error("Organization not found");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataSubjectOperations.requestDataSubjectRelatedDataFromOrganization(payload)).rejects.toThrow(
        "Organization not found"
      );
    });

    it("should handle no related data", async () => {
      const payload = { dataSubjectId: "ds123", organizationId: "org456" };
      const mockResponse = { data: { relatedData: [] } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await DataSubjectOperations.requestDataSubjectRelatedDataFromOrganization(payload);

      expect(result.data.relatedData).toHaveLength(0);
    });

    it("should handle access denied error", async () => {
      const payload = { dataSubjectId: "ds123", organizationId: "org456" };
      const error = new Error("Access denied");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataSubjectOperations.requestDataSubjectRelatedDataFromOrganization(payload)).rejects.toThrow(
        "Access denied"
      );
    });

    it("should handle multiple data types", async () => {
      const payload = { dataSubjectId: "ds123", organizationId: "org456" };
      const mockResponse = {
        data: {
          relatedData: [
            { dataType: "purchase", count: 5 },
            { dataType: "interaction", count: 12 },
            { dataType: "profile", count: 3 },
            { dataType: "communication", count: 8 }
          ]
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await DataSubjectOperations.requestDataSubjectRelatedDataFromOrganization(payload);

      expect(result.data.relatedData).toHaveLength(4);
    });
  });

  describe("deleteDataSubjectData", () => {
    it("should delete data subject successfully", async () => {
      const payload = { dataSubjectId: "ds123" };
      const mockResponse = { data: { success: true } };

      axiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await DataSubjectOperations.deleteDataSubjectData(payload);

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        "/api/v1/operations/datasubject/deleteDataSubjectData",
        { data: payload }
      );
      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith("Delete data subject data payload:", payload);
    });

    it("should handle non-existent subject deletion", async () => {
      const payload = { dataSubjectId: "nonexistent" };
      const error = new Error("Data subject not found");

      axiosInstance.delete.mockRejectedValue(error);

      await expect(DataSubjectOperations.deleteDataSubjectData(payload)).rejects.toThrow(
        "Data subject not found"
      );
    });

    it("should handle protected subject deletion", async () => {
      const payload = { dataSubjectId: "ds123" };
      const error = new Error("Cannot delete protected subject");

      axiosInstance.delete.mockRejectedValue(error);

      await expect(DataSubjectOperations.deleteDataSubjectData(payload)).rejects.toThrow(
        "Cannot delete protected subject"
      );
    });

    it("should handle authorization error", async () => {
      const payload = { dataSubjectId: "ds123" };
      const error = new Error("Unauthorized");

      axiosInstance.delete.mockRejectedValue(error);

      await expect(DataSubjectOperations.deleteDataSubjectData(payload)).rejects.toThrow(
        "Unauthorized"
      );
    });

    it("should handle multiple deletions", async () => {
      const payloads = [
        { dataSubjectId: "ds1" },
        { dataSubjectId: "ds2" },
        { dataSubjectId: "ds3" }
      ];

      for (const payload of payloads) {
        const mockResponse = { data: { success: true } };
        axiosInstance.delete.mockResolvedValue(mockResponse);

        const result = await DataSubjectOperations.deleteDataSubjectData(payload);

        expect(axiosInstance.delete).toHaveBeenCalledWith(
          "/api/v1/operations/datasubject/deleteDataSubjectData",
          { data: payload }
        );
      }
    });
  });

  describe("generateDataSubjectDataReport", () => {
    it("should generate report successfully with blob response", async () => {
      const payload = { dataSubjectId: "ds123", format: "pdf" };
      const mockBlob = new Blob(["test data"], { type: "application/pdf" });
      const mockResponse = { data: mockBlob };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await DataSubjectOperations.generateDataSubjectDataReport(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/operations/datasubject/generateDsrReport",
        payload,
        { responseType: "blob" }
      );
      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith("Generate Report for data subject data Payload:", payload);
    });

    it("should handle non-existent subject report", async () => {
      const payload = { dataSubjectId: "nonexistent", format: "pdf" };
      const error = new Error("Subject not found");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataSubjectOperations.generateDataSubjectDataReport(payload)).rejects.toThrow(
        "Subject not found"
      );
    });

    it("should handle report generation timeout", async () => {
      const payload = { dataSubjectId: "ds123", format: "pdf" };
      const error = new Error("Report generation timeout");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataSubjectOperations.generateDataSubjectDataReport(payload)).rejects.toThrow(
        "Report generation timeout"
      );
    });

    it("should handle different report formats", async () => {
      const formats = ["pdf", "csv", "json", "xml"];

      for (const format of formats) {
        const payload = { dataSubjectId: "ds123", format };
        const mockBlob = new Blob(["test data"], { type: "application/octet-stream" });
        const mockResponse = { data: mockBlob };

        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await DataSubjectOperations.generateDataSubjectDataReport(payload);

        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/api/v1/operations/datasubject/generateDsrReport",
          payload,
          { responseType: "blob" }
        );
      }
    });

    it("should handle no data available for report", async () => {
      const payload = { dataSubjectId: "ds123", format: "pdf" };
      const mockBlob = new Blob(["No data available"], { type: "application/pdf" });
      const mockResponse = { data: mockBlob };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await DataSubjectOperations.generateDataSubjectDataReport(payload);

      expect(result.data.size).toBeGreaterThan(0);
    });

    it("should handle large reports", async () => {
      const payload = { dataSubjectId: "ds123", format: "pdf" };
      const largeData = new Array(1000000).fill("x").join("");
      const mockBlob = new Blob([largeData], { type: "application/pdf" });
      const mockResponse = { data: mockBlob };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await DataSubjectOperations.generateDataSubjectDataReport(payload);

      expect(result.data.size).toBe(1000000);
    });

    it("should handle authorization error on report generation", async () => {
      const payload = { dataSubjectId: "ds123", format: "pdf" };
      const error = new Error("Unauthorized to generate report");

      axiosInstance.post.mockRejectedValue(error);

      await expect(DataSubjectOperations.generateDataSubjectDataReport(payload)).rejects.toThrow(
        "Unauthorized to generate report"
      );
    });
  });

  describe("Service instantiation", () => {
    it("should be a singleton", () => {
      const service1 = DataSubjectOperations;
      const service2 = DataSubjectOperations;

      expect(service1).toBe(service2);
    });

    it("should have all required methods", () => {
      expect(typeof DataSubjectOperations.modifyDataSubjectData).toBe("function");
      expect(typeof DataSubjectOperations.requestDataSubjectData).toBe("function");
      expect(typeof DataSubjectOperations.requestDataSubjectRelatedDataFromOrganization).toBe("function");
      expect(typeof DataSubjectOperations.deleteDataSubjectData).toBe("function");
      expect(typeof DataSubjectOperations.generateDataSubjectDataReport).toBe("function");
    });
  });
});

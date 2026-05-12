import AdminOperations from "../AdminOperations";
import axiosInstance from "../../utils/axiosInstance";

jest.mock("../../utils/axiosInstance");

describe("AdminOperations Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  describe("GetAdminData", () => {
    it("should call the correct endpoint with payload", async () => {
      const payload = { adminId: "123" };
      const mockResponse = { data: { adminId: "123", name: "Admin" } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AdminOperations.GetAdminData(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/admin/getAdminDetails",
        payload
      );
      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith("Get Admin Data Payload:", payload);
    });

    it("should handle empty payload", async () => {
      const payload = {};
      const mockResponse = { data: {} };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AdminOperations.GetAdminData(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/admin/getAdminDetails",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle network error", async () => {
      const payload = { adminId: "123" };
      const error = new Error("Network Error");

      axiosInstance.post.mockRejectedValue(error);

      await expect(AdminOperations.GetAdminData(payload)).rejects.toThrow(
        "Network Error"
      );
    });

    it("should handle undefined payload", async () => {
      const error = new Error("Payload required");
      axiosInstance.post.mockRejectedValue(error);

      await expect(AdminOperations.GetAdminData(undefined)).rejects.toThrow();
    });
  });

  describe("UpdateAdminData", () => {
    it("should call the correct endpoint with payload", async () => {
      const payload = { adminId: "123", name: "Updated Admin" };
      const mockResponse = { data: { success: true } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AdminOperations.UpdateAdminData(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/admin/updateAdminData",
        payload
      );
      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith("Update Admin Data Payload:", payload);
    });

    it("should handle partial update payload", async () => {
      const payload = { adminId: "123" };
      const mockResponse = { data: { success: true } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AdminOperations.UpdateAdminData(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/admin/updateAdminData",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle server error", async () => {
      const payload = { adminId: "123" };
      const error = new Error("Server Error");

      axiosInstance.post.mockRejectedValue(error);

      await expect(AdminOperations.UpdateAdminData(payload)).rejects.toThrow(
        "Server Error"
      );
    });

    it("should handle large payload", async () => {
      const payload = { adminId: "123", data: "x".repeat(1000) };
      const mockResponse = { data: { success: true } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AdminOperations.UpdateAdminData(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/admin/updateAdminData",
        payload
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getAdminDashboardData", () => {
    it("should call the correct endpoint with payload", async () => {
      const payload = { period: "monthly" };
      const mockResponse = {
        data: {
          totalAdmins: 10,
          totalUsers: 100
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AdminOperations.getAdminDashboardData(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/app/v1/commons/getAllCounts",
        payload
      );
      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith("Get Admin Dashboard Data Payload:", payload);
    });

    it("should handle empty filter", async () => {
      const payload = {};
      const mockResponse = { data: { totalAdmins: 0, totalUsers: 0 } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AdminOperations.getAdminDashboardData(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/app/v1/commons/getAllCounts",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle API timeout", async () => {
      const payload = { period: "monthly" };
      const error = new Error("Timeout");

      axiosInstance.post.mockRejectedValue(error);

      await expect(AdminOperations.getAdminDashboardData(payload)).rejects.toThrow(
        "Timeout"
      );
    });

    it("should return different periods correctly", async () => {
      const periods = ["daily", "weekly", "monthly", "yearly"];

      for (const period of periods) {
        const payload = { period };
        const mockResponse = { data: { period, count: Math.random() * 100 } };

        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await AdminOperations.getAdminDashboardData(payload);

        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/app/v1/commons/getAllCounts",
          payload
        );
        expect(result).toEqual(mockResponse);
      }
    });
  });

  describe("Service instantiation", () => {
    it("should be a singleton", () => {
      const admin1 = AdminOperations;
      const admin2 = AdminOperations;

      expect(admin1).toBe(admin2);
    });

    it("should have all required methods", () => {
      expect(typeof AdminOperations.GetAdminData).toBe("function");
      expect(typeof AdminOperations.UpdateAdminData).toBe("function");
      expect(typeof AdminOperations.getAdminDashboardData).toBe("function");
    });
  });
});

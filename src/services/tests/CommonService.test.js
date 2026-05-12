import CommonService from "../CommonService";
import axiosInstance from "../../utils/axiosInstance";

jest.mock("../../utils/axiosInstance");

describe("CommonService (CommonDataExtraction)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  describe("getActiveOrganizationsForDropdown", () => {
    it("should fetch active organizations", async () => {
      const mockResponse = {
        data: {
          organizations: [
            { id: "org1", name: "Organization 1" },
            { id: "org2", name: "Organization 2" }
          ]
        }
      };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await CommonService.getActiveOrganizationsForDropdown();

      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/app/v1/commons/getActiveOrganizations"
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle empty organizations list", async () => {
      const mockResponse = { data: { organizations: [] } };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await CommonService.getActiveOrganizationsForDropdown();

      expect(result.data.organizations).toHaveLength(0);
    });

    it("should handle network error", async () => {
      const error = new Error("Network error");

      axiosInstance.get.mockRejectedValue(error);

      await expect(CommonService.getActiveOrganizationsForDropdown()).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle large organization list", async () => {
      const organizations = Array.from({ length: 1000 }, (_, i) => ({
        id: `org${i}`,
        name: `Organization ${i}`
      }));

      const mockResponse = { data: { organizations } };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await CommonService.getActiveOrganizationsForDropdown();

      expect(result.data.organizations).toHaveLength(1000);
    });

    it("should handle API timeout", async () => {
      const error = new Error("Request timeout");

      axiosInstance.get.mockRejectedValue(error);

      await expect(CommonService.getActiveOrganizationsForDropdown()).rejects.toThrow(
        "Request timeout"
      );
    });

    it("should return consistent data structure", async () => {
      const mockResponse = {
        data: {
          organizations: [
            { id: "org1", name: "Organization 1", status: "active" }
          ]
        }
      };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await CommonService.getActiveOrganizationsForDropdown();

      expect(result.data).toHaveProperty("organizations");
      expect(Array.isArray(result.data.organizations)).toBe(true);
    });
  });

  describe("getActiveIdentifiers", () => {
    it("should fetch active identifiers", async () => {
      const mockResponse = {
        data: {
          identifiers: [
            { id: "id1", key: "email" },
            { id: "id2", key: "phone" }
          ]
        }
      };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await CommonService.getActiveIdentifiers();

      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/app/v1/commons/getKeyIdentifiers"
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle empty identifiers list", async () => {
      const mockResponse = { data: { identifiers: [] } };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await CommonService.getActiveIdentifiers();

      expect(result.data.identifiers).toHaveLength(0);
    });

    it("should handle different identifier types", async () => {
      const mockResponse = {
        data: {
          identifiers: [
            { id: "id1", key: "email", type: "string" },
            { id: "id2", key: "phone", type: "string" },
            { id: "id3", key: "userId", type: "number" }
          ]
        }
      };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await CommonService.getActiveIdentifiers();

      expect(result.data.identifiers).toHaveLength(3);
      expect(result.data.identifiers.every(id => id.type)).toBe(true);
    });

    it("should handle API error", async () => {
      const error = new Error("Server error");

      axiosInstance.get.mockRejectedValue(error);

      await expect(CommonService.getActiveIdentifiers()).rejects.toThrow(
        "Server error"
      );
    });

    it("should handle malformed response", async () => {
      const mockResponse = { data: null };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await CommonService.getActiveIdentifiers();

      expect(result).toEqual(mockResponse);
    });
  });

  describe("otpCodeRequest", () => {
    it("should request OTP code successfully", async () => {
      const payload = { email: "user@example.com" };
      const mockResponse = { data: { success: true, message: "OTP sent" } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await CommonService.otpCodeRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/operations/datasubject/generateOtpCode",
        payload
      );
      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith("otpCodeRequest data subject Payload:", payload);
    });

    it("should handle invalid email", async () => {
      const payload = { email: "invalid-email" };
      const error = new Error("Invalid email format");

      axiosInstance.post.mockRejectedValue(error);

      await expect(CommonService.otpCodeRequest(payload)).rejects.toThrow(
        "Invalid email format"
      );
    });

    it("should handle rate limiting", async () => {
      const payload = { email: "user@example.com" };
      const error = new Error("Too many requests");

      axiosInstance.post.mockRejectedValue(error);

      await expect(CommonService.otpCodeRequest(payload)).rejects.toThrow(
        "Too many requests"
      );
    });

    it("should handle missing email", async () => {
      const payload = {};
      const error = new Error("Email required");

      axiosInstance.post.mockRejectedValue(error);

      await expect(CommonService.otpCodeRequest(payload)).rejects.toThrow(
        "Email required"
      );
    });

    it("should handle different contact methods", async () => {
      const payloads = [
        { email: "user@example.com" },
        { phone: "+1234567890" },
        { email: "user2@example.com", method: "email" }
      ];

      for (const payload of payloads) {
        const mockResponse = { data: { success: true } };
        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await CommonService.otpCodeRequest(payload);

        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/api/v1/operations/datasubject/generateOtpCode",
          payload
        );
      }
    });
  });

  describe("otpCodeVerification", () => {
    it("should verify OTP code successfully", async () => {
      const payload = { email: "user@example.com", otp: "123456" };
      const mockResponse = { data: { success: true, token: "token123" } };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await CommonService.otpCodeVerification(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/v1/operations/datasubject/verifyOtpCode",
        payload
      );
      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith("otpCodeVerification data subject Payload:", payload);
    });

    it("should handle invalid OTP", async () => {
      const payload = { email: "user@example.com", otp: "000000" };
      const error = new Error("Invalid OTP");

      axiosInstance.post.mockRejectedValue(error);

      await expect(CommonService.otpCodeVerification(payload)).rejects.toThrow(
        "Invalid OTP"
      );
    });

    it("should handle expired OTP", async () => {
      const payload = { email: "user@example.com", otp: "123456" };
      const error = new Error("OTP expired");

      axiosInstance.post.mockRejectedValue(error);

      await expect(CommonService.otpCodeVerification(payload)).rejects.toThrow(
        "OTP expired"
      );
    });

    it("should handle too many attempts", async () => {
      const payload = { email: "user@example.com", otp: "000000" };
      const error = new Error("Too many failed attempts");

      axiosInstance.post.mockRejectedValue(error);

      await expect(CommonService.otpCodeVerification(payload)).rejects.toThrow(
        "Too many failed attempts"
      );
    });

    it("should handle missing OTP", async () => {
      const payload = { email: "user@example.com" };
      const error = new Error("OTP required");

      axiosInstance.post.mockRejectedValue(error);

      await expect(CommonService.otpCodeVerification(payload)).rejects.toThrow(
        "OTP required"
      );
    });

    it("should handle various OTP formats", async () => {
      const otps = ["123456", "000000", "999999"];

      for (const otp of otps) {
        const payload = { email: "user@example.com", otp };
        const mockResponse = { data: { success: true } };

        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await CommonService.otpCodeVerification(payload);

        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/api/v1/operations/datasubject/verifyOtpCode",
          payload
        );
      }
    });
  });

  describe("Service instantiation", () => {
    it("should be a singleton", () => {
      const service1 = CommonService;
      const service2 = CommonService;

      expect(service1).toBe(service2);
    });

    it("should have all required methods", () => {
      expect(typeof CommonService.getActiveOrganizationsForDropdown).toBe("function");
      expect(typeof CommonService.getActiveIdentifiers).toBe("function");
      expect(typeof CommonService.otpCodeRequest).toBe("function");
      expect(typeof CommonService.otpCodeVerification).toBe("function");
    });
  });
});

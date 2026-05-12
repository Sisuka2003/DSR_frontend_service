import LoginService from "../LoginService";
import axiosInstance from "../../utils/axiosInstance";

jest.mock("../../utils/axiosInstance");

describe("LoginService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  describe("LoginDataSubject", () => {
    it("should login data subject successfully", async () => {
      const payload = { email: "subject@example.com", password: "password123" };
      const mockResponse = {
        data: {
          token: "token123",
          subjectId: "ds123",
          email: "subject@example.com"
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await LoginService.LoginDataSubject(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/app/v1/login/datasubject",
        payload
      );
      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith("LoginService data subject Payload:", payload);
    });

    it("should handle invalid credentials", async () => {
      const payload = { email: "subject@example.com", password: "wrongpassword" };
      const error = new Error("Invalid credentials");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataSubject(payload)).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("should handle non-existent user", async () => {
      const payload = { email: "nonexistent@example.com", password: "password123" };
      const error = new Error("User not found");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataSubject(payload)).rejects.toThrow(
        "User not found"
      );
    });

    it("should handle empty credentials", async () => {
      const payload = { email: "", password: "" };
      const error = new Error("Email and password required");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataSubject(payload)).rejects.toThrow(
        "Email and password required"
      );
    });

    it("should handle missing email", async () => {
      const payload = { password: "password123" };
      const error = new Error("Email is required");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataSubject(payload)).rejects.toThrow(
        "Email is required"
      );
    });

    it("should handle missing password", async () => {
      const payload = { email: "subject@example.com" };
      const error = new Error("Password is required");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataSubject(payload)).rejects.toThrow(
        "Password is required"
      );
    });

    it("should handle account locked error", async () => {
      const payload = { email: "subject@example.com", password: "password123" };
      const error = new Error("Account locked due to multiple failed login attempts");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataSubject(payload)).rejects.toThrow(
        "Account locked due to multiple failed login attempts"
      );
    });

    it("should handle inactive account", async () => {
      const payload = { email: "subject@example.com", password: "password123" };
      const error = new Error("Account is inactive");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataSubject(payload)).rejects.toThrow(
        "Account is inactive"
      );
    });

    it("should handle network error", async () => {
      const payload = { email: "subject@example.com", password: "password123" };
      const error = new Error("Network error");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataSubject(payload)).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle server error", async () => {
      const payload = { email: "subject@example.com", password: "password123" };
      const error = new Error("Internal server error");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataSubject(payload)).rejects.toThrow(
        "Internal server error"
      );
    });

    it("should handle successful login with token", async () => {
      const payload = { email: "subject@example.com", password: "password123" };
      const mockResponse = {
        data: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
          refreshToken: "refresh123",
          expiresIn: 3600
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await LoginService.LoginDataSubject(payload);

      expect(result.data).toHaveProperty("token");
      expect(result.data).toHaveProperty("refreshToken");
      expect(result.data).toHaveProperty("expiresIn");
    });

    it("should handle different email formats", async () => {
      const emails = [
        "subject@example.com",
        "subject.name@example.co.uk",
        "subject+tag@example.com"
      ];

      for (const email of emails) {
        const payload = { email, password: "password123" };
        const mockResponse = {
          data: { token: "token123", email }
        };

        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await LoginService.LoginDataSubject(payload);

        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/app/v1/login/datasubject",
          payload
        );
      }
    });
  });

  describe("LoginDataController", () => {
    it("should login data controller successfully", async () => {
      const payload = { email: "controller@example.com", password: "password123" };
      const mockResponse = {
        data: {
          token: "token456",
          controllerId: "dc456",
          email: "controller@example.com"
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await LoginService.LoginDataController(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/app/v1/login/datacontroller",
        payload
      );
      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith("LoginService data controller Payload:", payload);
    });

    it("should handle invalid credentials", async () => {
      const payload = { email: "controller@example.com", password: "wrongpassword" };
      const error = new Error("Invalid credentials");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataController(payload)).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("should handle non-existent controller", async () => {
      const payload = { email: "nonexistent@example.com", password: "password123" };
      const error = new Error("Controller not found");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataController(payload)).rejects.toThrow(
        "Controller not found"
      );
    });

    it("should handle empty credentials", async () => {
      const payload = { email: "", password: "" };
      const error = new Error("Email and password required");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataController(payload)).rejects.toThrow(
        "Email and password required"
      );
    });

    it("should handle missing email", async () => {
      const payload = { password: "password123" };
      const error = new Error("Email is required");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataController(payload)).rejects.toThrow(
        "Email is required"
      );
    });

    it("should handle missing password", async () => {
      const payload = { email: "controller@example.com" };
      const error = new Error("Password is required");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataController(payload)).rejects.toThrow(
        "Password is required"
      );
    });

    it("should handle account locked error", async () => {
      const payload = { email: "controller@example.com", password: "password123" };
      const error = new Error("Account locked");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataController(payload)).rejects.toThrow(
        "Account locked"
      );
    });

    it("should handle inactive account", async () => {
      const payload = { email: "controller@example.com", password: "password123" };
      const error = new Error("Account is inactive");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataController(payload)).rejects.toThrow(
        "Account is inactive"
      );
    });

    it("should handle insufficient permissions", async () => {
      const payload = { email: "controller@example.com", password: "password123" };
      const error = new Error("User does not have data controller role");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataController(payload)).rejects.toThrow(
        "User does not have data controller role"
      );
    });

    it("should handle network error", async () => {
      const payload = { email: "controller@example.com", password: "password123" };
      const error = new Error("Network error");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataController(payload)).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle server error", async () => {
      const payload = { email: "controller@example.com", password: "password123" };
      const error = new Error("Internal server error");

      axiosInstance.post.mockRejectedValue(error);

      await expect(LoginService.LoginDataController(payload)).rejects.toThrow(
        "Internal server error"
      );
    });

    it("should handle successful login with admin token", async () => {
      const payload = { email: "controller@example.com", password: "password123" };
      const mockResponse = {
        data: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
          refreshToken: "refresh456",
          expiresIn: 7200,
          role: "data_controller"
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await LoginService.LoginDataController(payload);

      expect(result.data).toHaveProperty("token");
      expect(result.data).toHaveProperty("role");
      expect(result.data.role).toBe("data_controller");
    });

    it("should handle different email formats for controller", async () => {
      const emails = [
        "controller@company.com",
        "admin.controller@company.co.uk",
        "controller+dev@company.com"
      ];

      for (const email of emails) {
        const payload = { email, password: "password123" };
        const mockResponse = {
          data: { token: "token456", email, role: "data_controller" }
        };

        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await LoginService.LoginDataController(payload);

        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/app/v1/login/datacontroller",
          payload
        );
      }
    });
  });

  describe("Service instantiation", () => {
    it("should be a singleton", () => {
      const service1 = LoginService;
      const service2 = LoginService;

      expect(service1).toBe(service2);
    });

    it("should have all required methods", () => {
      expect(typeof LoginService.LoginDataSubject).toBe("function");
      expect(typeof LoginService.LoginDataController).toBe("function");
    });
  });

  describe("Login comparison", () => {
    it("should handle both login types with same email format", async () => {
      const email = "user@example.com";

      const subjectPayload = { email, password: "password123" };
      const controllerPayload = { email, password: "password123" };

      const subjectResponse = { data: { token: "subject_token", subjectId: "ds123" } };
      const controllerResponse = { data: { token: "controller_token", controllerId: "dc123" } };

      axiosInstance.post.mockResolvedValueOnce(subjectResponse);
      axiosInstance.post.mockResolvedValueOnce(controllerResponse);

      const result1 = await LoginService.LoginDataSubject(subjectPayload);
      const result2 = await LoginService.LoginDataController(controllerPayload);

      expect(result1.data).toHaveProperty("subjectId");
      expect(result2.data).toHaveProperty("controllerId");
    });
  });
});

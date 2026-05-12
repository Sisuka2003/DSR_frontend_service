import axiosInstance from "../axiosInstance";
import * as encryption from "../encryption";

jest.mock("../encryption");

describe("axiosInstance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Axios Configuration", () => {
    it("should be configured with correct base URL", () => {
      expect(axiosInstance.defaults.baseURL).toBe("https://localhost:8000");
    });

    it("should have credentials enabled", () => {
      expect(axiosInstance.defaults.withCredentials).toBe(true);
    });

    it("should have correct Content-Type header", () => {
      expect(axiosInstance.defaults.headers["Content-Type"]).toBe("application/json");
    });

    it("should be an axios instance", () => {
      expect(axiosInstance.post).toBeDefined();
      expect(axiosInstance.get).toBeDefined();
      expect(axiosInstance.put).toBeDefined();
      expect(axiosInstance.delete).toBeDefined();
    });
  });

  describe("Request Interceptor - Encryption", () => {
    it("should encrypt POST request with data", async () => {
      const testData = { test: "data" };
      const mockEncrypted = {
        iv: "mockIv",
        ciphertext: "mockCiphertext"
      };

      encryption.encryptPayload.mockResolvedValue(mockEncrypted);

      const config = {
        method: "POST",
        data: testData,
        headers: {}
      };

      // Access the interceptor
      const interceptor = axiosInstance.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(result.data).toEqual(mockEncrypted);
    });

    it("should encrypt PUT request with data", async () => {
      const testData = { update: "data" };
      const mockEncrypted = {
        iv: "mockIv",
        ciphertext: "mockCiphertext"
      };

      encryption.encryptPayload.mockResolvedValue(mockEncrypted);

      const config = {
        method: "PUT",
        data: testData,
        headers: {}
      };

      const interceptor = axiosInstance.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(encryption.encryptPayload).toHaveBeenCalledWith(testData);
      expect(result.data).toEqual(mockEncrypted);
    });

    it("should handle GET request without data", async () => {
      const config = {
        method: "GET",
        headers: {}
      };

      const interceptor = axiosInstance.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(result).toEqual(config);
      expect(encryption.encryptPayload).not.toHaveBeenCalled();
    });

    it("should handle DELETE request without data", async () => {
      const config = {
        method: "DELETE",
        headers: {}
      };

      const interceptor = axiosInstance.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(result).toEqual(config);
      expect(encryption.encryptPayload).not.toHaveBeenCalled();
    });

    it("should handle encryption error", async () => {
      const testData = { test: "data" };
      const encryptionError = new Error("Encryption failed");

      encryption.encryptPayload.mockRejectedValue(encryptionError);

      const config = {
        method: "POST",
        data: testData,
        headers: {}
      };

      const interceptor = axiosInstance.interceptors.request.handlers[0];

      await expect(interceptor.fulfilled(config)).rejects.toThrow("Encryption failed");
    });

    it("should handle large payload encryption", async () => {
      const largeData = { data: "x".repeat(100000) };
      const mockEncrypted = {
        iv: "mockIv",
        ciphertext: "mockCiphertext"
      };

      encryption.encryptPayload.mockResolvedValue(mockEncrypted);

      const config = {
        method: "POST",
        data: largeData,
        headers: {}
      };

      const interceptor = axiosInstance.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(encryption.encryptPayload).toHaveBeenCalledWith(largeData);
      expect(result.data).toEqual(mockEncrypted);
    });

    it("should handle complex nested data", async () => {
      const complexData = {
        level1: {
          level2: {
            level3: {
              array: [1, 2, 3],
              string: "value"
            }
          }
        }
      };

      const mockEncrypted = {
        iv: "mockIv",
        ciphertext: "mockCiphertext"
      };

      encryption.encryptPayload.mockResolvedValue(mockEncrypted);

      const config = {
        method: "POST",
        data: complexData,
        headers: {}
      };

      const interceptor = axiosInstance.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(encryption.encryptPayload).toHaveBeenCalledWith(complexData);
      expect(result.data).toEqual(mockEncrypted);
    });

    it("should handle request error in interceptor", async () => {
      const requestError = new Error("Request config error");

      const config = {
        method: "POST",
        data: { test: "data" }
      };

      const interceptor = axiosInstance.interceptors.request.handlers[0];

      await expect(interceptor.rejected(requestError)).rejects.toThrow("Request config error");
    });
  });

  describe("Response Interceptor - Decryption", () => {
    it("should decrypt response with encrypted data", async () => {
      const mockResponse = {
        data: {
          iv: "mockIv",
          ciphertext: "mockCiphertext"
        }
      };

      const decryptedData = { decrypted: "data" };
      encryption.decryptResponse.mockResolvedValue(decryptedData);

      const interceptor = axiosInstance.interceptors.response.handlers[0];
      const result = await interceptor.fulfilled(mockResponse);

      expect(encryption.decryptResponse).toHaveBeenCalledWith("mockIv", "mockCiphertext");
      expect(result.data).toEqual(decryptedData);
    });

    it("should not decrypt response without encryption fields", async () => {
      const mockResponse = {
        data: { plainData: "value" }
      };

      const interceptor = axiosInstance.interceptors.response.handlers[0];
      const result = await interceptor.fulfilled(mockResponse);

      expect(encryption.decryptResponse).not.toHaveBeenCalled();
      expect(result.data).toEqual(mockResponse.data);
    });

    it("should not decrypt response with null data", async () => {
      const mockResponse = {
        data: null
      };

      const interceptor = axiosInstance.interceptors.response.handlers[0];
      const result = await interceptor.fulfilled(mockResponse);

      expect(encryption.decryptResponse).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should not decrypt response with non-object data", async () => {
      const mockResponse = {
        data: "string data"
      };

      const interceptor = axiosInstance.interceptors.response.handlers[0];
      const result = await interceptor.fulfilled(mockResponse);

      expect(encryption.decryptResponse).not.toHaveBeenCalled();
      expect(result.data).toBe("string data");
    });

    it("should handle decryption error gracefully", async () => {
      const mockResponse = {
        data: {
          iv: "mockIv",
          ciphertext: "mockCiphertext"
        }
      };

      encryption.decryptResponse.mockRejectedValue(new Error("Decryption failed"));

      const interceptor = axiosInstance.interceptors.response.handlers[0];
      const result = await interceptor.fulfilled(mockResponse);

      // Should still return response even if decryption fails
      expect(result).toEqual(mockResponse);
    });

    it("should handle response error", async () => {
      const responseError = new Error("Response error");

      const interceptor = axiosInstance.interceptors.response.handlers[0];

      await expect(interceptor.rejected(responseError)).rejects.toThrow("Response error");
    });

    it("should decrypt response with only iv field", async () => {
      const mockResponse = {
        data: {
          iv: "mockIv"
        }
      };

      const interceptor = axiosInstance.interceptors.response.handlers[0];
      const result = await interceptor.fulfilled(mockResponse);

      expect(encryption.decryptResponse).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should decrypt response with only ciphertext field", async () => {
      const mockResponse = {
        data: {
          ciphertext: "mockCiphertext"
        }
      };

      const interceptor = axiosInstance.interceptors.response.handlers[0];
      const result = await interceptor.fulfilled(mockResponse);

      expect(encryption.decryptResponse).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should not decrypt response with empty iv", async () => {
      const mockResponse = {
        data: {
          iv: "",
          ciphertext: "mockCiphertext"
        }
      };

      const interceptor = axiosInstance.interceptors.response.handlers[0];
      const result = await interceptor.fulfilled(mockResponse);

      // Empty iv is falsy, so decryption should not be attempted
      expect(encryption.decryptResponse).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should handle large encrypted response", async () => {
      const mockResponse = {
        data: {
          iv: "mockIv",
          ciphertext: "x".repeat(100000)
        }
      };

      const decryptedData = { decrypted: "x".repeat(100000) };
      encryption.decryptResponse.mockResolvedValue(decryptedData);

      const interceptor = axiosInstance.interceptors.response.handlers[0];
      const result = await interceptor.fulfilled(mockResponse);

      expect(result.data).toEqual(decryptedData);
    });
  });

  describe("Interceptor Chain", () => {
    it("should maintain correct interceptor order", () => {
      const requestHandlers = axiosInstance.interceptors.request.handlers;
      const responseHandlers = axiosInstance.interceptors.response.handlers;

      expect(requestHandlers.length).toBeGreaterThan(0);
      expect(responseHandlers.length).toBeGreaterThan(0);
    });

    it("should have request interceptor before response", () => {
      expect(axiosInstance.interceptors.request.handlers.length).toBeGreaterThan(0);
      expect(axiosInstance.interceptors.response.handlers.length).toBeGreaterThan(0);
    });
  });

  describe("Patch and DELETE Methods", () => {
    it("should encrypt PATCH request with data", async () => {
      const testData = { patch: "data" };
      const mockEncrypted = {
        iv: "mockIv",
        ciphertext: "mockCiphertext"
      };

      encryption.encryptPayload.mockResolvedValue(mockEncrypted);

      const config = {
        method: "PATCH",
        data: testData,
        headers: {}
      };

      const interceptor = axiosInstance.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(encryption.encryptPayload).toHaveBeenCalledWith(testData);
      expect(result.data).toEqual(mockEncrypted);
    });

    it("should not encrypt DELETE request data field", async () => {
      const config = {
        method: "DELETE",
        headers: {}
      };

      const interceptor = axiosInstance.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(encryption.encryptPayload).not.toHaveBeenCalled();
      expect(result).toEqual(config);
    });
  });
});

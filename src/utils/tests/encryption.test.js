import {
  initiateKeyExchange,
  encryptPayload,
  decryptResponse
} from "../encryption";

// Mock the Web Crypto API
global.crypto = {
  subtle: {
    generateKey: jest.fn(),
    exportKey: jest.fn(),
    importKey: jest.fn(),
    deriveKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn()
  },
  getRandomValues: jest.fn()
};

// Mock fetch API
global.fetch = jest.fn();

describe("Encryption Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();

    // Mock TextEncoder
    global.TextEncoder = jest.fn(() => ({
      encode: jest.fn((str) => new Uint8Array(str.length))
    }));

    // Mock TextDecoder
    global.TextDecoder = jest.fn(() => ({
      decode: jest.fn((arr) => JSON.stringify({ decoded: "data" }))
    }));

    // Mock btoa and atob
    global.btoa = jest.fn((str) => `base64(${str})`);
    global.atob = jest.fn((str) => {
      if (str === "base64(mockIv)" || str === "mockIv") return "decodedIv";
      if (str === "base64(mockCiphertext)" || str === "mockCiphertext") return "decodedCiphertext";
      return str.replace("base64(", "").replace(")", "");
    });
  });

  describe("initiateKeyExchange", () => {
    it("should successfully perform ECDH key exchange", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      const mockClientPublicKeyBuffer = new ArrayBuffer(65);
      const mockServerPublicKeyB64 = "mockServerPublicKey";
      const mockServerPublicKey = { type: "server-public" };
      const mockSharedKey = { type: "shared-key" };

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(mockClientPublicKeyBuffer);
      crypto.subtle.importKey.mockResolvedValue(mockServerPublicKey);
      crypto.subtle.deriveKey.mockResolvedValue(mockSharedKey);

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: mockServerPublicKeyB64 })
      });

      await initiateKeyExchange();

      expect(crypto.subtle.generateKey).toHaveBeenCalledWith(
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveKey"]
      );

      expect(fetch).toHaveBeenCalledWith(
        "https://localhost:8000/app/v1/commons/keyExchange",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        })
      );

      expect(console.log).toHaveBeenCalledWith(
        "Key exchange successful — secure session established"
      );
    });

    it("should handle key generation error", async () => {
      const error = new Error("Key generation failed");
      crypto.subtle.generateKey.mockRejectedValue(error);

      await expect(initiateKeyExchange()).rejects.toThrow("Key generation failed");
    });

    it("should handle fetch error", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      const mockClientPublicKeyBuffer = new ArrayBuffer(65);

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(mockClientPublicKeyBuffer);

      const fetchError = new Error("Network error");
      fetch.mockRejectedValue(fetchError);

      await expect(initiateKeyExchange()).rejects.toThrow("Network error");
    });

    it("should handle server response parsing error", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      const mockClientPublicKeyBuffer = new ArrayBuffer(65);

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(mockClientPublicKeyBuffer);

      fetch.mockResolvedValue({
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON"))
      });

      await expect(initiateKeyExchange()).rejects.toThrow("Invalid JSON");
    });

    it("should handle key import error", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      const mockClientPublicKeyBuffer = new ArrayBuffer(65);
      const mockServerPublicKeyB64 = "mockServerPublicKey";

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(mockClientPublicKeyBuffer);
      crypto.subtle.importKey.mockRejectedValue(new Error("Import failed"));

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: mockServerPublicKeyB64 })
      });

      await expect(initiateKeyExchange()).rejects.toThrow("Import failed");
    });

    it("should handle key derivation error", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      const mockClientPublicKeyBuffer = new ArrayBuffer(65);
      const mockServerPublicKeyB64 = "mockServerPublicKey";
      const mockServerPublicKey = { type: "server-public" };

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(mockClientPublicKeyBuffer);
      crypto.subtle.importKey.mockResolvedValue(mockServerPublicKey);
      crypto.subtle.deriveKey.mockRejectedValue(new Error("Derivation failed"));

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: mockServerPublicKeyB64 })
      });

      await expect(initiateKeyExchange()).rejects.toThrow("Derivation failed");
    });

    it("should use correct ECDH parameters", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      const mockClientPublicKeyBuffer = new ArrayBuffer(65);
      const mockServerPublicKeyB64 = "mockServerPublicKey";
      const mockServerPublicKey = { type: "server-public" };
      const mockSharedKey = { type: "shared-key" };

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(mockClientPublicKeyBuffer);
      crypto.subtle.importKey.mockResolvedValue(mockServerPublicKey);
      crypto.subtle.deriveKey.mockResolvedValue(mockSharedKey);

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: mockServerPublicKeyB64 })
      });

      await initiateKeyExchange();

      expect(crypto.subtle.deriveKey).toHaveBeenCalledWith(
        { name: "ECDH", public: mockServerPublicKey },
        mockClientKeyPair.privateKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
    });

    it("should export key as SPKI format", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      const mockClientPublicKeyBuffer = new ArrayBuffer(65);
      const mockServerPublicKeyB64 = "mockServerPublicKey";
      const mockServerPublicKey = { type: "server-public" };
      const mockSharedKey = { type: "shared-key" };

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(mockClientPublicKeyBuffer);
      crypto.subtle.importKey.mockResolvedValue(mockServerPublicKey);
      crypto.subtle.deriveKey.mockResolvedValue(mockSharedKey);

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: mockServerPublicKeyB64 })
      });

      await initiateKeyExchange();

      expect(crypto.subtle.exportKey).toHaveBeenCalledWith(
        "spki",
        mockClientKeyPair.publicKey
      );
    });
  });

  describe("encryptPayload", () => {
    it("should throw error if key exchange not completed", async () => {
      await expect(encryptPayload({ test: "data" })).rejects.toThrow();
    });
  });

  describe("decryptResponse", () => {
    it("should be defined and callable", () => {
      expect(typeof decryptResponse).toBe("function");
    });
  });

  describe("Key Exchange Flow", () => {
    it("should complete full key exchange workflow", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(new ArrayBuffer(65));
      crypto.subtle.importKey.mockResolvedValue({ type: "server-public" });
      crypto.subtle.deriveKey.mockResolvedValue({ type: "shared-key" });

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: "base64key" })
      });

      await initiateKeyExchange();

      expect(crypto.subtle.generateKey).toHaveBeenCalled();
      expect(crypto.subtle.exportKey).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalled();
      expect(crypto.subtle.importKey).toHaveBeenCalled();
      expect(crypto.subtle.deriveKey).toHaveBeenCalled();
    });

    it("should use HTTPS with localhost for key exchange", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(new ArrayBuffer(65));
      crypto.subtle.importKey.mockResolvedValue({ type: "server-public" });
      crypto.subtle.deriveKey.mockResolvedValue({ type: "shared-key" });

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: "base64key" })
      });

      await initiateKeyExchange();

      expect(fetch).toHaveBeenCalledWith(
        "https://localhost:8000/app/v1/commons/keyExchange",
        expect.any(Object)
      );
    });

    it("should include public key in key exchange request", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(new ArrayBuffer(65));
      crypto.subtle.importKey.mockResolvedValue({ type: "server-public" });
      crypto.subtle.deriveKey.mockResolvedValue({ type: "shared-key" });

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: "base64key" })
      });

      await initiateKeyExchange();

      const callArgs = fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body).toHaveProperty("publicKey");
    });
  });

  describe("Encryption Configuration", () => {
    it("should use AES-GCM algorithm", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(new ArrayBuffer(65));
      crypto.subtle.importKey.mockResolvedValue({ type: "server-public" });
      crypto.subtle.deriveKey.mockResolvedValue({ type: "shared-key" });

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: "base64key" })
      });

      await initiateKeyExchange();

      expect(crypto.subtle.deriveKey).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ name: "AES-GCM" }),
        expect.anything(),
        expect.anything()
      );
    });

    it("should enable key extractability", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(new ArrayBuffer(65));
      crypto.subtle.importKey.mockResolvedValue({ type: "server-public" });
      crypto.subtle.deriveKey.mockResolvedValue({ type: "shared-key" });

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: "base64key" })
      });

      await initiateKeyExchange();

      const deriveKeyCall = crypto.subtle.deriveKey.mock.calls[0];
      expect(deriveKeyCall[3]).toBe(true);
    });

    it("should allow both encrypt and decrypt operations", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(new ArrayBuffer(65));
      crypto.subtle.importKey.mockResolvedValue({ type: "server-public" });
      crypto.subtle.deriveKey.mockResolvedValue({ type: "shared-key" });

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: "base64key" })
      });

      await initiateKeyExchange();

      const deriveKeyCall = crypto.subtle.deriveKey.mock.calls[0];
      const usages = deriveKeyCall[4];

      expect(usages).toContain("encrypt");
      expect(usages).toContain("decrypt");
    });
  });

  describe("Key Exchange Security", () => {
    it("should use P-256 curve for ECDH", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(new ArrayBuffer(65));
      crypto.subtle.importKey.mockResolvedValue({ type: "public" });
      crypto.subtle.deriveKey.mockResolvedValue({ type: "shared-key" });

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: "base64key" })
      });

      await initiateKeyExchange();

      expect(crypto.subtle.generateKey).toHaveBeenCalledWith(
        expect.objectContaining({ namedCurve: "P-256" }),
        expect.anything(),
        expect.anything()
      );
    });

    it("should use 256-bit AES-GCM key", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(new ArrayBuffer(65));
      crypto.subtle.importKey.mockResolvedValue({ type: "server-public" });
      crypto.subtle.deriveKey.mockResolvedValue({ type: "shared-key" });

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: "base64key" })
      });

      await initiateKeyExchange();

      expect(crypto.subtle.deriveKey).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ length: 256 }),
        expect.anything(),
        expect.anything()
      );
    });

    it("should send credentials with key exchange request", async () => {
      const mockClientKeyPair = {
        publicKey: { type: "public" },
        privateKey: { type: "private" }
      };

      crypto.subtle.generateKey.mockResolvedValue(mockClientKeyPair);
      crypto.subtle.exportKey.mockResolvedValue(new ArrayBuffer(65));
      crypto.subtle.importKey.mockResolvedValue({ type: "public" });
      crypto.subtle.deriveKey.mockResolvedValue({ type: "shared-key" });

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ publicKey: "base64key" })
      });

      await initiateKeyExchange();

      expect(fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          credentials: "include"
        })
      );
    });
  });
});

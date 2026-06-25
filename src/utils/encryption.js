let sharedKey = null;

export async function initiateKeyExchange() {
  const clientKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"],
  );

  const clientPublicKeyBuffer = await crypto.subtle.exportKey(
    "spki",
    clientKeyPair.publicKey,
  );
  const clientPublicKeyB64 = btoa(
    String.fromCharCode(...new Uint8Array(clientPublicKeyBuffer)),
  );

  const res = await fetch("https://localhost:8000/app/v1/commons/keyExchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ publicKey: clientPublicKeyB64 }),
  });

  const { publicKey: serverPublicKeyB64 } = await res.json();

  const serverPublicKeyBytes = Uint8Array.from(atob(serverPublicKeyB64), (c) =>
    c.charCodeAt(0),
  );
  const serverPublicKey = await crypto.subtle.importKey(
    "spki",
    serverPublicKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );

  sharedKey = await crypto.subtle.deriveKey(
    { name: "ECDH", public: serverPublicKey },
    clientKeyPair.privateKey,
    { name: "AES-GCM", length: 256 },
    true, 
    ["encrypt", "decrypt"]
);

  console.log("Key exchange successful — secure session established");
}

export async function encryptPayload(data) {
  if (!sharedKey) throw new Error("Key exchange not completed");

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    encoded,
  );

  return {
    iv: btoa(String.fromCharCode(...iv)),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
  };
}

export async function decryptResponse(iv, ciphertext) {
    if (!sharedKey) throw new Error("Key exchange not completed");

    const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    const ciphertextBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));


    const exportedKey = await crypto.subtle.exportKey("raw", sharedKey);
    const keyB64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

    const plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBytes },
        sharedKey,
        ciphertextBytes
    );

    return JSON.parse(new TextDecoder().decode(plaintext));
}
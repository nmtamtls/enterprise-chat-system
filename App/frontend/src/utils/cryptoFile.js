export async function generateAESKey() {

  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

//
// EXPORT AES KEY
//
export async function exportKey(key) {

  const exported =
    await window.crypto.subtle.exportKey(
      "raw",
      key
    );

  return btoa(
    String.fromCharCode(
      ...new Uint8Array(exported)
    )
  );
}

//
// IMPORT AES KEY
//
export async function importKey(base64Key) {

  const binary = Uint8Array.from(
    atob(base64Key),
    c => c.charCodeAt(0)
  );

  return await window.crypto.subtle.importKey(
    "raw",
    binary,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

//
// ENCRYPT FILE
//
export async function encryptFile(file, key) {

  // Đọc file gốc
  const fileBuffer =
    await file.arrayBuffer();

  // Tạo IV 12 bytes
  const iv =
    window.crypto.getRandomValues(
      new Uint8Array(12)
    );

  // Encrypt
  const encryptedBuffer =
    await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      fileBuffer
    );

  // Blob encrypted
  const encryptedBlob =
    new Blob(
      [encryptedBuffer],
      {
        type: "application/octet-stream",
      }
    );

  return {
    encryptedBlob,
    iv: Array.from(iv),
  };
}

//
// DECRYPT FILE
//
export async function decryptFile(
  encryptedBlob,
  key,
  iv,
  mimeType
) {

  try {

    // Blob -> ArrayBuffer
    const encryptedBuffer =
      await encryptedBlob.arrayBuffer();

    // Convert IV
    const ivArray =
      new Uint8Array(iv);

    console.log("DECRYPT IV:", ivArray);

    // AES decrypt
    const decryptedBuffer =
      await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: ivArray,
        },
        key,
        encryptedBuffer
      );

    // Trả về file gốc
    return new Blob(
      [decryptedBuffer],
      {
        type:
          mimeType ||
          "application/octet-stream",
      }
    );

  } catch (err) {

    console.error(
      "AES decrypt failed:",
      err
    );

    throw err;
  }
}

export async function deriveKeyFromPassword(password) {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("MY_STATIC_SALT_123"), // Bạn nên đổi chuỗi này để tăng bảo mật
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}
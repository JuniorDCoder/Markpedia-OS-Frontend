export interface EncryptedData {
    ciphertext: string; // Base64 encoded
    iv: string;         // Base64 encoded, 12 bytes
    salt: string;       // Base64 encoded, 16 bytes
}

// Configuration
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // Standard for AES-GCM
const KEY_LENGTH = 256;

// Utilities for ArrayBuffer <-> Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Derives a cryptographic key from a password and salt using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts a string (e.g. JSON stringified data) using the password
 */
export async function encryptVault(data: string, password: string): Promise<EncryptedData> {
    const enc = new TextEncoder();
    const encodedData = enc.encode(data);

    // 1. Generate random salt and IV
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // 2. Derive key
    const key = await deriveKey(password, salt);

    // 3. Encrypt
    const encryptedContent = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        key,
        encodedData
    );

    return {
        ciphertext: arrayBufferToBase64(encryptedContent),
        iv: arrayBufferToBase64(iv),
        salt: arrayBufferToBase64(salt),
    };
}

/**
 * Decrypts an encrypted object using the password
 * Throws error if decryption fails (wrong password or corrupted data)
 */
export async function decryptVault(encryptedData: EncryptedData, password: string): Promise<string> {
    try {
        const salt = new Uint8Array(base64ToArrayBuffer(encryptedData.salt));
        const iv = new Uint8Array(base64ToArrayBuffer(encryptedData.iv));
        const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);

        // 1. Re-derive key
        const key = await deriveKey(password, salt);

        // 2. Decrypt
        const decryptedContent = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            ciphertext
        );

        const dec = new TextDecoder();
        return dec.decode(decryptedContent);
    } catch (error) {
        // WebCrypto throws generic errors for decryption failure
        throw new Error('Decryption failed. Incorrect password or corrupted data.');
    }
}

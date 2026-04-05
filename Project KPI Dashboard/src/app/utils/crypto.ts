// ============================================================================
// CRYPTO — AES-256-GCM usando Web Crypto API (sin dependencias externas)
// Clave generada localmente y almacenada en localStorage.
// Proporciona cifrado en reposo para datos sensibles.
// ============================================================================

const KEY_STORAGE = 'dashfin_enc_key_v1';
const ALGO = { name: 'AES-GCM', length: 256 } as const;

let cachedKey: CryptoKey | null = null;

async function getOrCreateKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const stored = localStorage.getItem(KEY_STORAGE);
  if (stored) {
    try {
      const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
      cachedKey = await crypto.subtle.importKey('raw', raw, ALGO, false, ['encrypt', 'decrypt']);
      return cachedKey;
    } catch {
      // Key corrupted — regenerate
    }
  }

  const key = await crypto.subtle.generateKey(ALGO, true, ['encrypt', 'decrypt']);
  const exported = await crypto.subtle.exportKey('raw', key);
  const b64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  localStorage.setItem(KEY_STORAGE, b64);
  cachedKey = key;
  return key;
}

export async function encryptData(plaintext: string): Promise<string> {
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  // Pack iv (12 bytes) + ciphertext
  const combined = new Uint8Array(12 + cipherBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuffer), 12);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(ciphertext: string): Promise<string> {
  const key = await getOrCreateKey();
  const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(plainBuffer);
}

/** Destruye la clave local (borrado total). Los datos cifrados quedan ilegibles. */
export function destroyKey(): void {
  cachedKey = null;
  localStorage.removeItem(KEY_STORAGE);
}

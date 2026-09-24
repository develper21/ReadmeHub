import crypto from "node:crypto";

export const uuid = () => crypto.randomUUID();

/** Base64url encode */
export const b64url = (buf: Buffer) => buf.toString("base64url");

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/** Deterministic hash used as the AES encryption key (JWT_SECRET-derived) */
function aesKey(): Buffer {
  return crypto.createHash("sha256").update(process.env.JWT_SECRET || "dev-secret").digest();
}

export function encryptToken(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", aesKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv.toString("hex"), enc.toString("hex"), cipher.getAuthTag().toString("hex")].join(":");
}

export function decryptToken(packed: string): string {
  const [ivHex, encHex, tagHex] = packed.split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

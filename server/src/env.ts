/**
 * Tiny .env loader (no dotenv dependency).
 * Loads, in order (later files do NOT override earlier ones):
 *   1. .env              (base, optional)
 *   2. .env.local        (local dev overrides)     — when NODE_ENV !== "production"
 *   3. .env.production   (production overrides)    — when NODE_ENV === "production"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile(file: string) {
  const envPath = path.join(__dirname, "..", file);
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value !== "" && !(key in process.env)) process.env[key] = value;
  }
}

const isProd = process.env.NODE_ENV === "production";
loadEnvFile(".env");
loadEnvFile(isProd ? ".env.production" : ".env.local");

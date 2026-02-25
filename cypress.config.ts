import { defineConfig } from "cypress";
import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

const DEFAULT_TIMEOUT_MS = 30000;
const BACKEND_TOKEN_SCRIPT = "/Users/icy/year3.2/Backend/generate_and_store_token.py";
const JWT_REGEX = /[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/;
const REQUIRED_R2_KEYS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "NEXT_PUBLIC_R2_PUBLIC_URL",
] as const;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

async function fetchJsonHealth(url: string) {
  const res = await withTimeout(fetch(url), DEFAULT_TIMEOUT_MS, `Health check: ${url}`);
  if (!res.ok) {
    throw new Error(`Health check failed (${res.status}) for ${url}`);
  }
  return null;
}

function readEnvFiles(cwd: string): Record<string, string> {
  const files = [".env.local", ".env.development.local", ".env", ".env.development"];
  const merged: Record<string, string> = {};

  for (const rel of files) {
    const filePath = path.join(cwd, rel);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const exportless = line.startsWith("export ") ? line.slice(7) : line;
      const eqIndex = exportless.indexOf("=");
      if (eqIndex <= 0) continue;
      const key = exportless.slice(0, eqIndex).trim();
      let value = exportless.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in merged)) {
        merged[key] = value;
      }
    }
  }

  return merged;
}

function getFrontendEnvPresence(projectRoot: string) {
  const fileEnv = readEnvFiles(projectRoot);
  const get = (key: string) => process.env[key] ?? fileEnv[key];
  const missing = REQUIRED_R2_KEYS.filter((key) => {
    const value = get(key);
    return value == null || String(value).trim() === "";
  });

  return { missing };
}

function extractToken(output: string): string | null {
  const regexMatch = output.match(JWT_REGEX)?.[0];
  if (regexMatch) return regexMatch;

  try {
    const parsed = JSON.parse(output);
    const token = parsed?.token ?? parsed?.access_token ?? parsed?.jwt;
    return typeof token === "string" && token ? token : null;
  } catch {
    return null;
  }
}

async function runBackendTokenScript() {
  if (!existsSync(BACKEND_TOKEN_SCRIPT)) {
    throw new Error(
      `Token bootstrap script not found: ${BACKEND_TOKEN_SCRIPT}. ` +
        "See cypress/e2e/frontend-integration/README.md"
    );
  }

  const cwd = path.dirname(BACKEND_TOKEN_SCRIPT);
  const candidates = ["python3", "python"] as const;
  let lastError: unknown = null;

  for (const bin of candidates) {
    try {
      const { stdout, stderr } = await execFileAsync(
        bin,
        [path.basename(BACKEND_TOKEN_SCRIPT)],
        { cwd, timeout: 60000, maxBuffer: 1024 * 1024 }
      );
      const combined = [stdout, stderr].filter(Boolean).join("\n").trim();
      const token = extractToken(combined);
      if (!token) {
        throw new Error(
          `Token script ran but no JWT found in output. stdout/stderr snippet:\n${combined.slice(0, 500)}`
        );
      }
      return token;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to execute token bootstrap script");
}

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    async setupNodeEvents(on, config) {
      const frontendBaseUrl = String(config.env?.frontendBaseUrl || config.baseUrl || "http://localhost:3000")
        .replace(/\/+$/, "");
      config.baseUrl = frontendBaseUrl;

      on("task", {
        async "fi:frontendHealth"(url: unknown) {
          const target = String(url || "http://localhost:3000");
          return fetchJsonHealth(target);
        },
        async "fi:backendHealth"(url: unknown) {
          const target = String(url || "http://localhost:8000/openapi.json");
          return fetchJsonHealth(target);
        },
        async "fi:token"() {
          return runBackendTokenScript();
        },
        async "fi:tokenSafe"() {
          try {
            const token = await runBackendTokenScript();
            return { ok: true, token };
          } catch (error) {
            return {
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
        async "fi:r2Preflight"(args: unknown) {
          const frontendBaseUrl =
            typeof args === "object" && args && "frontendBaseUrl" in args
              ? String((args as { frontendBaseUrl?: unknown }).frontendBaseUrl || "http://localhost:3000")
              : "http://localhost:3000";

          await fetchJsonHealth(frontendBaseUrl);

          const { missing } = getFrontendEnvPresence(config.projectRoot);
          if (missing.length > 0) {
            throw new Error(
              `R2 preflight failed: missing frontend env keys: ${missing.join(", ")}. ` +
                "Set them in process env or .env.local before running upload specs."
            );
          }

          return { ok: true, frontendBaseUrl };
        },
      });

      return config;
    },
  },
});

import { defineConfig } from "cypress";
import { spawnSync } from "node:child_process";

const BACKEND_DIR = "/Users/icy/year3.2/Backend";

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, body };
}

function runTokenScript() {
  const pythonCandidates = [".venv/bin/python", "python3", "python"];
  let lastError = "";

  for (const python of pythonCandidates) {
    const result = spawnSync(python, ["generate_and_store_token.py"], {
      cwd: BACKEND_DIR,
      encoding: "utf8",
    });

    if (result.status === 0) {
      const output = `${result.stdout}\n${result.stderr}`;
      const match =
        output.match(/Generated Token:\s*([A-Za-z0-9._-]+)/) ??
        output.match(/\b(eyJ[A-Za-z0-9._-]+)\b/);

      if (!match) {
        throw new Error(
          `Token script ran but no JWT found in output.\nOutput:\n${output}`
        );
      }

      return match[1];
    }

    lastError = `${python}: ${result.stderr || result.stdout || "unknown error"}`;
  }

  throw new Error(
    `Unable to generate auth token from ${BACKEND_DIR}/generate_and_store_token.py.\nLast error: ${lastError}`
  );
}

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      on("task", {
        async "fi:backendHealth"(url?: string) {
          const target = String(url || "http://localhost:8000/openapi.json");
          const result = await fetchJson(target);
          if (!result.ok) {
            throw new Error(
              `Backend health check failed (${result.status}) at ${target}`
            );
          }
          return result;
        },
        async "fi:frontendHealth"(url?: string) {
          const target = String(url || "http://localhost:3000");
          const result = await fetchJson(target);
          if (!result.ok) {
            throw new Error(
              `Frontend health check failed (${result.status}) at ${target}`
            );
          }
          return result;
        },
        "fi:token"() {
          return runTokenScript();
        },
        "fi:tokenSafe"() {
          try {
            return { ok: true, token: runTokenScript() };
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            return { ok: false, error: message };
          }
        },
        async "fi:r2Preflight"(payload?: { frontendBaseUrl?: string }) {
          const frontendBaseUrl =
            payload?.frontendBaseUrl ?? "http://localhost:3000";
          const res = await fetch(`${frontendBaseUrl}/api/upload/presigned-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: "cypress-preflight.jpg",
              content_type: "image/jpeg",
              folder: "records",
            }),
          });

          const body = await res
            .json()
            .catch(() => ({ detail: "Invalid JSON response" }));

          if (!res.ok) {
            throw new Error(
              `R2 preflight failed (${res.status}) at ${frontendBaseUrl}/api/upload/presigned-url: ${JSON.stringify(
                body
              )}`
            );
          }

          if (
            typeof body !== "object" ||
            body === null ||
            !("upload_url" in body) ||
            !("public_url" in body)
          ) {
            throw new Error(
              `R2 preflight response missing upload_url/public_url: ${JSON.stringify(
                body
              )}`
            );
          }

          return body;
        },
      });

      return config;
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
  },
});

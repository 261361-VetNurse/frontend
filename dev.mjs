import { spawn } from "child_process";
import killPort from "kill-port";
import kill from "tree-kill";

// Pre-flight check
console.log("🧹 Clearing ports 3000, 3001, and 5173...");
try {
    await killPort(3000, 'tcp');
    await killPort(3001, 'tcp');
    await killPort(5173, 'tcp');
} catch (e) {
    // Ignore if nothing is running
}

// Start Backend (Hono)
console.log("🚀 Starting Hono backend on port 3001...");
const backend = spawn("bun", ["run", "server.ts"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, PORT: "3001" }
});

// Start Frontend (Vite)
console.log("🚀 Starting Vite frontend on port 5173...");
const frontend = spawn("vite", ["--port", "5173"], {
    stdio: "inherit",
    shell: true,
});

// Handling termination signals gracefully
let isShuttingDown = false;
const cleanup = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log("\n🛑 Stopping servers...");

    if (backend.pid) kill(backend.pid, "SIGKILL");
    if (frontend.pid) kill(frontend.pid, "SIGKILL");

    setTimeout(() => process.exit(0), 1000);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);

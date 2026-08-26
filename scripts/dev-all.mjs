import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args) {
  return spawn(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
}

const api = run("python", ["backend/app.py"]);
const web = run("npx", ["vite"]);

function shutdown() {
  api.kill();
  web.kill();
}

api.on("exit", (code) => {
  if (code && code !== 0) {
    console.error("[dev-all] Flask 종료 코드", code);
  }
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

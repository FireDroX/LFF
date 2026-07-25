import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(currentDirectory, "..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectDirectory, "");
  const apiTarget = `http://localhost:${env.PORT || 3001}`;

  return {
    envDir: projectDirectory,
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": apiTarget,
        "/healthz": apiTarget,
      },
    },
  };
});

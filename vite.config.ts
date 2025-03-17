import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import officeAddin from "vite-plugin-office-addin";
import devCerts from "office-addin-dev-certs";
import tailwindcss from "@tailwindcss/vite";

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

export default defineConfig(async ({ mode }) => ({
  plugins: [
    react(),
    officeAddin({
      devUrl: "https://localhost:3000",
    }),
    tailwindcss(),
  ],
  root: "src",
  build: {
    rollupOptions: {
      input: {
        taskpane: "/taskpane/taskpane.html",
        commands: "/commands/commands.html",
      },
    },
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: mode !== "production" ? { https: await getHttpsOptions() } : {},
}));

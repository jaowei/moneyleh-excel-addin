import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import officeAddin from "vite-plugin-office-addin";
export default defineConfig({
    plugins: [
        react(),
        officeAddin({
            path: "../manifest.xml",
            devUrl: "https://localhost:3000",
        }),
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
    },
    optimizeDeps: {
        esbuildOptions: {
            target: "esnext",
        },
    },
});
//# sourceMappingURL=vite.config.js.map
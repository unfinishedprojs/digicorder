import { defineConfig } from "vite";
import suidPlugin from "@suid/vite-plugin";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [suidPlugin(), solidPlugin()],
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    exclude: ['/home/samu/github/digicorder/node_modules/.vite/deps/worker.js?worker_file&type=module'], // Ensure worker.js is included in optimization
  },
});

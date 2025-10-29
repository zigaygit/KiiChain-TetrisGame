// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    rollupOptions: {
      // Jangan bundel modul ini ke dalam browser
      external: [
        "rollup",
        /^rollup\//,
        "path",
        "fs",
        "os",
        "util",
        "assert",
        "stream",
        "tty",
      ],
    },
  },
  resolve: {
    alias: {
      // tambahkan fallback untuk built-in Node modules agar tidak error di browser
      path: "path-browserify",
      util: "util/",
    },
  },
});

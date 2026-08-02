import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  server: {
    port: 5174,
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      // Two entries: the landing page and the documentation. The docs bundle
      // carries the whole generated documentation, which has no business being
      // downloaded by someone who only came to read the landing page.
      input: {
        main: resolve(__dirname, "index.html"),
        docs: resolve(__dirname, "docs.html"),
      },
    },
  },
});

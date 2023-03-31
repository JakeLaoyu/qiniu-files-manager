import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ArcoResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    host: "0.0.0.0",
    open: false,
    proxy: {
      "/api": {
        target: "http://localhost:2017",
        changeOrigin: true, // 允许跨域
        // rewrite: path => path.replace('/', '/'),
      },
    },
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ArcoResolver()],
    }),
    Components({
      resolvers: [
        ArcoResolver({
          sideEffect: true,
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    // fix mime process env
    "process.env": {},
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "axios", "pinia"],
          ui: ["@arco-design/web-vue"],
        },
      },
    },
  },
});

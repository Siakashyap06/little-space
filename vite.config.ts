import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  base: "./",
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "apple-touch-icon.png", "cafes/*.jpg"],
      workbox: { globPatterns: ["**/*.{js,css,html,svg,png,jpg,woff2}"] },
      manifest: {
        name: "Little Space",
        short_name: "Little Space",
        description: "Find a quiet café seat nearby, and help others find theirs.",
        theme_color: "#f8f7f2",
        background_color: "#f8f7f2",
        display: "standalone",
        orientation: "portrait",
        start_url: "./",
        scope: "./",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ]
});

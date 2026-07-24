import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["favicon-32.png", "apple-touch-icon.png"],
      manifest: {
        name: "StudyBun · Your Cozy JEE Study Companion",
        short_name: "StudyBun",
        description:
          "Your cozy JEE study companion — study tracking, planning, revision, and AI insights.",
        theme_color: "#FF9AAE",
        background_color: "#FFF8EF",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Only the built app-shell (JS/CSS/HTML/icons) is precached here.
        // Supabase and Gemini calls go to their own origins and are never
        // touched by this service worker, so app data always stays live.
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: { port: 5173 },
});

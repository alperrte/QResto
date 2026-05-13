import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const devServerSessionId = String(Date.now());

export default defineConfig({
  plugins: [react(), tailwindcss()],

  define: {
    global: "window",
    __QRESTO_DEV_SERVER_SESSION__: JSON.stringify(devServerSessionId),
  },

  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
});

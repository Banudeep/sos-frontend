import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build", // Vercel looks for a "build" directory by default; this line is optional if you prefer a different folder name
  },
});

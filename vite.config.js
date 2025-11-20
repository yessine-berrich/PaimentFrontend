import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // Le serveur NestJS est sur le port 3000
        target: "http://localhost:3000",
        changeOrigin: true, // 🚨 CORRECTION CRITIQUE : Nous gardons la réécriture simple.
        // Le frontend appellera directement le chemin complet /api/users/auth/login
        rewrite: (path) => path.replace(/^\/api/, "/api"), // Laisse /api pour cibler le AppModule
        // 💡 Ou, mieux :
        // rewrite: (path) => path, // La réécriture n'est pas nécessaire si on utilise /api comme préfixe.
      },
    },
  },
});

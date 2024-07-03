import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: ["notyf"],
  },
  base: "/prefix-tw/",
});

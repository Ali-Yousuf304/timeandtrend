import { defineConfig } from "@tanstack/react-start/config";
    2 import tsconfigPaths from "vite-tsconfig-paths";
    3 import tailwindcss from "@tailwindcss/vite";
    4
    5 export default defineConfig({
    6   server: {
    7     preset: "vercel",
    8   },
    9   vite: {
   10     plugins: [
   11       tsconfigPaths(),
   12       tailwindcss(),
   13     ],
   14   },
   15 });

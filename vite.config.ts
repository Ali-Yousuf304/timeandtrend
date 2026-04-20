import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
    vite: {
        // This tells the Nitro engine (used by TanStack Start) to build for Vercel
        nitro: {
            preset: "vercel",
        },
    },
});

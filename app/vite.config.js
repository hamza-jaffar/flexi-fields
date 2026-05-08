import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        react({ fastRefresh: false }),
        laravel({
            input: "resources/js/app.tsx",
            refresh: true,
        }),
    ],
});

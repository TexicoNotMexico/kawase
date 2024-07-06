import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
    manifest_version: 3,
    name: "Kawase",
    description: "An extension that turns Google's exchange rate chart into an audio visualizer",
    version: "1.0",
    icons: {
        "128": "images/icon-128.png",
    },
    content_scripts: [
        {
            js: ["scripts/content.ts"],
            matches: ["https://www.google.com/search*"],
        },
    ],
});

export default defineConfig({
    plugins: [crx({ manifest })],
});

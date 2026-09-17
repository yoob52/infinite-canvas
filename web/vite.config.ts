import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

import { parseChangelog } from "./src/lib/release";

const webDir = dirname(fileURLToPath(import.meta.url));
const localVersion = readFileSync(resolve(webDir, "../VERSION"), "utf8").trim() || "dev";
const localChangelog = readFileSync(resolve(webDir, "../CHANGELOG.md"), "utf8");
const appBase = process.env.VITE_BASE || "/workbench/";

// Expose /plugins/index.json with local plugin files from public/plugins.
// The frontend can discover and list them when enabled; development reads the directory live, while builds emit a static registry.
function localPluginsManifest(): Plugin {
    const pluginsDir = resolve(webDir, "public/plugins");
    const listLocalPlugins = () => {
        try {
            return readdirSync(pluginsDir)
                .filter((file) => file.endsWith(".js"))
                .sort()
                .map((file) => `/plugins/${file}`); // App-relative; the frontend prefixes Vite `base`.
        } catch {
            return [];
        }
    };
    return {
        name: "local-plugins-manifest",
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const path = req.url?.split("?")[0] || "";
                if (appBase !== "/" && (path === "/" || path === "")) {
                    res.statusCode = 302;
                    res.setHeader("Location", appBase);
                    res.end();
                    return;
                }
                if (path !== "/plugins/index.json" && !path.endsWith("/plugins/index.json")) return next();
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(listLocalPlugins()));
            });
        },
        configurePreviewServer(server) {
            server.middlewares.use((req, res, next) => {
                const path = req.url?.split("?")[0] || "";
                if (appBase !== "/" && (path === "/" || path === "")) {
                    res.statusCode = 302;
                    res.setHeader("Location", appBase);
                    res.end();
                    return;
                }
                next();
            });
        },
        generateBundle() {
            this.emitFile({ type: "asset", fileName: "plugins/index.json", source: JSON.stringify(listLocalPlugins()) });
        },
    };
}

export default defineConfig({
    base: appBase,
    plugins: [react(), localPluginsManifest()],
    resolve: {
        alias: {
            "@": resolve(webDir, "src"),
        },
    },
    define: {
        __APP_VERSION__: JSON.stringify(localVersion),
        __APP_RELEASES__: JSON.stringify(parseChangelog(localChangelog)),
    },
});

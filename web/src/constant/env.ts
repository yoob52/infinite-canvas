export const APP_VERSION = __APP_VERSION__ || "dev";

export const DOCS_URL = import.meta.env.VITE_DOC_URL || "https://docs.canvas.best";

/** Public file URL that follows Vite `base` (`/` locally, `/workbench/` in Docker). */
export function publicUrl(path: string) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;
    const base = import.meta.env.BASE_URL || "/";
    const prefix = base.endsWith("/") ? base : `${base}/`;
    if (prefix !== "/" && path.startsWith(prefix)) return path;
    return `${prefix}${path.replace(/^\//, "")}`;
}

// Official plugin registry URL: CI publishes to plugins-dist for jsDelivr delivery; an environment variable may override it for self-hosting.
export const PLUGIN_REGISTRY_URL = import.meta.env.VITE_PLUGIN_REGISTRY_URL || "https://cdn.jsdelivr.net/gh/basketikun/infinite-canvas@plugins-dist/official-plugins.json";

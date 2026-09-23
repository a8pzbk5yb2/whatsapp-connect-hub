// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// `bun run build:static` sets SHARED_HOSTING=1. That build emits a plain static
// site (HTML + JS + CSS) that any Apache/LiteSpeed shared host can serve, with
// no Node.js process required. The default build is unchanged.
const sharedHosting = process.env["SHARED_HOSTING"] === "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(sharedHosting ? { spa: { enabled: true, prerender: { outputPath: "/index.html" } } } : {}),
  },
  ...(sharedHosting ? { nitro: { preset: "static" as const } } : {}),
});

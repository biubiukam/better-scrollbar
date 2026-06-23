import type { UserConfig } from "vite"
import { defineConfig } from "vite"
import { createReactPlugins, sharedCssConfig, siteResolveConfig, siteRoot } from "./vite.config.shared"

export default defineConfig((): UserConfig => {
	return {
		root: siteRoot,
		base: "/better-scrollbar/",
		server: {
			port: 5173,
			cors: true,
		},
		resolve: siteResolveConfig,
		plugins: createReactPlugins(),
		css: sharedCssConfig,
		build: {
			outDir: "dist",
			emptyOutDir: true,
		},
	}
})

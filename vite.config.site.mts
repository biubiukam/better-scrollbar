import type { UserConfig } from "vite"
import { defineConfig } from "vite"
import { createReactPlugins, sharedCssConfig, siteResolveConfig } from "./vite.config.shared"

export default defineConfig((): UserConfig => {
	return {
		base: "/better-scrollbar/",
		server: {
			port: 3000,
			cors: true,
		},
		resolve: siteResolveConfig,
		plugins: createReactPlugins(),
		css: sharedCssConfig,
		build: {
			outDir: "dist-site",
			emptyOutDir: true,
		},
	}
})

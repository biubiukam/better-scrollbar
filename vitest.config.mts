/// <reference types="vitest" />
/// <reference types="vitest/globals" />
import { defineConfig } from "vitest/config"
import { createReactPlugins, sharedCssConfig, siteResolveConfig } from "./vite.config.shared"

export default defineConfig({
	plugins: createReactPlugins(),
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./test/setup.ts"],
		include: ["**/*.test.(ts|tsx)"],
		coverage: {
			reporter: ["text", "json", "html", "lcov"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["node_modules/", "test/", "dist/", "lib/", "es/", "site/", "coverage/"],
			thresholds: {
				statements: 100,
				branches: 100,
				functions: 100,
				lines: 100
			}
		},
		testTimeout: 20000
	},
	resolve: siteResolveConfig,
	css: sharedCssConfig
})

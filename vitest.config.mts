/// <reference types="vitest" />
/// <reference types="vitest/globals" />
import { defineConfig } from "vitest/config"
import { createReactPlugins, createVuePlugins, sharedCssConfig, siteResolveConfig } from "./vite.config.shared"

export default defineConfig({
	plugins: [...createReactPlugins(), ...createVuePlugins()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./test/setup.ts"],
		include: ["**/*.test.(ts|tsx)"],
		coverage: {
			reporter: ["text", "json", "html", "lcov"],
			include: ["packages/core/src/**/*.{ts,tsx}", "packages/react/src/**/*.{ts,tsx}", "packages/vue/src/**/*.{ts,vue}"],
			exclude: ["node_modules/", "test/", "dist/", "lib/", "es/", "apps/site/", "coverage/", "packages/*/dist/", "**/*.d.ts"],
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

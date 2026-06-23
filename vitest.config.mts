/// <reference types="vitest" />
/// <reference types="vitest/globals" />
import { defineConfig } from "vitest/config"
import { createReactPlugins, createVuePlugins, sharedCssConfig, siteResolveConfig } from "./vite.config.shared"

export default defineConfig({
	plugins: [...createReactPlugins(), ...createVuePlugins()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./apps/site/tests/setup.ts"],
		include: [
			"packages/*/tests/**/*.test.{ts,tsx}",
			"apps/site/tests/**/*.test.{ts,tsx}"
		],
		coverage: {
			reporter: ["text", "json", "html", "lcov"],
			include: ["packages/core/src/**/*.{ts,tsx}", "packages/react/src/**/*.{ts,tsx}", "packages/vue/src/**/*.{ts,vue}"],
			exclude: ["node_modules/", "tests/", "dist/", "lib/", "es/", "apps/site/", "coverage/", "packages/*/dist/", "**/*.d.ts", "packages/react/src/virtualRange.ts"],
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

/// <reference types="vitest" />
/// <reference types="vitest/globals" />
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { join } from "path"

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./test/setup.ts"],
		include: ["**/*.test.(ts|tsx)"],
		coverage: {
			reporter: ["text", "json", "html", "lcov"],
			exclude: ["node_modules/", "test/", "dist/", "lib/", "es/", "site/", "coverage/"]
		},
		testTimeout: 20000
	},
	resolve: {
		alias: [
			{
				find: "@",
				replacement: join(__dirname, "site")
			},
			{
				find: "ScrollBar",
				replacement: join(__dirname, "src")
			}
		]
	},
	css: {
		modules: {
			localsConvention: "camelCaseOnly",
			generateScopedName: "[local]_[hash:base64:8]"
		},
		preprocessorOptions: {
			less: {
				javascriptEnabled: true
			}
		}
	}
})

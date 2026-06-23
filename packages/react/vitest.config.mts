import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const configDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./tests/setup.ts"],
		include: ["tests/**/*.test.{ts,tsx}"],
		testTimeout: 20000
	},
	resolve: {
		alias: [
			{
				find: "@better-scrollbar/react",
				replacement: join(configDir, "src")
			},
			{
				find: "@better-scrollbar/core",
				replacement: join(configDir, "../core/src")
			}
		]
	},
	css: {
		modules: {
			localsConvention: "camelCaseOnly",
			generateScopedName: "[local]_[hash:base64:8]"
		},
		preprocessorOptions: {
			less: { javascriptEnabled: true }
		}
	}
})

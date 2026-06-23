import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const configDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	plugins: [vue()],
	test: {
		environment: "jsdom",
		setupFiles: ["./tests/setup.ts"],
		include: ["tests/**/*.test.{ts,tsx}"]
	},
	resolve: {
		alias: [
			{
				find: "@better-scrollbar/core",
				replacement: join(configDir, "../core/src")
			}
		]
	}
})

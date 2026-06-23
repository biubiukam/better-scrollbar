import { resolve } from "path"
import type { UserConfig } from "vite"
import { defineConfig } from "vite"
import { sharedCssConfig } from "../../vite.config.shared"

const fileNameByFormat: NonNullable<NonNullable<UserConfig["build"]>["lib"]>["fileName"] = (format) => {
	if (format === "es") {
		return "better-scrollbar-core.es.mjs"
	}

	if (format === "cjs") {
		return "better-scrollbar-core.cjs"
	}

	return "BetterScrollbarCore.min.js"
}

export default defineConfig((): UserConfig => {
	return {
		css: sharedCssConfig,
		build: {
			outDir: "dist",
			emptyOutDir: true,
			sourcemap: true,
			lib: {
				entry: resolve(__dirname, "src/index.ts"),
				name: "BetterScrollbarCore",
				formats: ["es", "cjs", "umd"],
				fileName: fileNameByFormat
			},
			rollupOptions: {
				output: {
					exports: "named"
				}
			}
		}
	}
})


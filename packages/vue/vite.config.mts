import { resolve } from "path"
import type { UserConfig } from "vite"
import { defineConfig } from "vite"
import { createVuePlugins, sharedCssConfig } from "../../vite.config.shared"

const fileNameByFormat: NonNullable<NonNullable<UserConfig["build"]>["lib"]>["fileName"] = (format) => {
	if (format === "es") {
		return "better-scrollbar-vue.es.mjs"
	}

	if (format === "cjs") {
		return "better-scrollbar-vue.cjs"
	}

	return "BetterScrollbarVue.min.js"
}

export default defineConfig((): UserConfig => {
	return {
		plugins: createVuePlugins(),
		css: {
			...sharedCssConfig,
			postcss: {
				plugins: []
			}
		},
		build: {
			outDir: "dist",
			emptyOutDir: true,
			sourcemap: true,
			lib: {
				entry: resolve(__dirname, "build/library-entry.ts"),
				name: "BetterScrollbarVue",
				formats: ["es", "cjs", "umd"],
				fileName: fileNameByFormat,
				cssFileName: "ScrollBar.min"
			},
			rollupOptions: {
				external: ["vue", "@better-scrollbar/core"],
				output: {
					assetFileNames: (assetInfo) => {
						if (assetInfo.name === "style.css") {
							return "ScrollBar.min.css"
						}

						return "assets/[name][extname]"
					},
					exports: "named",
					globals: {
						vue: "Vue",
						"@better-scrollbar/core": "BetterScrollbarCore"
					}
				}
			}
		}
	}
})


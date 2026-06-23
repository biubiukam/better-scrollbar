import { resolve } from "path"
import type { UserConfig } from "vite"
import { defineConfig } from "vite"
import { createReactPlugins, sharedCssConfig } from "../../vite.config.shared"

const fileNameByFormat: NonNullable<NonNullable<UserConfig["build"]>["lib"]>["fileName"] = (format) => {
	if (format === "es") {
		return "better-scrollbar-react.es.mjs"
	}

	if (format === "cjs") {
		return "better-scrollbar-react.cjs"
	}

	return "BetterScrollbarReact.min.js"
}

export default defineConfig((): UserConfig => {
	return {
		plugins: createReactPlugins(),
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
				name: "BetterScrollbarReact",
				formats: ["es", "cjs", "umd"],
				fileName: fileNameByFormat,
				cssFileName: "ScrollBar.min"
			},
			rollupOptions: {
				external: ["react", "react-dom", "@better-scrollbar/core"],
				output: {
					assetFileNames: (assetInfo) => {
						if (assetInfo.name === "style.css") {
							return "ScrollBar.min.css"
						}

						return "assets/[name][extname]"
					},
					exports: "named",
					globals: {
						react: "React",
						"react-dom": "ReactDOM",
						"@better-scrollbar/core": "BetterScrollbarCore"
					}
				}
			}
		}
	}
})

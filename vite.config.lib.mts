import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import type { UserConfig } from "vite"
import { defineConfig } from "vite"
import { createReactPlugins, sharedCssConfig } from "./vite.config.shared"

const configDir = dirname(fileURLToPath(import.meta.url))

const fileNameByFormat: NonNullable<NonNullable<UserConfig["build"]>["lib"]>["fileName"] = (format) => {
	if (format === "es") {
		return "better-scrollbar.es.mjs"
	}

	if (format === "cjs") {
		return "better-scrollbar.cjs"
	}

	return "ScrollBar.min.js"
}

export default defineConfig((): UserConfig => {
	return {
		plugins: createReactPlugins(),
		css: sharedCssConfig,
		build: {
			outDir: "dist",
			emptyOutDir: true,
			sourcemap: true,
			lib: {
				entry: resolve(configDir, "build/library-entry.ts"),
				name: "BetterScrollbar",
				formats: ["es", "cjs", "umd"],
				fileName: fileNameByFormat,
				cssFileName: "ScrollBar.min",
			},
			rollupOptions: {
				external: ["react", "react-dom", "@better-scrollbar/core", "@better-scrollbar/react"],
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
						"@better-scrollbar/core": "BetterScrollbarCore",
						"@better-scrollbar/react": "BetterScrollbarReact",
					},
				},
			},
		},
	}
})

import react from "@vitejs/plugin-react"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import type { PluginOption, UserConfig } from "vite"

const configDir = dirname(fileURLToPath(import.meta.url))

export const createReactPlugins = (): PluginOption[] => [
	react()
]

export const siteResolveConfig: UserConfig["resolve"] = {
	alias: [
		{
			find: "@",
			replacement: join(configDir, "site"),
		},
		{
			find: "ScrollBar",
			replacement: join(configDir, "src"),
		}
	],
}

export const sharedCssConfig: UserConfig["css"] = {
	modules: {
		localsConvention: "camelCaseOnly",
		generateScopedName: "[local]_[hash:base64:8]",
	},
	preprocessorOptions: {
		less: {
			javascriptEnabled: true,
		},
	},
}

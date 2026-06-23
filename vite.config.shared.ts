import react from "@vitejs/plugin-react"
import vue from "@vitejs/plugin-vue"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import type { PluginOption, UserConfig } from "vite"

const configDir = dirname(fileURLToPath(import.meta.url))
export const siteRoot = join(configDir, "apps/site")

export const createReactPlugins = (): PluginOption[] => [react()]

export const createVuePlugins = (): PluginOption[] => [vue()]

export const siteResolveConfig: UserConfig["resolve"] = {
	alias: [
		{
			find: "@",
			replacement: siteRoot
		},
		{
			find: "@better-scrollbar/react",
			replacement: join(configDir, "packages/react/src")
		},
		{
			find: "@better-scrollbar/vue",
			replacement: join(configDir, "packages/vue/src")
		},
		{
			find: "@better-scrollbar/core",
			replacement: join(configDir, "packages/core/src")
		},
		{
			find: "sortablejs",
			replacement: join(configDir, "apps/site/node_modules/sortablejs")
		}
	]
}

export const sharedCssConfig: UserConfig["css"] = {
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

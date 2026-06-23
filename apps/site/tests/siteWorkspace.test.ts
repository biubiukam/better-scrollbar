import fs from "fs"
import path from "path"
import { describe, expect, it } from "vitest"

const repoRoot = path.resolve(__dirname, "../../..")

const readJson = (filePath: string) => JSON.parse(fs.readFileSync(filePath, "utf8"))

describe("site workspace package", () => {
	it("keeps the Vite site as an apps/site workspace app", () => {
		const workspaceConfig = fs.readFileSync(path.join(repoRoot, "pnpm-workspace.yaml"), "utf8")
		const rootPackage = readJson(path.join(repoRoot, "package.json"))
		const sitePackage = readJson(path.join(repoRoot, "apps/site/package.json"))

		expect(workspaceConfig).toContain('"apps/*"')
		expect(fs.existsSync(path.join(repoRoot, "apps/site/index.html"))).toBe(true)
		expect(fs.existsSync(path.join(repoRoot, "site"))).toBe(false)

		expect(sitePackage).toMatchObject({
			name: "@better-scrollbar/site",
			private: true
		})
		expect(sitePackage.scripts).toMatchObject({
			build: "tsc -p ../../tsconfig.site.json && vite build --config ../../vite.config.site.mts",
			dev: "vite --config ../../vite.config.site.mts"
		})

		expect(rootPackage.scripts).toMatchObject({
			"site:build": "pnpm --filter @better-scrollbar/site build",
			"site:dev": "pnpm --filter @better-scrollbar/site dev"
		})
	})
})

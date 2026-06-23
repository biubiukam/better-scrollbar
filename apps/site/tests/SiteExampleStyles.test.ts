import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const EXAMPLE_ROOT = join(process.cwd(), "apps/site/examplex")

function walkFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = join(dir, entry.name)
		return entry.isDirectory() ? walkFiles(fullPath) : [fullPath]
	})
}

describe("site example styles", () => {
	it("keeps apps/site/examplex examples free of Less files and Less imports", () => {
		const files = walkFiles(EXAMPLE_ROOT)
		const lessFiles = files.filter((file) => file.endsWith(".less"))
		const filesImportingLess = files
			.filter((file) => /\.(ts|tsx)$/.test(file))
			.filter((file) => readFileSync(file, "utf8").includes(".less"))

		expect(lessFiles).toEqual([])
		expect(filesImportingLess).toEqual([])
	})
})

import fs from "fs"
import path from "path"
import { describe, expect, it } from "vitest"

const repoRoot = path.resolve(__dirname, "../../..")
const exampleRoot = path.join(repoRoot, "apps/site/examplex")

describe("site example case structure", () => {
	it("keeps only case folders under apps/site/examplex", () => {
		const entries = fs.readdirSync(exampleRoot, { withFileTypes: true })
		const fileEntries = entries.filter((entry) => entry.isFile()).map((entry) => entry.name)
		const directoryEntries = entries
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name)
			.sort()

		expect(fileEntries).toEqual([])
		expect(directoryEntries).toEqual([
			"AgentConversationCase",
			"AnchorMutationCase",
			"AuditLogCase",
			"DynamicMeasurementCase",
			"GroupedProductShellCase",
			"MassiveRangeCase",
			"MediaSearchCase",
			"RuleQueueCase"
		])
		expect(directoryEntries.every((entry) => entry.endsWith("Case"))).toBe(true)
	})
})

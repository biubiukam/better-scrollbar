import { describe, expect, it } from "vitest"
import {
	ESTIMATED_MILLION_ROW_HEIGHT,
	MILLION_ROW_COUNT,
	PROGRESS_SCALE,
	getJumpOffset,
	getMillionRowHeight,
	getOffsetFromProgress,
	getProgressValue,
	getRenderedCount
} from "../site/examplex/MillionRows/utils"

describe("MillionRows demo helpers", () => {
	it("describes a 50-million-row dataset without materializing row data", () => {
		expect(MILLION_ROW_COUNT).toBe(50_000_000)
		expect(ESTIMATED_MILLION_ROW_HEIGHT).toBeGreaterThan(0)
		expect(getMillionRowHeight(0)).toBeGreaterThan(getMillionRowHeight(1))
		expect(getMillionRowHeight(35)).not.toBe(getMillionRowHeight(36))
	})

	it("maps jump ratios and slider progress to bounded scroll offsets", () => {
		expect(getJumpOffset(10_000, 500, 0.5)).toBe(4_750)
		expect(getJumpOffset(10_000, 500, 2)).toBe(9_500)
		expect(getOffsetFromProgress(PROGRESS_SCALE / 4, 10_000, 500)).toBe(2_375)
		expect(getProgressValue(2_375, 10_000, 500)).toBe(PROGRESS_SCALE / 4)
	})

	it("calculates rendered row counts from the virtual range", () => {
		expect(getRenderedCount({startIndex: 10, endIndex: 20})).toBe(11)
		expect(getRenderedCount({startIndex: 4, endIndex: 3})).toBe(0)
	})
})

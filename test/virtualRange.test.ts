import { describe, expect, it } from "vitest"
import { createVirtualHeightIndex } from "../src/virtualRange"

describe("virtual range index", () => {
	it("calculates offsets and ranges for sparse dynamic heights", () => {
		const index = createVirtualHeightIndex({
			itemCount: 50_000_000,
			estimatedItemHeight: 20,
			measuredHeights: new Map([
				[0, 100],
				[10, 5],
				[49_999_999, 80],
			]),
		})

		expect(index.totalHeight).toBe(1_000_000_125)
		expect(index.getOffset(1)).toBe(100)
		expect(index.getOffset(11)).toBe(285)
		expect(index.getRange({
			scrollOffset: 280,
			viewportSize: 40,
			overscan: 1,
		})).toEqual({
			start: 9,
			end: 13,
			visibleStartIndex: 10,
			visibleEndIndex: 12,
			offset: 260,
			scrollHeight: 1_000_000_125,
		})
	})

	it("computes repeated 50-million-row ranges without linear scans", () => {
		const measuredHeights = new Map<number, number>()
		for (let i = 0; i < 1000; i++) {
			measuredHeights.set(i * 997, 24 + (i % 37))
		}

		const index = createVirtualHeightIndex({
			itemCount: 50_000_000,
			estimatedItemHeight: 32,
			measuredHeights,
		})
		const startedAt = performance.now()

		for (let i = 0; i < 2000; i++) {
			index.getRange({
				scrollOffset: (i * 123_457) % index.totalHeight,
				viewportSize: 720,
				overscan: 3,
			})
		}

		expect(performance.now() - startedAt).toBeLessThan(120)
	})
})

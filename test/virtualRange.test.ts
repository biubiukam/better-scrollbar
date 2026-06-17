import { describe, expect, it } from "vitest"
import { createVirtualHeightIndex, createVirtualHeightIndexStore } from "../src/virtualRange"

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

	it("supports asymmetric overscan for direction-aware pre-rendering", () => {
		const index = createVirtualHeightIndex({
			itemCount: 20,
			estimatedItemHeight: 20,
		})

		expect(index.getRange({
			scrollOffset: 100,
			viewportSize: 40,
			overscan: { before: 1, after: 4 },
		})).toEqual({
			start: 4,
			end: 10,
			visibleStartIndex: 5,
			visibleEndIndex: 6,
			offset: 80,
			scrollHeight: 400,
		})
	})

	it("supports pixel overscan for dynamic height ranges", () => {
		const index = createVirtualHeightIndex({
			itemCount: 10,
			estimatedItemHeight: 20,
			measuredHeights: new Map([[0, 100]]),
		})

		expect(index.getRange({
			scrollOffset: 100,
			viewportSize: 20,
			overscan: 0,
			overscanPixels: { before: 50, after: 60 },
		})).toEqual({
			start: 0,
			end: 4,
			visibleStartIndex: 1,
			visibleEndIndex: 1,
			offset: 0,
			scrollHeight: 280,
		})
	})

	it("updates measured heights incrementally through a reusable store", () => {
		const index = createVirtualHeightIndexStore({
			itemCount: 50_000_000,
			estimatedItemHeight: 20,
			blockSize: 128,
		})

		const sameIndex = index.setMeasuredHeight(10, 80)

		expect(sameIndex).toBe(index)
		expect(index.totalHeight).toBe(1_000_000_060)
		expect(index.getOffset(11)).toBe(280)

		index.setMeasuredHeight(10, 40)
		index.setMeasuredHeight(1_000, 5)

		expect(index.totalHeight).toBe(1_000_000_005)
		expect(index.getOffset(1_001)).toBe(20_025)

		index.deleteMeasuredHeight(10)

		expect(index.totalHeight).toBe(999_999_985)
		expect(index.getOffset(1_001)).toBe(20_005)
	})

	it("evicts the oldest measured heights when the cache limit is reached", () => {
		const index = createVirtualHeightIndexStore({
			itemCount: 100,
			estimatedItemHeight: 10,
			maxMeasuredItems: 2,
		})

		index.setMeasuredHeight(0, 20)
		index.setMeasuredHeight(1, 30)
		index.setMeasuredHeight(2, 40)

		expect(index.totalHeight).toBe(1_050)
		expect(index.getOffset(1)).toBe(10)
		expect(index.getOffset(3)).toBe(80)
	})

	it("treats non-finite measured height cache limits as unlimited", () => {
		const index = createVirtualHeightIndexStore({
			itemCount: 100,
			estimatedItemHeight: 10,
			maxMeasuredItems: Number.NaN,
		})

		index.setMeasuredHeight(0, 20)
		index.setMeasuredHeight(1, 30)
		index.setMeasuredHeight(2, 40)

		expect(index.totalHeight).toBe(1_060)
		expect(index.getOffset(3)).toBe(90)
	})

	it("handles empty lists and ignores invalid measured heights", () => {
		const index = createVirtualHeightIndexStore({
			itemCount: 0,
			estimatedItemHeight: 20,
		})

		expect(index.getRange({
			scrollOffset: 100,
			viewportSize: 40,
			overscan: 1,
		})).toEqual({
			scrollHeight: 0,
			start: 0,
			end: -1,
			visibleStartIndex: 0,
			visibleEndIndex: -1,
			offset: 0,
		})
		expect(index.setMeasuredHeight(0, 50)).toBe(index)
		expect(index.deleteMeasuredHeight(0)).toBe(index)
		expect(index.totalHeight).toBe(0)
	})

	it("uses the start offset when the viewport size is zero", () => {
		const index = createVirtualHeightIndex({
			itemCount: 10,
			estimatedItemHeight: 20,
		})

		expect(index.getRange({
			scrollOffset: 40,
			viewportSize: 0,
			overscan: 0,
		})).toEqual({
			start: 2,
			end: 2,
			visibleStartIndex: 2,
			visibleEndIndex: 2,
			offset: 40,
			scrollHeight: 200,
		})
	})
})

import { describe, expect, it } from "vitest"
import {
	createVirtualHeightIndex,
	getEffectiveOverscan,
	getPageXY,
	getSpinSize,
	getStickyIndicesFromGroups,
	isDOM,
	toSafeOverscan
} from "@better-scrollbar/core"

describe("@better-scrollbar/core", () => {
	it("exports framework-neutral virtual range helpers", () => {
		const index = createVirtualHeightIndex({
			itemCount: 1_000,
			estimatedItemHeight: 20,
			measuredHeights: new Map([[0, 60]])
		})

		expect(
			index.getRange({
				scrollOffset: 60,
				viewportSize: 40,
				overscan: 1
			})
		).toEqual({
			start: 0,
			end: 3,
			visibleStartIndex: 1,
			visibleEndIndex: 2,
			offset: 0,
			scrollHeight: 20_040
		})
	})

	it("exports framework-neutral scrollbar and sticky utilities", () => {
		expect(getSpinSize(400, 2_000)).toBe(25)
		expect(getStickyIndicesFromGroups([4, 2, 3])).toEqual([0, 5, 8])
	})

	it("exports framework-neutral overscan algorithms", () => {
		expect(toSafeOverscan(2.9)).toBe(2)
		expect(toSafeOverscan(-1)).toBe(0)
		expect(
			getEffectiveOverscan(2, null, {
				direction: 1,
				delta: 40,
				elapsedMs: 20,
				deviceScale: 1
			})
		).toBe(2)
		expect(
			getEffectiveOverscan(
				2,
				{
					min: 2,
					max: 8,
					velocityFactor: 0.1,
					timeFactor: 0.5
				},
				{
					direction: 1,
					delta: 40,
					elapsedMs: 20,
					deviceScale: 1
				}
			)
		).toEqual({ before: 2, after: 7 })
	})

	it("exports framework-neutral DOM helpers", () => {
		const element = document.createElement("div")
		const point = { pageX: 12, pageY: 34 }
		const touchWithItem = {
			touches: {
				length: 1,
				0: point,
				item: () => point
			}
		}
		const touchWithIndex = {
			touches: {
				length: 1,
				0: point
			}
		}

		expect(isDOM(element)).toBe(true)
		expect(isDOM({})).toBe(false)
		expect(getPageXY(point)).toBe(34)
		expect(getPageXY(point, true)).toBe(12)
		expect(getPageXY(touchWithItem)).toBe(34)
		expect(getPageXY(touchWithIndex, true)).toBe(12)
	})
})

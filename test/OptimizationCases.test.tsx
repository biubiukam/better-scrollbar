import { act, fireEvent, render } from "@testing-library/react"
import React from "react"
import { describe, expect, it } from "vitest"
import OptimizationCases from "../site/components/OptimizationCases/OptimizationCases"
import { ESTIMATED_MILLION_ROW_HEIGHT, MILLION_ROW_COUNT } from "../site/components/ExampleSupport/sharedMillion"
import "../src/styles/index.less"

describe("OptimizationCases", () => {
	it("renders the four product-grade 100-million-row advantage cards", () => {
		const { container } = render(<OptimizationCases/>)
		const cards = container.querySelectorAll("[data-testid='optimization-case-card']")
		const caseIds = Array.from(cards).map((card) => card.getAttribute("data-case-id"))

		expect(caseIds).toEqual([
			"massive-range",
			"dynamic-measurement",
			"anchor-mutation",
			"grouped-product-shell"
		])
		cards.forEach((card) => {
			expect(card.getAttribute("data-row-count")).toBe(String(MILLION_ROW_COUNT))
			expect(card.querySelector("[data-testid='case-highlight']")?.textContent).toBeTruthy()
			expect(card.querySelector("[data-testid='case-proof']")?.textContent).toBeTruthy()
		})
	})

	it("shows the advanced case with sticky grouping and default list metadata", () => {
		const { container } = render(<OptimizationCases/>)
		const advancedCase = container.querySelector("[data-case-id='grouped-product-shell']")
		const firstGroupCount = Number(advancedCase?.querySelector(".optimization-group-row strong")?.textContent?.match(/\d+/)?.[0])

		expect(advancedCase).not.toBeNull()
		expect(advancedCase?.querySelector(".scroll-bar-sticky-item")).not.toBeNull()
		expect(advancedCase?.querySelector("[role='list']")).not.toBeNull()
		expect(advancedCase?.querySelector("[role='listitem']")?.getAttribute("aria-setsize")).toBe(String(MILLION_ROW_COUNT))
		expect(firstGroupCount).toBeGreaterThanOrEqual(5)
		expect(firstGroupCount).toBeLessThanOrEqual(15)
	})

	it("keeps the grouped product shell scrollbar above the sticky row layer", () => {
		const { container } = render(<OptimizationCases/>)
		const groupedCase = container.querySelector("[data-case-id='grouped-product-shell']") as HTMLElement
		const stickyItem = groupedCase.querySelector(".scroll-bar-sticky-item") as HTMLElement
		const verticalTrack = groupedCase.querySelector(".scroll-bar-vertical-track") as HTMLElement
		const stickyZIndex = Number.parseInt(window.getComputedStyle(stickyItem).zIndex || "0", 10)
		const trackZIndex = Number.parseInt(window.getComputedStyle(verticalTrack).zIndex || "0", 10)

		expect(trackZIndex).toBeGreaterThan(stickyZIndex)
	})

	it("keeps the same business row visible after prepending rows in the anchor case", () => {
		const { container } = render(<OptimizationCases/>)
		const anchorCase = container.querySelector("[data-case-id='anchor-mutation']") as HTMLElement
		const buttons = anchorCase.querySelectorAll(".optimization-case-toolbar button")

		act(() => {
			fireEvent.click(buttons[0])
		})
		const beforePrepend = anchorCase.querySelector(".optimization-row")?.textContent

		act(() => {
			fireEvent.click(buttons[1])
		})

		expect(anchorCase.querySelector(".optimization-row")?.textContent).toBe(beforePrepend)
	})

	it("keeps the top business row anchored when prepending from the start", () => {
		const { container } = render(<OptimizationCases/>)
		const anchorCase = container.querySelector("[data-case-id='anchor-mutation']") as HTMLElement
		const prependButton = anchorCase.querySelectorAll(".optimization-case-toolbar button")[1]

		act(() => {
			fireEvent.click(prependButton)
		})

		expect(anchorCase.querySelector(".optimization-case-stats")?.textContent).toContain("Visible 20 -")
	})

	it("uses the estimated row height for prepended anchor history rows", () => {
		const { container } = render(<OptimizationCases/>)
		const anchorCase = container.querySelector("[data-case-id='anchor-mutation']") as HTMLElement
		const prependButton = anchorCase.querySelectorAll(".optimization-case-toolbar button")[1]

		act(() => {
			fireEvent.click(prependButton)
		})

		const historyRow = anchorCase.querySelector(".optimization-row--focus") as HTMLElement
		expect(historyRow.style.height).toBe(`${ESTIMATED_MILLION_ROW_HEIGHT}px`)
	})
})

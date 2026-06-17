import { act, fireEvent, render } from "@testing-library/react"
import React from "react"
import { describe, expect, it } from "vitest"
import OptimizationCases from "../site/examplex/OptimizationCases/OptimizationCases"
import { MILLION_ROW_COUNT } from "../site/examplex/sharedMillion"
import "../src/styles/index.less"

describe("OptimizationCases", () => {
	it("renders five independent 50-million-row highlight cards", () => {
		const { container } = render(<OptimizationCases/>)
		const cards = container.querySelectorAll("[data-testid='optimization-case-card']")

		expect(cards).toHaveLength(5)
		cards.forEach((card) => {
			expect(card.getAttribute("data-row-count")).toBe(String(MILLION_ROW_COUNT))
			expect(card.querySelector("[data-testid='case-highlight']")?.textContent).toBeTruthy()
			expect(card.querySelector("[data-testid='case-interaction']")?.textContent).toBeTruthy()
		})
	})

	it("shows the advanced case with sticky grouping and virtualized accessibility metadata", () => {
		const { container } = render(<OptimizationCases/>)
		const advancedCase = container.querySelector("[data-case-id='advanced']")

		expect(advancedCase).not.toBeNull()
		expect(advancedCase?.querySelector(".scroll-bar-sticky-item")).not.toBeNull()
		expect(advancedCase?.querySelector("[role='grid']")?.getAttribute("aria-rowcount")).toBe(String(MILLION_ROW_COUNT))
	})

	it("keeps the same business row visible after prepending rows in the anchor case", () => {
		const { container } = render(<OptimizationCases/>)
		const anchorCase = container.querySelector("[data-case-id='scroll-anchor']") as HTMLElement
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
})

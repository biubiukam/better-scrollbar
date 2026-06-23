import { render, screen } from "@testing-library/react"
import React from "react"
import { describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "../site/components/ui/tooltip"
import Home from "../site/views/Home"
import "../src/styles/index.less"

vi.mock("../src", async () => {
	const ReactModule = await import("react")

	const MockVirtualScrollBar = ReactModule.forwardRef((props: Record<string, any>, ref) => {
		ReactModule.useImperativeHandle(ref, () => ({
			getScrollState: () => ({ x: 0, y: 0, clientHeight: 320, scrollHeight: 1000 }),
			scrollTo: vi.fn(),
		}))

		return (
			<div data-testid="mock-virtual-scrollbar">
				{props.children}
				{typeof props.renderItem === "function" ? props.renderItem(0) : null}
			</div>
		)
	})

	return {
		default: MockVirtualScrollBar,
	}
})

describe("site home presentation", () => {
	it("omits the comparison section from the primary site flow", () => {
		const { container } = render(
			<TooltipProvider>
				<Home
					theme="dark"
					locale="en"
					onThemeChange={vi.fn()}
					onLocaleChange={vi.fn()}
				/>
			</TooltipProvider>,
		)

		expect(screen.queryByRole("link", { name: "Compare" })).toBeNull()
		expect(container.querySelector("#comparison")).toBeNull()
		expect(screen.queryByRole("heading", { name: "Source-backed performance comparison" })).toBeNull()
	})

	it("lets the playground container expand with content instead of adding inner scrollbars", () => {
		const { container } = render(
			<TooltipProvider>
				<Home
					theme="dark"
					locale="en"
					onThemeChange={vi.fn()}
					onLocaleChange={vi.fn()}
				/>
			</TooltipProvider>,
		)

		const playground = container.querySelector("#playground") as HTMLElement
		const scenarioRoot = playground.querySelector(".scenario-playground") as HTMLElement
		const scrollablePanels = playground.querySelectorAll(".scenario-playground-controls, .scenario-playground-snapshot, .scenario-playground-log")

		expect(screen.queryByRole("heading", { name: "Interactive prop laboratory" })).toBeNull()
		expect(screen.getByRole("heading", { name: "100M virtual list playground" })).toBeTruthy()
		expect(scenarioRoot.className).not.toContain("h-full")
		expect(scenarioRoot.className).not.toContain("overflow-hidden")
		scrollablePanels.forEach((panel) => {
			expect(panel.className).not.toContain("overflow-auto")
		})
	})

	it("renders the full site without Chinese copy when the English locale is active", () => {
		const { container } = render(
			<TooltipProvider>
				<Home
					theme="dark"
					locale="en"
					onThemeChange={vi.fn()}
					onLocaleChange={vi.fn()}
				/>
			</TooltipProvider>,
		)

		expect(container.textContent).not.toMatch(/[\u4E00-\u9FFF]/)
	})
})

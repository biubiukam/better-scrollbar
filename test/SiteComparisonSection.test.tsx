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

describe("site performance comparison section", () => {
	it("renders a source-backed comparison against popular virtual list libraries", () => {
		render(
			<TooltipProvider>
				<Home
					theme="dark"
					locale="en"
					onThemeChange={vi.fn()}
					onLocaleChange={vi.fn()}
				/>
			</TooltipProvider>,
		)

		const compareLink = screen.getByRole("link", { name: "Compare" })

		expect(compareLink.getAttribute("href")).toBe("#comparison")
		expect(screen.getByRole("heading", { name: "Source-backed performance comparison" })).toBeTruthy()
		expect(screen.getByText("Scenario fit score")).toBeTruthy()
		expect(screen.getByText("not an FPS benchmark")).toBeTruthy()
		expect(screen.getAllByText("better-scrollbar").length).toBeGreaterThan(0)
		expect(screen.getAllByText("TanStack Virtual").length).toBeGreaterThan(0)
		expect(screen.getAllByText("React Virtuoso").length).toBeGreaterThan(0)
		expect(screen.getAllByText("react-window").length).toBeGreaterThan(0)
		expect(screen.getAllByText("react-virtualized").length).toBeGreaterThan(0)
		expect(screen.getAllByText("Bundlephobia API").length).toBeGreaterThan(0)
	})
})

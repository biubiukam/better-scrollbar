import { render, act } from "@testing-library/react"
import VirtualScrollBar, { VirtualScrollBarRef } from "../src"
import React, { createRef } from "react"
import { expect, describe, it, vi } from "vitest"
import "../src/styles/index.less"

const mockData = Array.from({ length: 20 }, (_, i) => i)

describe("VirtualScrollBar", () => {
	it("matches snapshot", () => {
		const { container } = render(
			<VirtualScrollBar width={600} height={600}>
				{mockData.map((i) => (
					<div key={i} style={{ height: 50 }}>
						{i}
					</div>
				))}
			</VirtualScrollBar>
		)
		expect(container.firstChild).toMatchSnapshot()
	})

	it("renders without crashing", () => {
		const { container } = render(<VirtualScrollBar />)
		expect(container.querySelector(".scroll-bar-wrapper")).not.toBeNull()
	})

	it("calls onScrollStart and onScrollEnd when scrolling starts and ends", () => {
		vi.useFakeTimers()
		const handleScrollStart = vi.fn()
		const preventDefault = vi.fn()
		const { container } = render(
			<VirtualScrollBar width={100} height={100} onScrollStart={handleScrollStart}>
				{mockData.map((i) => (
					<div key={i} style={{ height: 50 }}>
						{i}
					</div>
				))}
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element
		const wheelEvent = new WheelEvent("wheel", { deltaY: 100 })
		wheelEvent.preventDefault = preventDefault
		act(() => {
			scrollContainer.dispatchEvent(wheelEvent)
		})
		expect(preventDefault).toHaveBeenCalledTimes(1)
		vi.useRealTimers()
	})

	it("renders without children", () => {
		const { container } = render(<VirtualScrollBar />)
		expect(container.firstChild).not.toBeNull()
	})

	it("renders with multiple children", () => {
		const { container } = render(
			<VirtualScrollBar>
				<div>Child 1</div>
				<div>Child 2</div>
				<div>Child 3</div>
			</VirtualScrollBar>
		)
		expect(container.firstChild).not.toBeNull()
	})

	it("updates scroll position when scrolling", () => {
		vi.useFakeTimers()
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar height={50} ref={ref}>
				{mockData.map((i) => (
					<div key={i} style={{ height: 50 }}>
						{i}
					</div>
				))}
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element
		const scrollY = 100
		const wheelEvent = new WheelEvent("wheel", { deltaY: scrollY })
		act(() => {
			scrollContainer.dispatchEvent(wheelEvent)
			vi.runAllTimers()
		})
		const { y } = ref.current?.getScrollState() || {}
		expect(y).toBe(scrollY)
		vi.useRealTimers()
	})

	it("updates scroll position when window resizes", () => {
		vi.useFakeTimers()
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar ref={ref}>
				{mockData.map((i) => (
					<div key={i} style={{ height: 50 }}>
						{i}
					</div>
				))}
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element
		const initialScrollTop = scrollContainer.scrollHeight
		act(() => {
			window.dispatchEvent(new Event("resize"))
			vi.runAllTimers()
		})
		const { scrollHeight } = ref.current?.getScrollState() || {}
		expect(scrollHeight).not.toBe(initialScrollTop)
		vi.useRealTimers()
	})

	it("use ref to scroll to a specific position", () => {
		vi.useFakeTimers()
		const ref = createRef<VirtualScrollBarRef>()
		render(
			<VirtualScrollBar ref={ref}>
				{mockData.map((i) => (
					<div key={i} style={{ height: 50 }}>
						{i}
					</div>
				))}
			</VirtualScrollBar>
		)
		const scrollY = 200
		act(() => {
			ref.current?.scrollTo({ x: 0, y: scrollY })
			vi.runAllTimers()
		})
		const { y } = ref.current?.getScrollState() || {}
		expect(y).toBe(scrollY)
		vi.useRealTimers()
	})
})

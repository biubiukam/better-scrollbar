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

	it("applies style prop to the outer container", () => {
		const { container } = render(
			<VirtualScrollBar style={{ width: 120, height: 80, backgroundColor: "red" }}>
				<div key="item">Item</div>
			</VirtualScrollBar>
		)

		const outer = container.firstChild as HTMLElement
		expect(outer.style.width).toBe("120px")
		expect(outer.style.height).toBe("80px")
		expect(outer.style.backgroundColor).toBe("red")
	})

	it("renders every child when virtual rendering is disabled", () => {
		const { container } = render(
			<VirtualScrollBar height={50} isVirtual={false}>
				{mockData.map((i) => (
					<div key={i} data-testid="non-virtual-item" style={{ height: 50 }}>
						{i}
					</div>
				))}
			</VirtualScrollBar>
		)

		expect(container.querySelectorAll("[data-testid='non-virtual-item']")).toHaveLength(mockData.length)
	})

	it("renders horizontal custom track and thumb renderers", () => {
		const { container } = render(
			<VirtualScrollBar
				width={100}
				height={100}
				renderTrackHorizontal={(props) => <div {...props} data-testid="horizontal-track" />}
				renderThumbHorizontal={(props) => <div {...props} data-testid="horizontal-thumb" />}
			>
				<div key="wide" style={{ width: 500, height: 50 }}>
					Wide
				</div>
			</VirtualScrollBar>
		)

		expect(container.querySelector("[data-testid='horizontal-track']")).not.toBeNull()
		expect(container.querySelector("[data-testid='horizontal-thumb']")).not.toBeNull()
	})

	it("updates both axes when scrolling through the imperative ref", () => {
		const scrollWidthSpy = vi
			.spyOn(HTMLElement.prototype, "scrollWidth", "get")
			.mockReturnValue(1000)
		const ref = createRef<VirtualScrollBarRef>()

		render(
			<VirtualScrollBar width={100} height={100} itemHeight={200} ref={ref}>
				<div key="wide" style={{ width: 1000, height: 200 }}>
					Wide
				</div>
			</VirtualScrollBar>
		)

		act(() => {
			ref.current?.scrollTo({ x: 120, y: 80 })
		})

		expect(ref.current?.getScrollState().x).toBe(120)
		expect(ref.current?.getScrollState().y).toBe(80)

		scrollWidthSpy.mockRestore()
	})

	it("updates the x offset when receiving horizontal wheel input", () => {
		vi.useFakeTimers()
		const scrollWidthSpy = vi
			.spyOn(HTMLElement.prototype, "scrollWidth", "get")
			.mockReturnValue(1000)
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar width={100} height={100} ref={ref}>
				<div key="wide" style={{ width: 1000, height: 200 }}>
					Wide
				</div>
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaX: 90 }))
			vi.runAllTimers()
		})

		expect(ref.current?.getScrollState().x).toBe(90)

		scrollWidthSpy.mockRestore()
		vi.useRealTimers()
	})

	it("keeps measured item heights when virtual rows unmount and prunes deleted keys", () => {
		vi.useFakeTimers()
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockImplementation(function getOffsetHeight(this: HTMLElement) {
				return Number(this.getAttribute("data-height")) || 20
			})
		const ref = createRef<VirtualScrollBarRef>()
		const items = Array.from({ length: 20 }, (_, index) => ({
			id: `item-${index}`,
			height: index === 0 ? 120 : 20
		}))
		const renderList = (list: typeof items) => (
			<VirtualScrollBar height={40} itemHeight={20} ref={ref}>
				{list.map((item) => (
					<div key={item.id} data-height={item.height}>
						{item.id}
					</div>
				))}
			</VirtualScrollBar>
		)
		const { rerender } = render(renderList(items))

		act(() => {
			vi.runAllTimers()
		})
		expect(ref.current?.getScrollState().scrollHeight).toBe(500)

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 200 })
			vi.runAllTimers()
		})
		expect(ref.current?.getScrollState().scrollHeight).toBe(500)

		rerender(renderList(items.slice(1)))
		act(() => {
			vi.runAllTimers()
		})
		expect(ref.current?.getScrollState().scrollHeight).toBe(380)

		offsetHeightSpy.mockRestore()
		vi.useRealTimers()
	})

	it("uses estimatedItemHeight before rows are measured", () => {
		const ref = createRef<VirtualScrollBarRef>()
		render(
			<VirtualScrollBar itemHeight={10} estimatedItemHeight={50} ref={ref}>
				{Array.from({ length: 5 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)

		expect(ref.current?.getScrollState().scrollHeight).toBe(250)
	})

	it("reports rendered and visible item ranges with configurable overscan", () => {
		const onItemsRendered = vi.fn()
		render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				overscan={2}
				onItemsRendered={onItemsRendered}
			>
				{Array.from({ length: 10 }, (_, index) => (
					<div key={index} data-testid="overscan-item">
						{index}
					</div>
				))}
			</VirtualScrollBar>
		)

		expect(onItemsRendered).toHaveBeenLastCalledWith({
			startIndex: 0,
			endIndex: 4,
			visibleStartIndex: 0,
			visibleEndIndex: 2
		})
		expect(document.querySelectorAll("[data-testid='overscan-item']")).toHaveLength(5)
	})

	it("does not call onScrollEnd on initial mount", () => {
		const handleScrollEnd = vi.fn()

		render(
			<VirtualScrollBar onScrollEnd={handleScrollEnd}>
				<div key="item">Item</div>
			</VirtualScrollBar>
		)

		expect(handleScrollEnd).not.toHaveBeenCalled()
	})

	it("accumulates wheel deltas that happen before the next animation frame", () => {
		vi.useFakeTimers()
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar height={40} itemHeight={20} ref={ref}>
				{Array.from({ length: 20 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 30 }))
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 40 }))
			vi.runAllTimers()
		})

		expect(ref.current?.getScrollState().y).toBe(70)
		vi.useRealTimers()
	})

	it("supports 50-million-row indexed rendering without materializing every row", () => {
		const onItemsRendered = vi.fn()
		const renderItem = vi.fn((index: number) => (
			<div key={index} data-testid="indexed-item">
				{index}
			</div>
		))
		const ref = createRef<VirtualScrollBarRef>()

		render(
			<VirtualScrollBar
				height={200}
				itemCount={50_000_000}
				estimatedItemHeight={20}
				renderItem={renderItem}
				onItemsRendered={onItemsRendered}
				ref={ref}
			/>
		)

		expect(ref.current?.getScrollState().scrollHeight).toBe(1_000_000_000)
		expect(renderItem.mock.calls.length).toBeLessThan(30)
		expect(document.querySelectorAll("[data-testid='indexed-item']")).toHaveLength(11)
		expect(onItemsRendered).toHaveBeenLastCalledWith({
			startIndex: 0,
			endIndex: 10,
			visibleStartIndex: 0,
			visibleEndIndex: 9
		})

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 999_999_000 })
		})

		expect(onItemsRendered).toHaveBeenLastCalledWith({
			startIndex: 49_999_949,
			endIndex: 49_999_960,
			visibleStartIndex: 49_999_950,
			visibleEndIndex: 49_999_959
		})
		expect(renderItem).toHaveBeenCalledWith(49_999_950)
		expect(renderItem.mock.calls.length).toBeLessThan(60)
	})

	it("keeps deep virtual rows inside browser-safe layout coordinates", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar
				height={200}
				itemCount={50_000_000}
				estimatedItemHeight={20}
				renderItem={(index) => (
					<div key={index} data-testid="deep-indexed-item">
						{index}
					</div>
				)}
				ref={ref}
			/>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as HTMLElement
		const wrapper = container.querySelector(".scroll-bar-wrapper") as HTMLElement
		const physicalHeight = Number.parseFloat(scrollContainer.style.height)

		expect(ref.current?.getScrollState().scrollHeight).toBe(1_000_000_000)
		expect(physicalHeight).toBeLessThan(1_000_000_000)

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 999_999_000 })
		})

		const transformOffset = Number.parseFloat(wrapper.style.transform.match(/translateY\(([-\d.]+)px\)/)?.[1] || "0")
		expect(transformOffset).toBeGreaterThan(0)
		expect(transformOffset).toBeLessThan(physicalHeight)
		expect(document.querySelectorAll("[data-testid='deep-indexed-item']").length).toBeGreaterThan(0)
	})
})

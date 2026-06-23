import { render, act, fireEvent } from "@testing-library/react"
import VirtualScrollBar, { ItemsRenderedInfo, VirtualScrollBarRef } from "../src"
import { getResizeObserverEntryHeight } from "../src/hooks/useHeights"
import React, { createRef } from "react"
import { expect, describe, it, vi } from "vitest"
import "../src/styles/index.less"

const mockData = Array.from({ length: 20 }, (_, i) => i)

function createTestRect(top: number, height: number): DOMRect {
	return {
		x: 0,
		y: top,
		top,
		bottom: top + height,
		left: 0,
		right: 100,
		width: 100,
		height,
		toJSON: () => ({})
	} as DOMRect
}

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
		const handleScrollEnd = vi.fn()
		const preventDefault = vi.fn()
		const { container } = render(
			<VirtualScrollBar width={100} height={100} onScrollStart={handleScrollStart} onScrollEnd={handleScrollEnd}>
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
		act(() => {
			vi.advanceTimersByTime(20)
		})
		expect(handleScrollStart).toHaveBeenCalledTimes(1)
		act(() => {
			vi.advanceTimersByTime(220)
		})
		expect(handleScrollEnd).toHaveBeenCalledTimes(1)
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

	it("renders function children as a single child node", () => {
		const { container } = render(
			<VirtualScrollBar height={20} itemHeight={20}>
				{(() => <div data-testid="function-child">Function child</div>) as unknown as React.ReactNode}
			</VirtualScrollBar>
		)

		expect(container.querySelector("[data-testid='function-child']")).not.toBeNull()
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

	it("allows an explicit zero width", () => {
		const { container } = render(
			<VirtualScrollBar width={0} height={40} itemHeight={20}>
				<div key="row">row</div>
			</VirtualScrollBar>
		)

		const inner = container.querySelector(".scroll-bar-inner-container") as HTMLElement
		expect(inner.style.width).toBe("0px")
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

	it("uses shift wheel input as horizontal scrolling", () => {
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
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 75, shiftKey: true }))
			vi.runAllTimers()
		})

		expect(ref.current?.getScrollState().x).toBe(75)

		scrollWidthSpy.mockRestore()
		vi.useRealTimers()
	})

	it("keeps measured item heights when virtual rows unmount and prunes deleted keys", () => {
		vi.useFakeTimers()
		const OriginalResizeObserver = window.ResizeObserver
		window.ResizeObserver = undefined as unknown as typeof ResizeObserver
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
		try {
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
		} finally {
			offsetHeightSpy.mockRestore()
			window.ResizeObserver = OriginalResizeObserver
			vi.useRealTimers()
		}
	})

	it("gracefully handles missing MutationObserver when items unmount", () => {
		vi.useFakeTimers()
		const OriginalResizeObserver = window.ResizeObserver
		const OriginalMutationObserver = window.MutationObserver
		window.ResizeObserver = undefined as unknown as typeof ResizeObserver
		window.MutationObserver = undefined as unknown as typeof MutationObserver
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockReturnValue(20)
		const ref = createRef<VirtualScrollBarRef>()
		try {
			const { rerender } = render(
				<VirtualScrollBar height={40} itemHeight={20} ref={ref}>
					{Array.from({ length: 4 }, (_, i) => (
						<div key={`item-${i}`}>item-{i}</div>
					))}
				</VirtualScrollBar>
			)

			act(() => { vi.runAllTimers() })

			rerender(
				<VirtualScrollBar height={40} itemHeight={20} ref={ref}>
					{Array.from({ length: 2 }, (_, i) => (
						<div key={`item-${i}`}>item-{i}</div>
					))}
				</VirtualScrollBar>
			)

			act(() => { vi.runAllTimers() })

			expect(ref.current?.getScrollState().scrollHeight).toBe(40)
		} finally {
			offsetHeightSpy.mockRestore()
			window.MutationObserver = OriginalMutationObserver
			window.ResizeObserver = OriginalResizeObserver
			vi.useRealTimers()
		}
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

	it("limits remembered measured heights when heightCacheLimit is configured", () => {
		vi.useFakeTimers()
		const OriginalResizeObserver = window.ResizeObserver
		window.ResizeObserver = undefined as unknown as typeof ResizeObserver
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockImplementation(function getOffsetHeight(this: HTMLElement) {
				return Number(this.getAttribute("data-height")) || 20
			})
		const ref = createRef<VirtualScrollBarRef>()
		const items = Array.from({ length: 10 }, (_, index) => ({
			id: `limited-${index}`,
			height: index === 0 ? 100 : index === 1 ? 40 : 20
		}))

		try {
			render(
				<VirtualScrollBar height={20} itemHeight={20} overscan={0} heightCacheLimit={1} ref={ref}>
					{items.map((item) => (
						<div key={item.id} data-height={item.height}>
							{item.id}
						</div>
					))}
				</VirtualScrollBar>
			)

			act(() => {
				vi.runAllTimers()
			})
			expect(ref.current?.getScrollState().scrollHeight).toBe(280)

			act(() => {
				ref.current?.scrollTo({ x: 0, y: 100 })
			})
			act(() => {
				vi.runAllTimers()
			})
			expect(ref.current?.getScrollState().scrollHeight).toBe(220)
		} finally {
			offsetHeightSpy.mockRestore()
			window.ResizeObserver = OriginalResizeObserver
			vi.useRealTimers()
		}
	})

	it("allows disabling measured height eviction with an infinite cache limit", () => {
		vi.useFakeTimers()
		const OriginalResizeObserver = window.ResizeObserver
		window.ResizeObserver = undefined as unknown as typeof ResizeObserver
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockImplementation(function getOffsetHeight(this: HTMLElement) {
				return Number(this.getAttribute("data-height")) || 20
			})
		const ref = createRef<VirtualScrollBarRef>()
		const items = Array.from({ length: 10 }, (_, index) => ({
			id: `unlimited-${index}`,
			height: index === 0 ? 100 : index === 1 ? 40 : 20
		}))

		try {
			render(
				<VirtualScrollBar
					height={20}
					itemHeight={20}
					overscan={0}
					heightCacheLimit={Number.POSITIVE_INFINITY}
					ref={ref}
				>
					{items.map((item) => (
						<div key={item.id} data-height={item.height}>
							{item.id}
						</div>
					))}
				</VirtualScrollBar>
			)

			act(() => {
				vi.runAllTimers()
			})
			act(() => {
				ref.current?.scrollTo({ x: 0, y: 100 })
			})
			act(() => {
				vi.runAllTimers()
			})

			expect(ref.current?.getScrollState().scrollHeight).toBe(300)
		} finally {
			offsetHeightSpy.mockRestore()
			window.ResizeObserver = OriginalResizeObserver
			vi.useRealTimers()
		}
	})

	it("keeps mounted rows stable when heightCacheLimit is smaller than the visible set", () => {
		vi.useFakeTimers()
		const OriginalResizeObserver = window.ResizeObserver
		window.ResizeObserver = undefined as unknown as typeof ResizeObserver
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockReturnValue(80)

		try {
			const { container } = render(
				<VirtualScrollBar height={20} itemHeight={20} overscan={0} heightCacheLimit={0}>
					<div key="visible-zero" data-testid="visible-zero">
						visible
					</div>
				</VirtualScrollBar>
			)

			act(() => {
				vi.runAllTimers()
			})

			expect(container.querySelector("[data-testid='visible-zero']")).not.toBeNull()
		} finally {
			offsetHeightSpy.mockRestore()
			window.ResizeObserver = OriginalResizeObserver
			vi.useRealTimers()
		}
	})

	it("drops measured height snapshots outside the next item count when rows shrink", () => {
		vi.useFakeTimers()
		const OriginalResizeObserver = window.ResizeObserver
		window.ResizeObserver = undefined as unknown as typeof ResizeObserver
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockImplementation(function getOffsetHeight(this: HTMLElement) {
				return Number(this.getAttribute("data-height")) || 20
			})
		const ref = createRef<VirtualScrollBarRef>()
		const items = [
			{id: "kept", height: 80},
			{id: "removed", height: 60}
		]
		const renderList = (list: typeof items) => (
			<VirtualScrollBar
				height={20}
				itemHeight={20}
				overscan={0}
				heightCacheLimit={Number.POSITIVE_INFINITY}
				ref={ref}
			>
				{list.map((item) => (
					<div key={item.id} data-height={item.height}>
						{item.id}
					</div>
				))}
			</VirtualScrollBar>
		)

		try {
			const { rerender } = render(renderList(items))
			act(() => {
				vi.runAllTimers()
			})
			act(() => {
				ref.current?.scrollTo({ x: 0, y: 80 })
			})
			act(() => {
				vi.runAllTimers()
			})
			expect(ref.current?.getScrollState().scrollHeight).toBe(140)

			rerender(renderList(items.slice(0, 1)))
			act(() => {
				vi.runAllTimers()
			})

			expect(ref.current?.getScrollState().scrollHeight).toBe(80)
		} finally {
			offsetHeightSpy.mockRestore()
			window.ResizeObserver = OriginalResizeObserver
			vi.useRealTimers()
		}
	})

	it("prunes indexed measured heights by itemCount when indexed rows shrink", () => {
		vi.useFakeTimers()
		const OriginalResizeObserver = window.ResizeObserver
		window.ResizeObserver = undefined as unknown as typeof ResizeObserver
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockImplementation(function getOffsetHeight(this: HTMLElement) {
				return Number(this.getAttribute("data-height")) || 20
			})
		const ref = createRef<VirtualScrollBarRef>()
		const renderList = (count: number) => (
			<VirtualScrollBar
				height={20}
				itemHeight={20}
				overscan={0}
				heightCacheLimit={Number.POSITIVE_INFINITY}
				itemCount={count}
				renderItem={(index) => (
					<div key={index} data-height={index === 0 ? 80 : 60}>
						{index}
					</div>
				)}
				ref={ref}
			/>
		)

		try {
			const { rerender } = render(renderList(2))
			act(() => {
				vi.runAllTimers()
			})
			act(() => {
				ref.current?.scrollTo({ x: 0, y: 80 })
			})
			act(() => {
				vi.runAllTimers()
			})
			expect(ref.current?.getScrollState().scrollHeight).toBe(140)

			rerender(renderList(1))
			act(() => {
				vi.runAllTimers()
			})

			expect(ref.current?.getScrollState().scrollHeight).toBe(80)
		} finally {
			offsetHeightSpy.mockRestore()
			window.ResizeObserver = OriginalResizeObserver
			vi.useRealTimers()
		}
	})

	it("resets the height index when estimated height or item count changes", () => {
		vi.useFakeTimers()
		const ref = createRef<VirtualScrollBarRef>()
		const renderList = (count: number, estimatedItemHeight: number) => (
			<VirtualScrollBar
				height={40}
				itemCount={count}
				estimatedItemHeight={estimatedItemHeight}
				renderItem={(index) => (
					<div key={index}>
						{index}
					</div>
				)}
				ref={ref}
			/>
		)
		const { rerender } = render(renderList(10, 20))

		expect(ref.current?.getScrollState().scrollHeight).toBe(200)
		act(() => {
			vi.runAllTimers()
		})

		rerender(renderList(2, 30))

		expect(ref.current?.getScrollState().scrollHeight).toBe(60)
		vi.useRealTimers()
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

	it("does not re-emit unchanged item ranges when the callback identity changes", () => {
		const calls: ItemsRenderedInfo[] = []

		function RangeReporter() {
			const [range, setRange] = React.useState<ItemsRenderedInfo | null>(null)

			return (
				<>
					<VirtualScrollBar
						height={60}
						itemHeight={20}
						overscan={2}
						onItemsRendered={(nextRange) => {
							calls.push(nextRange)
							setRange(nextRange)
						}}
					>
						{Array.from({ length: 10 }, (_, index) => (
							<div key={index} data-testid="unstable-callback-item">
								{index}
							</div>
						))}
					</VirtualScrollBar>
					<div data-testid="reported-range">
						{range ? `${range.startIndex}-${range.endIndex}` : "pending"}
					</div>
				</>
			)
		}

		const { getByTestId } = render(<RangeReporter />)

		expect(calls).toHaveLength(1)
		expect(getByTestId("reported-range").textContent).toBe("0-4")
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

	it("handles empty indexed rendering", () => {
		const renderItem = vi.fn((index: number) => (
			<div key={index}>
				{index}
			</div>
		))
		const ref = createRef<VirtualScrollBarRef>()

		render(
			<VirtualScrollBar
				height={100}
				itemCount={0}
				renderItem={renderItem}
				ref={ref}
			/>
		)

		expect(ref.current?.getScrollState().scrollHeight).toBe(0)
		expect(renderItem).not.toHaveBeenCalled()
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

	it("keeps the first visible row anchored when a measured row above it resizes", () => {
		vi.useFakeTimers()
		const resizeCallbacks: ResizeObserverCallback[] = []
		const OriginalResizeObserver = window.ResizeObserver
		class ManualResizeObserver {
			constructor(callback: ResizeObserverCallback) {
				resizeCallbacks.push(callback)
			}

			observe() {}

			disconnect() {}
		}
		window.ResizeObserver = ManualResizeObserver as unknown as typeof ResizeObserver
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockImplementation(function getOffsetHeight(this: HTMLElement) {
				return Number(this.getAttribute("data-height")) || 20
			})
		const ref = createRef<VirtualScrollBarRef>()
		let heights = [20, 20, 20, 20, 20, 20]
		const renderList = () => (
			<VirtualScrollBar height={40} itemHeight={20} overscan={1} ref={ref}>
				{heights.map((height, index) => (
					<div key={`item-${index}`} data-height={height}>
						item-{index}
					</div>
				))}
			</VirtualScrollBar>
		)
		const { rerender } = render(renderList())

		act(() => {
			resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver))
			vi.runAllTimers()
		})
		act(() => {
			ref.current?.scrollTo({ x: 0, y: 40 })
			vi.runAllTimers()
		})

		heights = [20, 60, 20, 20, 20, 20]
		rerender(renderList())
		act(() => {
			resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver))
			vi.runAllTimers()
		})

		expect(ref.current?.getScrollState().y).toBe(80)

		offsetHeightSpy.mockRestore()
		window.ResizeObserver = OriginalResizeObserver
		vi.useRealTimers()
	})

	it("keeps the same keyed row anchored when rows are prepended", () => {
		const ref = createRef<VirtualScrollBarRef>()
		let items = Array.from({ length: 8 }, (_, index) => `item-${index}`)
		const renderList = () => (
			<VirtualScrollBar
				height={40}
				itemHeight={20}
				overscan={0}
				maintainVisibleContentPosition
				ref={ref}
			>
				{items.map((item) => (
					<div key={item}>{item}</div>
				))}
			</VirtualScrollBar>
		)
		const { rerender } = render(renderList())

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 40 })
		})
		items = ["prepended-0", "prepended-1", ...items]
		rerender(renderList())

		expect(ref.current?.getScrollState().y).toBe(80)
	})

	it("keeps indexed keyed rows anchored when rows are prepended before measured content", () => {
		vi.useFakeTimers()
		const OriginalResizeObserver = window.ResizeObserver
		window.ResizeObserver = undefined as unknown as typeof ResizeObserver
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockImplementation(function getOffsetHeight(this: HTMLElement) {
				return Number(this.getAttribute("data-height")) || 20
			})
		const ref = createRef<VirtualScrollBarRef>()
		let prependedCount = 0
		const renderList = () => (
			<VirtualScrollBar
				height={40}
				estimatedItemHeight={20}
				itemCount={4 + prependedCount}
				itemKey={(index) => index < prependedCount ? `history-${index}` : `item-${index - prependedCount}`}
				maintainVisibleContentPosition
				overscan={0}
				ref={ref}
				renderItem={(index) => {
					const businessIndex = index - prependedCount
					return (
						<div data-height={businessIndex === 0 ? 80 : 20}>
							{index < prependedCount ? `history-${index}` : `item-${businessIndex}`}
						</div>
					)
				}}
			/>
		)

		try {
			const { rerender } = render(renderList())
			act(() => {
				vi.runAllTimers()
			})

			prependedCount = 1
			rerender(renderList())
			act(() => {
				vi.runAllTimers()
			})

			expect(ref.current?.getScrollState().y).toBe(20)
			expect(ref.current?.getScrollState().scrollHeight).toBe(160)
		} finally {
			offsetHeightSpy.mockRestore()
			window.ResizeObserver = OriginalResizeObserver
			vi.useRealTimers()
		}
	})

	it("keeps an indexed keyed top row fixed after a measured variable-height window prepends rows", () => {
		vi.useFakeTimers()
		const OriginalResizeObserver = window.ResizeObserver
		window.ResizeObserver = undefined as unknown as typeof ResizeObserver
		const getRowHeight = (index: number) => {
			const pattern = index % 36
			if (pattern === 0) {
				return 68
			}
			if (pattern % 11 === 0) {
				return 56
			}
			if (pattern % 5 === 0) {
				return 46
			}
			return 34
		}
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockImplementation(function getOffsetHeight(this: HTMLElement) {
				return Number(this.getAttribute("data-height")) || 40
			})
		const ref = createRef<VirtualScrollBarRef>()
		let prependedCount = 0
		const renderList = () => (
			<VirtualScrollBar
				height={238}
				estimatedItemHeight={40}
				itemCount={50_000_000 + prependedCount}
				itemKey={(index) => index < prependedCount ? `history-${index}` : `item-${index - prependedCount}`}
				maintainVisibleContentPosition
				overscan={20}
				ref={ref}
				renderItem={(index) => {
					const isHistoryRow = index < prependedCount
					const businessIndex = index - prependedCount
					const height = isHistoryRow ? 40 : getRowHeight(businessIndex)
					return (
						<div data-height={height}>
							{isHistoryRow ? `history-${index}` : `item-${businessIndex}`}
						</div>
					)
				}}
			/>
		)

		try {
			const { rerender } = render(renderList())
			act(() => {
				vi.runAllTimers()
			})

			prependedCount = 20
			rerender(renderList())
			act(() => {
				vi.runAllTimers()
			})

			expect(ref.current?.getScrollState().y).toBe(800)
		} finally {
			offsetHeightSpy.mockRestore()
			window.ResizeObserver = OriginalResizeObserver
			vi.useRealTimers()
		}
	})

	it("measures ResizeObserver entries by border-box height", () => {
		const element = document.createElement("div")
		Object.defineProperty(element, "offsetHeight", {
			configurable: true,
			value: 40
		})
		const entry = {
			contentRect: {height: 39},
			borderBoxSize: [{blockSize: 40}]
		} as unknown as ResizeObserverEntry
		const fallbackEntry = {
			contentRect: {height: 39}
		} as unknown as ResizeObserverEntry
		const objectBorderBoxEntry = {
			contentRect: {height: 39},
			borderBoxSize: {blockSize: 41}
		} as unknown as ResizeObserverEntry

		expect(getResizeObserverEntryHeight(entry, element)).toBe(40)
		expect(getResizeObserverEntryHeight(fallbackEntry, element)).toBe(40)
		expect(getResizeObserverEntryHeight(objectBorderBoxEntry, element)).toBe(41)
		Object.defineProperty(element, "offsetHeight", {
			configurable: true,
			value: 0
		})
		expect(getResizeObserverEntryHeight({
			contentRect: {height: 24}
		} as unknown as ResizeObserverEntry, element)).toBe(24)
		expect(getResizeObserverEntryHeight({
			contentRect: {height: 0}
		} as unknown as ResizeObserverEntry, element)).toBe(0)
	})

	it("falls back to the previous indexed anchor when the old item key cannot be found nearby", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const renderList = (keyPrefix: string, itemCount: number) => (
			<VirtualScrollBar
				height={40}
				itemHeight={20}
				itemCount={itemCount}
				itemKey={(index) => `${keyPrefix}-${index}`}
				renderItem={(index) => (
					<div key={index}>
						{keyPrefix}-{index}
					</div>
				)}
				ref={ref}
			/>
		)
		const { rerender } = render(renderList("before", 100))

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 400 })
		})
		rerender(renderList("after", 101))

		expect(ref.current?.getScrollState().y).toBe(400)
	})

	it("follows appended output when already scrolled to the bottom", () => {
		const ref = createRef<VirtualScrollBarRef>()
		let items = Array.from({ length: 5 }, (_, index) => `item-${index}`)
		const renderList = () => (
			<VirtualScrollBar height={40} itemHeight={20} followOutput ref={ref}>
				{items.map((item) => (
					<div key={item}>{item}</div>
				))}
			</VirtualScrollBar>
		)
		const { rerender } = render(renderList())

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 60 })
		})
		items = [...items, "item-5"]
		rerender(renderList())

		expect(ref.current?.getScrollState().y).toBe(80)
	})

	it("keeps following output when the viewport height changes at the bottom", () => {
		vi.useFakeTimers()
		const resizeCallbacks: ResizeObserverCallback[] = []
		const OriginalResizeObserver = window.ResizeObserver
		class ManualResizeObserver {
			constructor(callback: ResizeObserverCallback) {
				resizeCallbacks.push(callback)
			}

			observe() {}

			disconnect() {}
		}
		window.ResizeObserver = ManualResizeObserver as unknown as typeof ResizeObserver
		let viewportHeight = 40
		const rectSpy = vi
			.spyOn(HTMLElement.prototype, "getBoundingClientRect")
			.mockImplementation(function getBoundingClientRect(this: HTMLElement) {
				const height = this.classList.contains("scroll-bar-inner-container") ? viewportHeight : 20
				return {
					x: 0,
					y: 0,
					top: 0,
					left: 0,
					right: 100,
					bottom: height,
					width: 100,
					height,
					toJSON: () => ({}),
				} as DOMRect
			})
		const ref = createRef<VirtualScrollBarRef>()
		const items = Array.from({ length: 5 }, (_, index) => `item-${index}`)
		const renderList = () => (
			<VirtualScrollBar height={40} itemHeight={20} followOutput ref={ref}>
				{items.map((item) => (
					<div key={item}>{item}</div>
				))}
			</VirtualScrollBar>
		)
		render(renderList())

		act(() => {
			resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver))
			vi.runAllTimers()
		})
		act(() => {
			ref.current?.scrollTo({ x: 0, y: 60 })
			vi.runAllTimers()
		})
		viewportHeight = 20
		act(() => {
			resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver))
			vi.runAllTimers()
		})

		expect(ref.current?.getScrollState().y).toBe(80)

		rectSpy.mockRestore()
		window.ResizeObserver = OriginalResizeObserver
		vi.useRealTimers()
	})

	it("keeps following output when bottom row text mutations increase item height", () => {
		vi.useFakeTimers()
		const resizeCallbacks: ResizeObserverCallback[] = []
		const mutationCallbacks: MutationCallback[] = []
		const OriginalResizeObserver = window.ResizeObserver
		const OriginalMutationObserver = window.MutationObserver
		class ManualResizeObserver {
			constructor(callback: ResizeObserverCallback) {
				resizeCallbacks.push(callback)
			}

			observe() {}

			unobserve() {}

			disconnect() {}
		}
		class ManualMutationObserver {
			constructor(callback: MutationCallback) {
				mutationCallbacks.push(callback)
			}

			observe() {}

			disconnect() {}
		}
		window.ResizeObserver = ManualResizeObserver as unknown as typeof ResizeObserver
		window.MutationObserver = ManualMutationObserver as unknown as typeof MutationObserver
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockImplementation(function getOffsetHeight(this: HTMLElement) {
				return Number(this.getAttribute("data-height")) || 20
			})
		const ref = createRef<VirtualScrollBarRef>()
		let lastHeight = 20
		let streamed = false
		const items = Array.from({ length: 4 }, (_, index) => `item-${index}`)
		const renderList = () => (
			<VirtualScrollBar height={40} itemHeight={20} followOutput ref={ref}>
				{items.map((item, index) => (
					<div key={item} data-height={index === 3 ? lastHeight : 20}>
						{streamed && index === 3 ? "streamed output with multiple visual lines" : item}
					</div>
				))}
			</VirtualScrollBar>
		)
		const { rerender } = render(renderList())

		act(() => {
			resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver))
			vi.runAllTimers()
		})
		act(() => {
			ref.current?.scrollTo({ x: 0, y: 40 })
			vi.runAllTimers()
		})

		lastHeight = 60
		streamed = true
		rerender(renderList())
		act(() => {
			mutationCallbacks.forEach((callback) => callback([], {} as MutationObserver))
			vi.runAllTimers()
		})

		expect(ref.current?.getScrollState().scrollHeight).toBe(120)
		expect(ref.current?.getScrollState().y).toBe(80)

		offsetHeightSpy.mockRestore()
		window.MutationObserver = OriginalMutationObserver
		window.ResizeObserver = OriginalResizeObserver
		vi.useRealTimers()
	})

	it("keeps indexed anchoring safe when the previous anchor index is removed", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const renderList = (count: number) => (
			<VirtualScrollBar
				height={40}
				itemHeight={20}
				itemCount={count}
				renderItem={(index) => (
					<div key={index}>
						{index}
					</div>
				)}
				ref={ref}
			/>
		)
		const { rerender } = render(renderList(10))

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 160 })
		})
		rerender(renderList(2))

		expect(ref.current?.getScrollState().scrollHeight).toBe(40)
	})

	it("keeps stateful children mounted when preserveItemState is enabled", () => {
		function StatefulRow({ label }: { label: string }) {
			const [value, setValue] = React.useState(label)
			return (
				<input
					aria-label={label}
					value={value}
					style={{ height: 20 }}
					onChange={(event) => setValue(event.target.value)}
				/>
			)
		}
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar height={20} itemHeight={20} overscan={0} preserveItemState ref={ref}>
				{Array.from({ length: 5 }, (_, index) => (
					<StatefulRow key={`row-${index}`} label={`row-${index}`} />
				))}
			</VirtualScrollBar>
		)
		const getRowInput = (label: string) => container.querySelector(`input[aria-label='${label}']`) as HTMLInputElement

		fireEvent.change(getRowInput("row-0"), { target: { value: "persisted" } })
		act(() => {
			ref.current?.scrollTo({ x: 0, y: 60 })
		})
		act(() => {
			ref.current?.scrollTo({ x: 0, y: 0 })
		})

		expect(getRowInput("row-0").value).toBe("persisted")
	})

	it("defaults overscan items to 1 when only pixels config is provided", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const onItemsRendered = vi.fn()
		render(
			<VirtualScrollBar
				height={40}
				itemHeight={20}
				overscan={{ pixels: { before: 0, after: 0 } }}
				onItemsRendered={onItemsRendered}
				ref={ref}
			>
				{Array.from({ length: 10 }, (_, i) => (
					<div key={i}>{i}</div>
				))}
			</VirtualScrollBar>
		)

		const range = onItemsRendered.mock.calls.at(-1)?.[0]
		expect(range.startIndex).toBe(0)
		expect(range.endIndex).toBeGreaterThanOrEqual(2)
	})

	it("expands overscan in the active scroll direction when adaptiveOverscan is enabled", () => {
		vi.useFakeTimers()
		const onItemsRendered = vi.fn()
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				overscan={1}
				adaptiveOverscan={{ max: 6, velocityFactor: 0.01 }}
				onItemsRendered={onItemsRendered}
			>
				{Array.from({ length: 100 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 300 }))
			vi.advanceTimersByTime(20)
		})
		const lastRange = onItemsRendered.mock.calls.at(-1)?.[0]

		expect(lastRange.endIndex - lastRange.visibleEndIndex).toBeGreaterThan(1)
		vi.useRealTimers()
	})

	it("uses elapsed time and device scale when adaptive overscan grows the active range", () => {
		vi.useFakeTimers()
		const devicePixelRatioDescriptor = Object.getOwnPropertyDescriptor(window, "devicePixelRatio")
		Object.defineProperty(window, "devicePixelRatio", {
			configurable: true,
			value: 2
		})
		const onItemsRendered = vi.fn()
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				overscan={1}
				adaptiveOverscan={{ max: 5, velocityFactor: 0, timeFactor: 0.25 }}
				onItemsRendered={onItemsRendered}
			>
				{Array.from({ length: 100 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 320 }))
			vi.advanceTimersByTime(20)
		})

		const lastRange = onItemsRendered.mock.calls.at(-1)?.[0]
		expect(lastRange.endIndex - lastRange.visibleEndIndex).toBeGreaterThan(1)

		if (devicePixelRatioDescriptor) {
			Object.defineProperty(window, "devicePixelRatio", devicePixelRatioDescriptor)
		}
		vi.useRealTimers()
	})

	it("expands adaptive overscan before the visible range when scrolling upward", () => {
		vi.useFakeTimers()
		const onItemsRendered = vi.fn()
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				overscan={1}
				adaptiveOverscan={{ max: 6, velocityFactor: 0.01 }}
				onItemsRendered={onItemsRendered}
				ref={ref}
			>
				{Array.from({ length: 100 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 300 })
		})
		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: -200 }))
			vi.advanceTimersByTime(20)
		})

		const lastRange = onItemsRendered.mock.calls.at(-1)?.[0]
		expect(lastRange.visibleStartIndex - lastRange.startIndex).toBeGreaterThan(1)
		vi.useRealTimers()
	})

	it("returns adaptive overscan to the base range after scrolling ends", () => {
		vi.useFakeTimers()
		const onItemsRendered = vi.fn()
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				overscan={1}
				adaptiveOverscan={{ max: 6, velocityFactor: 0.01 }}
				onItemsRendered={onItemsRendered}
			>
				{Array.from({ length: 100 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 300 }))
			vi.advanceTimersByTime(20)
		})
		expect(onItemsRendered.mock.calls.at(-1)?.[0].endIndex - onItemsRendered.mock.calls.at(-1)?.[0].visibleEndIndex)
			.toBeGreaterThan(1)

		act(() => {
			vi.advanceTimersByTime(200)
		})

		const lastRange = onItemsRendered.mock.calls.at(-1)?.[0]
		expect(lastRange.endIndex - lastRange.visibleEndIndex).toBe(1)
		vi.useRealTimers()
	})

	it("uses default adaptive overscan settings when adaptiveOverscan is true", () => {
		vi.useFakeTimers()
		const devicePixelRatioDescriptor = Object.getOwnPropertyDescriptor(window, "devicePixelRatio")
		Object.defineProperty(window, "devicePixelRatio", {
			configurable: true,
			value: Number.NaN
		})
		const onItemsRendered = vi.fn()
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				overscan={1}
				adaptiveOverscan
				onItemsRendered={onItemsRendered}
			>
				{Array.from({ length: 100 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 300 }))
			vi.advanceTimersByTime(20)
		})

		const lastRange = onItemsRendered.mock.calls.at(-1)?.[0]
		expect(lastRange.endIndex - lastRange.visibleEndIndex).toBeGreaterThan(1)

		if (devicePixelRatioDescriptor) {
			Object.defineProperty(window, "devicePixelRatio", devicePixelRatioDescriptor)
		}
		vi.useRealTimers()
	})

	it("honors adaptive overscan min while defaulting max to at least min", () => {
		vi.useFakeTimers()
		const onItemsRendered = vi.fn()
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				overscan={1}
				adaptiveOverscan={{ min: 4, velocityFactor: -1, timeFactor: -1 }}
				onItemsRendered={onItemsRendered}
			>
				{Array.from({ length: 100 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 20 }))
			vi.advanceTimersByTime(20)
		})

		const lastRange = onItemsRendered.mock.calls.at(-1)?.[0]
		expect(lastRange.endIndex - lastRange.visibleEndIndex).toBe(4)
		vi.useRealTimers()
	})

	it("caps overscan rendering without dropping visible rows", () => {
		const onItemsRendered = vi.fn()
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				overscan={100}
				maxRenderedItems={5}
				onItemsRendered={onItemsRendered}
			>
				{Array.from({ length: 100 }, (_, index) => (
					<div key={index} data-testid="capped-row">
						{index}
					</div>
				))}
			</VirtualScrollBar>
		)

		const lastRange = onItemsRendered.mock.calls.at(-1)?.[0]
		expect(container.querySelectorAll("[data-testid='capped-row']")).toHaveLength(5)
		expect(lastRange.startIndex).toBeLessThanOrEqual(lastRange.visibleStartIndex)
		expect(lastRange.endIndex).toBeGreaterThanOrEqual(lastRange.visibleEndIndex)
	})

	it("falls back to virtual rendering when preserveItemState exceeds maxRenderedItems", () => {
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				overscan={100}
				maxRenderedItems={5}
				preserveItemState
			>
				{Array.from({ length: 100 }, (_, index) => (
					<div key={index} data-testid="preserved-cap-row">
						{index}
					</div>
				))}
			</VirtualScrollBar>
		)

		expect(container.querySelectorAll("[data-testid='preserved-cap-row']")).toHaveLength(5)
	})

	it("falls back to virtual rendering when non-virtual rendering exceeds maxRenderedItems", () => {
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				overscan={100}
				maxRenderedItems={5}
				isVirtual={false}
			>
				{Array.from({ length: 100 }, (_, index) => (
					<div key={index} data-testid="nonvirtual-cap-row">
						{index}
					</div>
				))}
			</VirtualScrollBar>
		)

		expect(container.querySelectorAll("[data-testid='nonvirtual-cap-row']")).toHaveLength(5)
	})

	it("allows disabling the non-virtual rendering guard with infinite maxRenderedItems", () => {
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				maxRenderedItems={Number.POSITIVE_INFINITY}
				isVirtual={false}
			>
				{Array.from({ length: 100 }, (_, index) => (
					<div key={index} data-testid="unguarded-row">
						{index}
					</div>
				))}
			</VirtualScrollBar>
		)

		expect(container.querySelectorAll("[data-testid='unguarded-row']")).toHaveLength(100)
	})

	it("uses one shared item ResizeObserver instead of one observer per mounted row", () => {
		const OriginalResizeObserver = window.ResizeObserver
		const instances: Array<{
			observe: ReturnType<typeof vi.fn>
			unobserve: ReturnType<typeof vi.fn>
			disconnect: ReturnType<typeof vi.fn>
		}> = []
		class CountingResizeObserver {
			observe = vi.fn()

			unobserve = vi.fn()

			disconnect = vi.fn()

			constructor() {
				instances.push(this)
			}
		}
		window.ResizeObserver = CountingResizeObserver as unknown as typeof ResizeObserver

		render(
			<VirtualScrollBar height={40} itemHeight={20} overscan={1}>
				{Array.from({ length: 10 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)

		expect(instances).toHaveLength(2)
		const itemObserver = instances.reduce((previous, current) => {
			return current.observe.mock.calls.length > previous.observe.mock.calls.length ? current : previous
		})
		expect(itemObserver.observe).toHaveBeenCalledTimes(3)

		window.ResizeObserver = OriginalResizeObserver
	})

	it("keeps item ref callbacks stable across unchanged rerenders", () => {
		const OriginalResizeObserver = window.ResizeObserver
		const instances: Array<{
			observe: ReturnType<typeof vi.fn>
			unobserve: ReturnType<typeof vi.fn>
			disconnect: ReturnType<typeof vi.fn>
		}> = []
		class CountingResizeObserver {
			observe = vi.fn()

			unobserve = vi.fn()

			disconnect = vi.fn()

			constructor() {
				instances.push(this)
			}
		}
		window.ResizeObserver = CountingResizeObserver as unknown as typeof ResizeObserver
		const renderList = () => (
			<VirtualScrollBar height={40} itemHeight={20} overscan={1}>
				{Array.from({ length: 10 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)

		const { rerender } = render(renderList())
		const itemObserver = instances.reduce((previous, current) => {
			return current.observe.mock.calls.length > previous.observe.mock.calls.length ? current : previous
		})
		expect(itemObserver.observe).toHaveBeenCalledTimes(3)

		rerender(renderList())

		expect(itemObserver.observe).toHaveBeenCalledTimes(3)
		expect(itemObserver.unobserve).not.toHaveBeenCalled()
		window.ResizeObserver = OriginalResizeObserver
	})

	it("limits the item ref callback cache while scrolling through new keys", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar
				height={20}
				itemHeight={20}
				overscan={0}
				maxRenderedItems={1}
				itemCount={20}
				renderItem={(index) => (
					<div key={index} data-testid="cached-ref-row">
						{index}
					</div>
				)}
				ref={ref}
			/>
		)

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 20 })
		})
		act(() => {
			ref.current?.scrollTo({ x: 0, y: 40 })
		})
		act(() => {
			ref.current?.scrollTo({ x: 0, y: 60 })
		})

		expect(container.querySelector("[data-testid='cached-ref-row']")?.textContent).toBe("3")
	})

	it("updates measured height from shared ResizeObserver entries", () => {
		const OriginalResizeObserver = window.ResizeObserver
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockImplementation(function getOffsetHeight(this: HTMLElement) {
				return Number(this.getAttribute("data-height")) || 20
			})
		const instances: Array<{
			callback: ResizeObserverCallback
			observe: ReturnType<typeof vi.fn>
			unobserve: ReturnType<typeof vi.fn>
			disconnect: ReturnType<typeof vi.fn>
		}> = []
		class ManualResizeObserver {
			callback: ResizeObserverCallback

			observe = vi.fn()

			unobserve = vi.fn()

			disconnect = vi.fn()

			constructor(callback: ResizeObserverCallback) {
				this.callback = callback
				instances.push(this)
			}
		}
		window.ResizeObserver = ManualResizeObserver as unknown as typeof ResizeObserver
		const ref = createRef<VirtualScrollBarRef>()
		let firstHeight = 20
		const { rerender } = render(
			<VirtualScrollBar height={40} itemHeight={20} ref={ref}>
				{Array.from({ length: 4 }, (_, index) => (
					<div key={index} data-height={index === 0 ? firstHeight : 20}>
						{index}
					</div>
				))}
			</VirtualScrollBar>
		)
		const itemObserver = instances.reduce((previous, current) => {
			return current.observe.mock.calls.length > previous.observe.mock.calls.length ? current : previous
		})
		const firstObservedElement = itemObserver.observe.mock.calls[0][0] as Element

		firstHeight = 60
		rerender(
			<VirtualScrollBar height={40} itemHeight={20} ref={ref}>
				{Array.from({ length: 4 }, (_, index) => (
					<div key={index} data-height={index === 0 ? firstHeight : 20}>
						{index}
					</div>
				))}
			</VirtualScrollBar>
		)
		act(() => {
			itemObserver.callback([
				{ target: firstObservedElement } as unknown as ResizeObserverEntry
			], {} as ResizeObserver)
		})
		act(() => {
			itemObserver.callback([
				{ target: document.createElement("div") } as unknown as ResizeObserverEntry
			], {} as ResizeObserver)
		})

		expect(ref.current?.getScrollState().scrollHeight).toBe(120)

		offsetHeightSpy.mockRestore()
		window.ResizeObserver = OriginalResizeObserver
	})

	it("uses ResizeObserver border-box sizes without reading layout", () => {
		const OriginalResizeObserver = window.ResizeObserver
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockReturnValue(999)
		const instances: Array<{
			callback: ResizeObserverCallback
			observe: ReturnType<typeof vi.fn>
			unobserve: ReturnType<typeof vi.fn>
			disconnect: ReturnType<typeof vi.fn>
		}> = []
		class ManualResizeObserver {
			callback: ResizeObserverCallback

			observe = vi.fn()

			unobserve = vi.fn()

			disconnect = vi.fn()

			constructor(callback: ResizeObserverCallback) {
				this.callback = callback
				instances.push(this)
			}
		}
		window.ResizeObserver = ManualResizeObserver as unknown as typeof ResizeObserver
		const ref = createRef<VirtualScrollBarRef>()
		render(
			<VirtualScrollBar height={40} itemHeight={20} ref={ref}>
				{Array.from({ length: 5 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)
		const itemObserver = instances.reduce((previous, current) => {
			return current.observe.mock.calls.length > previous.observe.mock.calls.length ? current : previous
		})
		const firstObservedElement = itemObserver.observe.mock.calls[0][0]

		act(() => {
				itemObserver.callback([
					{
						target: firstObservedElement,
						contentRect: { height: 79 },
						borderBoxSize: [{blockSize: 80}]
					} as unknown as ResizeObserverEntry
				], {} as ResizeObserver)
			})

		expect(ref.current?.getScrollState().scrollHeight).toBe(160)
		expect(offsetHeightSpy).not.toHaveBeenCalled()
		offsetHeightSpy.mockRestore()
		window.ResizeObserver = OriginalResizeObserver
	})

	it("tracks wheel offsets in a mutable scroll ref before React commits the frame", () => {
		vi.useFakeTimers()
		const ref = createRef<VirtualScrollBarRef>()
		const onScroll = vi.fn()
		const { container } = render(
			<VirtualScrollBar height={40} itemHeight={20} ref={ref} onScroll={onScroll}>
				{Array.from({ length: 10 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 80 }))
		})

		expect(ref.current?.getScrollState().y).toBe(80)
		expect(onScroll.mock.calls.some(([state]) => state.y === 80)).toBe(false)

		act(() => {
			vi.advanceTimersByTime(20)
		})

		expect(onScroll.mock.calls.some(([state]) => state.y === 80)).toBe(true)
		vi.useRealTimers()
	})

	it("does not read item layout during wheel frames when ResizeObserver is available", () => {
		vi.useFakeTimers()
		const offsetHeightSpy = vi
			.spyOn(HTMLElement.prototype, "offsetHeight", "get")
			.mockReturnValue(20)
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar
				height={40}
				itemHeight={20}
				itemCount={1000}
				renderItem={(index) => (
					<div key={index}>
						Row {index}
					</div>
				)}
				ref={ref}
			/>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element

		act(() => {
			vi.runAllTimers()
		})
		offsetHeightSpy.mockClear()

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 360 }))
			vi.advanceTimersByTime(40)
		})

		expect(ref.current?.getScrollState().y).toBe(360)
		expect(offsetHeightSpy).not.toHaveBeenCalled()
		offsetHeightSpy.mockRestore()
		vi.useRealTimers()
	})

	it("supports native scroll mode without blocking wheel default behavior", () => {
		const preventDefault = vi.fn()
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar height={40} itemHeight={20} scrollMode="native" ref={ref}>
				{Array.from({ length: 20 }, (_, index) => (
					<div key={index}>
						Row {index}
					</div>
				))}
			</VirtualScrollBar>
		)
		const viewContainer = container.querySelector(".scroll-bar-inner-container") as HTMLDivElement
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element
		const wheelEvent = new WheelEvent("wheel", { deltaY: 80, cancelable: true })
		Object.defineProperty(wheelEvent, "preventDefault", { value: preventDefault })

		act(() => {
			scrollContainer.dispatchEvent(wheelEvent)
		})

		expect(preventDefault).not.toHaveBeenCalled()
		expect(ref.current?.getScrollState().y).toBe(0)

		act(() => {
			viewContainer.scrollTop = 80
			fireEvent.scroll(viewContainer)
		})

		expect(ref.current?.getScrollState().y).toBe(80)
	})

	it("uses native scroll event timing for scroll-seek velocity", () => {
		vi.useFakeTimers()
		vi.setSystemTime(0)
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				itemCount={100}
				scrollMode="native"
				renderItem={(index) => (
					<div key={index} data-testid="real-row">
						Row {index}
					</div>
				)}
				scrollSeek={{
					velocityThreshold: 1,
					placeholder: (index) => (
						<div key={index} data-testid="seek-row">
							Loading {index}
						</div>
					)
				}}
			/>
		)
		const viewContainer = container.querySelector(".scroll-bar-inner-container") as HTMLDivElement

		act(() => {
			viewContainer.scrollTop = 10
			fireEvent.scroll(viewContainer)
			vi.advanceTimersByTime(20)
		})
		expect(container.querySelectorAll("[data-testid='seek-row']")).toHaveLength(0)

		act(() => {
			vi.setSystemTime(100)
			viewContainer.scrollTop = 30
			fireEvent.scroll(viewContainer)
			vi.advanceTimersByTime(20)
		})

		expect(container.querySelectorAll("[data-testid='seek-row']")).toHaveLength(0)
		vi.useRealTimers()
	})

	it("keeps controlled wheel precision for compressed massive scroll ranges", () => {
		const preventDefault = vi.fn()
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar
				height={100}
				itemHeight={20}
				itemCount={50_000_000}
				maxBrowserScrollHeight={1_000}
				scrollMode="native"
				renderItem={(index) => (
					<div key={index}>
						Row {index}
					</div>
				)}
				ref={ref}
			/>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element
		const wheelEvent = new WheelEvent("wheel", { deltaY: 360, cancelable: true })
		Object.defineProperty(wheelEvent, "preventDefault", { value: preventDefault })

		act(() => {
			scrollContainer.dispatchEvent(wheelEvent)
		})

		expect(preventDefault).toHaveBeenCalledTimes(1)
		expect(ref.current?.getScrollState().y).toBe(360)
	})

	it("renders lightweight scroll-seek placeholders while high velocity scrolling is active", () => {
		vi.useFakeTimers()
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				itemCount={1000}
				renderItem={(index) => (
					<div key={index} data-testid="real-row">
						Row {index}
					</div>
				)}
				scrollSeek={{
					velocityThreshold: 0.5,
					placeholder: (index) => (
						<div key={index} data-testid="seek-row">
							Loading {index}
						</div>
					)
				}}
				ref={ref}
			/>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element

		expect(container.querySelectorAll("[data-testid='real-row']").length).toBeGreaterThan(0)

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 300 }))
			vi.advanceTimersByTime(20)
		})

		expect(container.querySelectorAll("[data-testid='seek-row']").length).toBeGreaterThan(0)

		act(() => {
			vi.advanceTimersByTime(220)
		})

		expect(container.querySelectorAll("[data-testid='seek-row']")).toHaveLength(0)
		vi.useRealTimers()
	})

	it("does not store scroll-seek placeholder heights as measured row heights", () => {
		vi.useFakeTimers()
		const OriginalResizeObserver = window.ResizeObserver
		const instances: Array<{
			callback: ResizeObserverCallback
			observe: ReturnType<typeof vi.fn>
			unobserve: ReturnType<typeof vi.fn>
			disconnect: ReturnType<typeof vi.fn>
		}> = []
		class ManualResizeObserver {
			callback: ResizeObserverCallback

			observe = vi.fn()

			unobserve = vi.fn()

			disconnect = vi.fn()

			constructor(callback: ResizeObserverCallback) {
				this.callback = callback
				instances.push(this)
			}
		}
		window.ResizeObserver = ManualResizeObserver as unknown as typeof ResizeObserver
		const ref = createRef<VirtualScrollBarRef>()

		try {
			const { container } = render(
				<VirtualScrollBar
					height={40}
					itemHeight={20}
					itemCount={100}
					renderItem={(index) => (
						<div key={index} data-testid="real-row">
							Row {index}
						</div>
					)}
					scrollSeek={{
						velocityThreshold: 0.5,
						placeholder: (index) => (
							<div key={index} data-testid="seek-row">
								Loading {index}
							</div>
						)
					}}
					ref={ref}
				/>
			)
			const itemObserver = instances.reduce((previous, current) => {
				return current.observe.mock.calls.length > previous.observe.mock.calls.length ? current : previous
			})

			act(() => {
				container.querySelector(".scroll-bar-container")?.dispatchEvent(new WheelEvent("wheel", { deltaY: 300 }))
				vi.advanceTimersByTime(20)
			})

			const placeholderElement = itemObserver.observe.mock.calls
				.map(([element]) => element as HTMLElement)
				.find((element) => element.dataset.testid === "seek-row")

			expect(container.querySelector("[data-testid='seek-row']")).not.toBeNull()
			expect(placeholderElement).toBeUndefined()
			expect(ref.current?.getScrollState().scrollHeight).toBe(2_000)
		} finally {
			window.ResizeObserver = OriginalResizeObserver
			vi.useRealTimers()
		}
	})

	it("keeps scroll-seek active until velocity drops below the exit threshold", () => {
		vi.useFakeTimers()
		const onChange = vi.fn()
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				itemCount={1000}
				renderItem={(index) => (
					<div key={index} data-testid="real-row">
						Row {index}
					</div>
				)}
				scrollSeek={{
					velocityThreshold: 2,
					exitVelocityThreshold: 0.5,
					onChange,
					placeholder: (index) => (
						<div key={index} data-testid="seek-row">
							Loading {index}
						</div>
					)
				}}
			/>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 300 }))
			vi.advanceTimersByTime(20)
		})
		expect(container.querySelectorAll("[data-testid='seek-row']").length).toBeGreaterThan(0)
		expect(onChange).toHaveBeenLastCalledWith(true)

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 20 }))
			vi.advanceTimersByTime(20)
		})
		expect(container.querySelectorAll("[data-testid='seek-row']").length).toBeGreaterThan(0)
		expect(onChange).toHaveBeenCalledTimes(1)

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 1 }))
			vi.advanceTimersByTime(20)
		})
		expect(container.querySelectorAll("[data-testid='seek-row']")).toHaveLength(0)
		expect(onChange).toHaveBeenLastCalledWith(false)
		vi.useRealTimers()
	})

	it("uses the default scroll-seek placeholder when scrollSeek is true", () => {
		vi.useFakeTimers()
		const { container } = render(
			<VirtualScrollBar
				height={60}
				itemHeight={20}
				itemCount={100}
				renderItem={(index) => (
					<div key={index} data-testid="real-row">
						Row {index}
					</div>
				)}
				scrollSeek
			/>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element

		act(() => {
			scrollContainer.dispatchEvent(new WheelEvent("wheel", { deltaY: 300 }))
			vi.advanceTimersByTime(20)
		})

		const placeholder = container.querySelector("[aria-hidden='true']") as HTMLElement
		expect(placeholder).not.toBeNull()
		expect(placeholder.style.height).toBe("20px")
		vi.useRealTimers()
	})

	it("skips missing indexed rows returned by renderItem", () => {
		const { container } = render(
			<VirtualScrollBar
				height={40}
				itemCount={4}
				itemHeight={20}
				renderItem={(index) => (
					index === 0
						? null as unknown as React.ReactElement
						: (
							<div key={index} data-testid="present-row">
								{index}
							</div>
						)
				)}
			/>
		)

		expect(container.querySelectorAll("[data-testid='present-row']")).toHaveLength(2)
	})

	it("skips sticky overlays when the sticky renderItem returns no node", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar
				height={40}
				itemHeight={20}
				itemCount={20}
				stickyIndices={[0]}
				renderItem={(index) => (
					index === 0
						? null as unknown as React.ReactElement
						: (
							<div key={index} data-testid="sticky-null-row">
								{index}
							</div>
						)
				)}
				ref={ref}
			/>
		)

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 100 })
		})

		expect(container.querySelector(".scroll-bar-sticky-layer")).toBeNull()
		expect(container.querySelector("[data-testid='sticky-null-row']")).not.toBeNull()
	})

	it("renders the active sticky item even when it is outside the virtual range", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar height={40} itemHeight={20} overscan={0} stickyIndices={[0, 10, 20]} ref={ref}>
				{Array.from({ length: 30 }, (_, index) => (
					<div key={index} data-testid={`row-${index}`}>
						{index === 10 ? "Group B" : `Row ${index}`}
					</div>
				))}
			</VirtualScrollBar>
		)

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 260 })
		})

		const sticky = container.querySelector(".scroll-bar-sticky-item") as HTMLElement
		expect(sticky).not.toBeNull()
		expect(sticky.textContent).toBe("Group B")
		expect(sticky.style.position).toBe("sticky")
		expect(sticky.style.top).toBe("0px")
		expect(container.querySelector("[data-testid='row-13']")).not.toBeNull()
	})

	it("pins grouped sticky items in the top overlay and overlaps the next header while pushing away", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar height={40} itemHeight={20} overscan={0} groupCounts={[2, 2]} ref={ref}>
				<div key="group-0">Group A</div>
				<div key="item-0-0">Item A-0</div>
				<div key="item-0-1">Item A-1</div>
				<div key="group-1">Group B</div>
				<div key="item-1-0">Item B-0</div>
				<div key="item-1-1">Item B-1</div>
			</VirtualScrollBar>
		)

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 59 })
		})

		const pushingStickyLayer = container.querySelector(".scroll-bar-sticky-layer") as HTMLElement
		expect(pushingStickyLayer.textContent).toContain("Group A")
		expect(pushingStickyLayer.style.transform).toBe("translateY(-18px)")

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 60 })
		})

		const stickyLayer = container.querySelector(".scroll-bar-sticky-layer") as HTMLElement
		expect(stickyLayer).not.toBeNull()
		expect(container.querySelector(".scroll-bar-inner-container > .scroll-bar-sticky-layer")).toBe(stickyLayer)
		expect(stickyLayer.getAttribute("aria-hidden")).toBe("true")
		expect(stickyLayer.textContent).toContain("Group B")
	})

	it("uses the rendered next sticky position when dynamic row heights shift the handoff distance", () => {
		const rectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
		rectSpy.mockImplementation(function (this: HTMLElement) {
			if (this.classList.contains("scroll-bar-inner-container")) {
				return createTestRect(0, 40)
			}
			if (this.classList.contains("scroll-bar-sticky-item")) {
				return createTestRect(0, 20)
			}
			if (this.dataset.testid === "group-b") {
				return createTestRect(5, 20)
			}
			return createTestRect(0, 20)
		})

		try {
			const ref = createRef<VirtualScrollBarRef>()
			const renderStickyList = () => (
				<VirtualScrollBar height={40} itemHeight={20} overscan={0} groupCounts={[2, 2]} ref={ref}>
					<div key="group-0">Group A</div>
					<div key="item-0-0">Item A-0</div>
					<div key="item-0-1">Item A-1</div>
					<div key="group-1" data-testid="group-b">Group B</div>
					<div key="item-1-0">Item B-0</div>
					<div key="item-1-1">Item B-1</div>
				</VirtualScrollBar>
			)
			const { container, rerender } = render(renderStickyList())

			act(() => {
				ref.current?.scrollTo({ x: 0, y: 59 })
			})

			const pushingStickyLayer = container.querySelector(".scroll-bar-sticky-layer") as HTMLElement
			expect(pushingStickyLayer.textContent).toContain("Group A")
			expect(pushingStickyLayer.style.transform).toBe("translateY(-14px)")

			rerender(renderStickyList())
			expect(pushingStickyLayer.style.transform).toBe("translateY(-14px)")
		} finally {
			rectSpy.mockRestore()
		}
	})

	it("falls back to logical sticky distance when the measured next sticky distance is zero", () => {
		const rectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
		rectSpy.mockImplementation(function (this: HTMLElement) {
			if (this.classList.contains("scroll-bar-inner-container")) {
				return createTestRect(0, 40)
			}
			if (this.classList.contains("scroll-bar-sticky-item")) {
				return createTestRect(0, 20)
			}
			if (this.dataset.testid === "group-b") {
				return createTestRect(0, 20)
			}
			return createTestRect(0, 20)
		})

		try {
			const ref = createRef<VirtualScrollBarRef>()
			const { container } = render(
				<VirtualScrollBar height={40} itemHeight={20} overscan={0} groupCounts={[2, 2]} ref={ref}>
					<div key="group-0">Group A</div>
					<div key="item-0-0">Item A-0</div>
					<div key="item-0-1">Item A-1</div>
					<div key="group-1" data-testid="group-b">Group B</div>
					<div key="item-1-0">Item B-0</div>
					<div key="item-1-1">Item B-1</div>
				</VirtualScrollBar>
			)

			act(() => {
				ref.current?.scrollTo({ x: 0, y: 59 })
			})

			const pushingStickyLayer = container.querySelector(".scroll-bar-sticky-layer") as HTMLElement
			expect(pushingStickyLayer.style.transform).toBe("translateY(-18px)")
		} finally {
			rectSpy.mockRestore()
		}
	})

	it("ignores non-finite measured sticky distances", () => {
		const rectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
		rectSpy.mockImplementation(function (this: HTMLElement) {
			if (this.classList.contains("scroll-bar-inner-container")) {
				return createTestRect(0, 40)
			}
			if (this.classList.contains("scroll-bar-sticky-item")) {
				return createTestRect(0, 20)
			}
			if (this.dataset.testid === "group-b") {
				return createTestRect(Number.NaN, 20)
			}
			return createTestRect(0, 20)
		})

		try {
			const ref = createRef<VirtualScrollBarRef>()
			const { container } = render(
				<VirtualScrollBar height={40} itemHeight={20} overscan={0} groupCounts={[2, 2]} ref={ref}>
					<div key="group-0">Group A</div>
					<div key="item-0-0">Item A-0</div>
					<div key="item-0-1">Item A-1</div>
					<div key="group-1" data-testid="group-b">Group B</div>
					<div key="item-1-0">Item B-0</div>
					<div key="item-1-1">Item B-1</div>
				</VirtualScrollBar>
			)

			act(() => {
				ref.current?.scrollTo({ x: 0, y: 59 })
			})

			const pushingStickyLayer = container.querySelector(".scroll-bar-sticky-layer") as HTMLElement
			expect(pushingStickyLayer.style.transform).toBe("translateY(-18px)")
		} finally {
			rectSpy.mockRestore()
		}
	})

	it("clears cached sticky transition measurements when the handoff target cannot be measured anymore", () => {
		let nextHeaderMode: "positive" | "zero" = "positive"
		const rectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
		rectSpy.mockImplementation(function (this: HTMLElement) {
			if (this.classList.contains("scroll-bar-inner-container")) {
				return createTestRect(0, 40)
			}
			if (this.classList.contains("scroll-bar-sticky-item")) {
				return createTestRect(0, 20)
			}
			if (this.dataset.testid === "group-b") {
				return nextHeaderMode === "zero"
					? createTestRect(0, 0)
					: createTestRect(5, 20)
			}
			return createTestRect(0, 20)
		})

		try {
			const ref = createRef<VirtualScrollBarRef>()
			const renderTwoGroups = () => (
				<VirtualScrollBar height={40} itemHeight={20} overscan={0} groupCounts={[2, 2]} ref={ref}>
					<div key="group-0">Group A</div>
					<div key="item-0-0">Item A-0</div>
					<div key="item-0-1">Item A-1</div>
					<div key="group-1" data-testid="group-b">Group B</div>
					<div key="item-1-0">Item B-0</div>
					<div key="item-1-1">Item B-1</div>
				</VirtualScrollBar>
			)
			const renderSingleGroup = () => (
				<VirtualScrollBar height={40} itemHeight={20} overscan={0} groupCounts={[5]} ref={ref}>
					<div key="group-0">Group A</div>
					<div key="item-0">Item 0</div>
					<div key="item-1">Item 1</div>
					<div key="item-2">Item 2</div>
					<div key="item-3">Item 3</div>
					<div key="item-4">Item 4</div>
				</VirtualScrollBar>
			)
			const renderSparseStickyList = () => (
				<VirtualScrollBar height={40} itemHeight={20} overscan={0} stickyIndices={[0, 20]} ref={ref}>
					{Array.from({ length: 30 }, (_, index) => (
						<div key={index}>{index === 0 ? "Group A" : index === 20 ? "Group C" : `Item ${index}`}</div>
					))}
				</VirtualScrollBar>
			)
			const renderPlainList = () => (
				<VirtualScrollBar height={40} itemHeight={20} overscan={0} ref={ref}>
					<div key="item-0">Item 0</div>
					<div key="item-1">Item 1</div>
					<div key="item-2">Item 2</div>
					<div key="item-3">Item 3</div>
					<div key="item-4">Item 4</div>
					<div key="item-5">Item 5</div>
				</VirtualScrollBar>
			)
			const { container, rerender } = render(renderTwoGroups())

			act(() => {
				ref.current?.scrollTo({ x: 0, y: 59 })
			})
			expect((container.querySelector(".scroll-bar-sticky-layer") as HTMLElement).style.transform).toBe("translateY(-14px)")

			nextHeaderMode = "zero"
			act(() => {
				rerender(renderTwoGroups())
			})
			expect((container.querySelector(".scroll-bar-sticky-layer") as HTMLElement).style.transform).toBe("translateY(-18px)")

			nextHeaderMode = "positive"
			act(() => {
				rerender(renderTwoGroups())
			})
			expect((container.querySelector(".scroll-bar-sticky-layer") as HTMLElement).style.transform).toBe("translateY(-14px)")

			act(() => {
				rerender(renderSingleGroup())
			})
			expect((container.querySelector(".scroll-bar-sticky-layer") as HTMLElement).style.transform).toBe("")

			act(() => {
				rerender(renderTwoGroups())
			})
			expect((container.querySelector(".scroll-bar-sticky-layer") as HTMLElement).style.transform).toBe("translateY(-14px)")

			act(() => {
				rerender(renderSparseStickyList())
			})
			expect((container.querySelector(".scroll-bar-sticky-layer") as HTMLElement).style.transform).toBe("")

			act(() => {
				rerender(renderPlainList())
			})
			expect(container.querySelector(".scroll-bar-sticky-layer")).toBeNull()
		} finally {
			rectSpy.mockRestore()
		}
	})

	it("keeps the sticky overlay size stable when ResizeObserver reports the same height", () => {
		const rectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(createTestRect(0, 20))
		const originalResizeObserver = window.ResizeObserver
		class ImmediateResizeObserver {
			constructor(private readonly callback: ResizeObserverCallback) {}
			observe() {
				this.callback([], this as unknown as ResizeObserver)
			}
			disconnect() {}
			unobserve() {}
		}
		window.ResizeObserver = ImmediateResizeObserver as unknown as typeof ResizeObserver

		try {
			const ref = createRef<VirtualScrollBarRef>()
			const { container } = render(
				<VirtualScrollBar height={40} itemHeight={20} overscan={0} groupCounts={[2, 2]} ref={ref}>
					<div key="group-0">Group A</div>
					<div key="item-0-0">Item A-0</div>
					<div key="item-0-1">Item A-1</div>
					<div key="group-1">Group B</div>
					<div key="item-1-0">Item B-0</div>
					<div key="item-1-1">Item B-1</div>
				</VirtualScrollBar>
			)

			act(() => {
				ref.current?.scrollTo({ x: 0, y: 59 })
			})

			expect(container.querySelector(".scroll-bar-sticky-layer")).not.toBeNull()
		} finally {
			window.ResizeObserver = originalResizeObserver
			rectSpy.mockRestore()
		}
	})

	it("cleans up sticky overlay measurement raf when ResizeObserver is unavailable", () => {
		const rectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(createTestRect(0, 20))
		const originalResizeObserver = window.ResizeObserver
		window.ResizeObserver = undefined as unknown as typeof ResizeObserver

		try {
			const ref = createRef<VirtualScrollBarRef>()
			const { container, unmount } = render(
				<VirtualScrollBar height={40} itemHeight={20} overscan={0} groupCounts={[2, 2]} ref={ref}>
					<div key="group-0">Group A</div>
					<div key="item-0-0">Item A-0</div>
					<div key="item-0-1">Item A-1</div>
					<div key="group-1">Group B</div>
					<div key="item-1-0">Item B-0</div>
					<div key="item-1-1">Item B-1</div>
				</VirtualScrollBar>
			)

			act(() => {
				ref.current?.scrollTo({ x: 0, y: 59 })
			})

			expect(container.querySelector(".scroll-bar-sticky-layer")).not.toBeNull()
			unmount()
		} finally {
			window.ResizeObserver = originalResizeObserver
			rectSpy.mockRestore()
		}
	})

	it("derives sticky group headers from groupCounts", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar height={40} itemHeight={20} overscan={0} groupCounts={[3, 2]} ref={ref}>
				<div key="group-0">Group 0</div>
				<div key="item-0-0">Item 0-0</div>
				<div key="item-0-1">Item 0-1</div>
				<div key="item-0-2">Item 0-2</div>
				<div key="group-1">Group 1</div>
				<div key="item-1-0">Item 1-0</div>
				<div key="item-1-1">Item 1-1</div>
			</VirtualScrollBar>
		)

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 100 })
		})

		expect(container.querySelector(".scroll-bar-sticky-item")?.textContent).toBe("Group 1")
	})

	it("ignores groupCounts entries that exceed the rendered item count", () => {
		const { container } = render(
			<VirtualScrollBar height={40} itemHeight={20} groupCounts={[3, 3]}>
				<div key="group-0">Group 0</div>
				<div key="item-0">Item 0</div>
				<div key="item-1">Item 1</div>
				<div key="item-2">Item 2</div>
			</VirtualScrollBar>
		)

		expect(container.querySelector(".scroll-bar-wrapper")?.textContent).toContain("Group 0")
	})

	it("treats an empty groupCounts array as having no sticky headers", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar height={40} itemHeight={20} groupCounts={[]} ref={ref}>
				<div key="a">A</div>
				<div key="b">B</div>
			</VirtualScrollBar>
		)

		expect(container.querySelector(".scroll-bar-sticky-item")).toBeNull()
	})

	it("adds virtualized list position metadata for indexed rendering", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar
				height={40}
				itemHeight={20}
				itemCount={50}
					renderItem={(index) => (
						<div key={index} data-testid={`row-${index}`}>
							Row {index}
						</div>
					)}
					ref={ref}
				/>
			)

		const list = container.querySelector("[role='list']") as HTMLElement
		expect(list).not.toBeNull()
		expect(container.querySelector("[data-testid='row-0']")?.getAttribute("role")).toBe("listitem")
		expect(container.querySelector("[data-testid='row-0']")?.getAttribute("aria-posinset")).toBe("1")
		expect(container.querySelector("[data-testid='row-0']")?.getAttribute("aria-setsize")).toBe("50")

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 80 })
		})

		expect(container.querySelector("[data-testid='row-4']")?.getAttribute("aria-posinset")).toBe("5")
	})

	it("adds list accessibility attributes by default", () => {
		const { container } = render(
			<VirtualScrollBar height={40} itemHeight={20}>
				{Array.from({ length: 3 }, (_, index) => (
					<div key={index} data-testid={`list-row-${index}`}>
						{index}
					</div>
				))}
			</VirtualScrollBar>
		)

		const list = container.querySelector("[role='list']") as HTMLElement
		expect(list).not.toBeNull()
		expect(container.querySelector("[data-testid='list-row-0']")?.getAttribute("role")).toBe("listitem")
		expect(container.querySelector("[data-testid='list-row-0']")?.getAttribute("aria-posinset")).toBe("1")
		expect(container.querySelector("[data-testid='list-row-0']")?.getAttribute("aria-setsize")).toBe("3")
	})

	it("reports current dimensions through the imperative resizeObserver helper", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const callback = vi.fn()
		render(
			<VirtualScrollBar width={120} height={80} itemHeight={20} ref={ref}>
				<div key="row">row</div>
			</VirtualScrollBar>
		)

		ref.current?.resizeObserver(callback)

		expect(callback).toHaveBeenCalledWith({
			clientWidth: 120,
			clientHeight: 80,
			scrollWidth: 120,
			scrollHeight: 20
		})
	})

	it("maps native fallback scroll events back to logical offsets", () => {
		vi.useFakeTimers()
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar height={40} itemHeight={20} ref={ref}>
				{Array.from({ length: 20 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)
		const inner = container.querySelector(".scroll-bar-inner-container") as HTMLElement

		fireEvent.scroll(inner, { target: { scrollTop: 60, scrollLeft: 0 } })
		expect(ref.current?.getScrollState().y).toBe(60)

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 80 })
		})
		fireEvent.scroll(inner, { target: { scrollTop: 80, scrollLeft: 0 } })
		expect(ref.current?.getScrollState().y).toBe(80)
		vi.useRealTimers()
	})

	it("keeps native fallback scroll deltas local for massive logical ranges", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar
				height={100}
				itemCount={1_000_000}
				estimatedItemHeight={100}
				maxBrowserScrollHeight={1000}
				renderItem={(index) => (
					<div key={index}>
						{index}
					</div>
				)}
				ref={ref}
			/>
		)
		const inner = container.querySelector(".scroll-bar-inner-container") as HTMLElement

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 50_000_000 })
		})
		const physicalScrollTop = inner.scrollTop

		fireEvent.scroll(inner, { target: { scrollTop: physicalScrollTop + 10, scrollLeft: 0 } })

		expect(ref.current?.getScrollState().y).toBe(50_000_010)
	})

	it("updates offsets through the rendered vertical and horizontal thumbs", () => {
		vi.useFakeTimers()
		const scrollWidthSpy = vi
			.spyOn(HTMLElement.prototype, "scrollWidth", "get")
			.mockReturnValue(1000)
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar width={100} height={100} itemHeight={20} ref={ref}>
				{Array.from({ length: 20 }, (_, index) => (
					<div key={index} style={{ width: 1000 }}>
						{index}
					</div>
				))}
			</VirtualScrollBar>
		)
		const verticalThumb = container.querySelector(".scroll-bar-vertical-thumb") as HTMLElement
		const horizontalThumb = container.querySelector(".scroll-bar-horizontal-thumb") as HTMLElement
		const verticalDown = new MouseEvent("mousedown", { bubbles: true })
		Object.defineProperty(verticalDown, "pageY", { value: 0 })
		const verticalMove = new MouseEvent("mousemove", { bubbles: true })
		Object.defineProperty(verticalMove, "pageY", { value: 20 })
		const horizontalDown = new MouseEvent("mousedown", { bubbles: true })
		Object.defineProperty(horizontalDown, "pageX", { value: 0 })
		const horizontalMove = new MouseEvent("mousemove", { bubbles: true })
		Object.defineProperty(horizontalMove, "pageX", { value: 20 })

		act(() => {
			verticalThumb.dispatchEvent(verticalDown)
		})
		act(() => {
			window.dispatchEvent(verticalMove)
			vi.advanceTimersByTime(20)
		})
		act(() => {
			fireEvent.mouseUp(window)
			horizontalThumb.dispatchEvent(horizontalDown)
		})
		act(() => {
			window.dispatchEvent(horizontalMove)
			vi.advanceTimersByTime(20)
		})

		expect(ref.current?.getScrollState().y).toBeGreaterThan(0)
		expect(ref.current?.getScrollState().x).toBeGreaterThan(0)

		scrollWidthSpy.mockRestore()
		vi.useRealTimers()
	})

	it("renders the dragged vertical thumb range in the same animation frame", () => {
		vi.useFakeTimers()
		const { container } = render(
			<VirtualScrollBar width={100} height={100} itemHeight={20} overscan={0}>
				{Array.from({ length: 20 }, (_, index) => (
					<div key={index} data-testid="drag-row">
						{index}
					</div>
				))}
			</VirtualScrollBar>
		)
		const verticalThumb = container.querySelector(".scroll-bar-vertical-thumb") as HTMLElement
		const verticalDown = new MouseEvent("mousedown", { bubbles: true })
		Object.defineProperty(verticalDown, "pageY", { value: 0 })
		const verticalMove = new MouseEvent("mousemove", { bubbles: true })
		Object.defineProperty(verticalMove, "pageY", { value: 20 })

		act(() => {
			verticalThumb.dispatchEvent(verticalDown)
		})
		act(() => {
			window.dispatchEvent(verticalMove)
			vi.advanceTimersByTime(20)
		})

		expect(container.querySelector("[data-testid='drag-row']")?.textContent).toBe("4")
		vi.useRealTimers()
	})

	it("does not move the native viewport before the dragged range has rendered", () => {
		vi.useFakeTimers()
		const observedRenderScrollTops: number[] = []
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar
				height={100}
				itemCount={1_000_000}
				estimatedItemHeight={100}
				maxBrowserScrollHeight={1000}
				overscan={0}
				renderItem={(index) => {
					if (index > 0) {
						const inner = document.querySelector(".scroll-bar-inner-container") as HTMLElement | null
						observedRenderScrollTops.push(inner?.scrollTop ?? -1)
					}
					return (
						<div key={index} data-testid="dragged-massive-row">
							{index}
						</div>
					)
				}}
				ref={ref}
			/>
		)
		const inner = container.querySelector(".scroll-bar-inner-container") as HTMLElement
		const verticalThumb = container.querySelector(".scroll-bar-vertical-thumb") as HTMLElement
		const verticalDown = new MouseEvent("mousedown", { bubbles: true })
		Object.defineProperty(verticalDown, "pageY", { value: 0 })
		const verticalMove = new MouseEvent("mousemove", { bubbles: true })
		Object.defineProperty(verticalMove, "pageY", { value: 75 })

		act(() => {
			verticalThumb.dispatchEvent(verticalDown)
		})
		act(() => {
			window.dispatchEvent(verticalMove)
		})

		expect(inner.scrollTop).toBe(0)
		expect(ref.current?.getScrollState().y).toBe(0)

		act(() => {
			vi.advanceTimersByTime(20)
		})

		expect(observedRenderScrollTops).toContain(0)
		expect(inner.scrollTop).toBeGreaterThan(0)
		expect(ref.current?.getScrollState().y).toBe(99_999_900)
		vi.useRealTimers()
	})

	it("ignores fallback scroll when there is no logical scroll range", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar height={100} itemHeight={20} ref={ref}>
				<div key="single">single</div>
			</VirtualScrollBar>
		)
		const inner = container.querySelector(".scroll-bar-inner-container") as HTMLElement

		fireEvent.scroll(inner, { target: { scrollTop: 60, scrollLeft: 0 } })

		expect(ref.current?.getScrollState().y).toBe(0)
	})

	it("prevents scroll on the internal logical container and shows bars on mouse enter", () => {
		vi.useFakeTimers()
		const { container } = render(
			<VirtualScrollBar height={40} itemHeight={20}>
				{Array.from({ length: 10 }, (_, index) => (
					<div key={index}>{index}</div>
				))}
			</VirtualScrollBar>
		)
		const inner = container.querySelector(".scroll-bar-inner-container") as HTMLElement
		const scrollContainer = container.querySelector(".scroll-bar-container") as HTMLElement
		const preventDefault = vi.fn()
		const scrollEvent = new Event("scroll", { bubbles: true })
		Object.defineProperty(scrollEvent, "preventDefault", { value: preventDefault })

		act(() => {
			fireEvent.mouseEnter(inner)
			scrollContainer.dispatchEvent(scrollEvent)
			vi.advanceTimersByTime(20)
		})

		expect(preventDefault).toHaveBeenCalled()
		vi.useRealTimers()
	})

	it("uses a configurable physical scroll height for massive logical ranges", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const { container } = render(
			<VirtualScrollBar
				height={100}
				itemCount={1_000_000}
				estimatedItemHeight={100}
				maxBrowserScrollHeight={1000}
				renderItem={(index) => (
					<div key={index} data-testid="massive-row">
						{index}
					</div>
				)}
				ref={ref}
			/>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as HTMLElement
		const wrapper = container.querySelector(".scroll-bar-wrapper") as HTMLElement

		expect(ref.current?.getScrollState().scrollHeight).toBe(100_000_000)
		expect(scrollContainer.style.height).toBe("1000px")

		act(() => {
			ref.current?.scrollTo({ x: 0, y: 99_999_900 })
		})

		const transformOffset = Number.parseFloat(wrapper.style.transform.match(/translateY\(([-\d.]+)px\)/)?.[1] || "0")
		expect(transformOffset).toBeGreaterThan(0)
		expect(transformOffset).toBeLessThanOrEqual(1000)
	})
})

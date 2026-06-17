import React from "react"
import { act, fireEvent, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import InternalScrollBar from "../src/components/ScrollBar"
import { Item } from "../src/components/Item"
import {
	renderThumbHorizontalDefault,
	renderThumbVerticalDefault,
	renderTrackHorizontalDefault,
	renderTrackVerticalDefault,
	renderViewDefault
} from "../src/defaultRenderElements"
import type { ScrollState } from "../src/types"
import { findDOMNode, getPageXY } from "../src/utils"

const baseScrollState: ScrollState = {
	x: 0,
	y: 0,
	scrollHeight: 1000,
	scrollWidth: 1000,
	clientHeight: 100,
	clientWidth: 100,
	isScrolling: false
}

const renderTrack = (props?: React.HTMLProps<HTMLDivElement>) => (
	<div {...props} data-testid="track" />
)

const renderThumb = (props?: React.HTMLProps<HTMLDivElement>) => (
	<div {...props} data-testid="thumb" />
)

describe("internal component utilities", () => {
	it("renders default elements without incoming props", () => {
		const { container } = render(
			<>
				{renderViewDefault()}
				{renderTrackHorizontalDefault()}
				{renderTrackVerticalDefault()}
				{renderThumbHorizontalDefault()}
				{renderThumbVerticalDefault()}
			</>
		)

		expect(container.querySelectorAll("div")).toHaveLength(5)
	})

	it("merges hidden styles for cloned items", () => {
		const setRef = vi.fn()
		const { container } = render(
			<Item
				hidden
				itemProps={{ className: "extra", style: { height: 12 } }}
				setRef={setRef}
			>
				<div className="base" style={{ color: "red" }}>
					row
				</div>
			</Item>
		)

		const row = container.querySelector(".base.extra") as HTMLElement
		expect(row.style.display).toBe("none")
		expect(row.style.height).toBe("12px")
		expect(row.style.color).toBe("red")
		expect(setRef).not.toHaveBeenCalled()
	})

	it("resolves class component DOM nodes and touch coordinates", () => {
		class LegacyRow extends React.Component {
			render() {
				return <div data-testid="legacy-row">legacy</div>
			}
		}
		const ref = React.createRef<LegacyRow>()
		const { getByTestId } = render(<LegacyRow ref={ref} />)
		const touchEvent = {
			touches: [{ pageX: 12, pageY: 34 }]
		} as unknown as TouchEvent
		const resolvedNode = findDOMNode(ref.current as unknown as React.ReactInstance)
		const legacyNode = getByTestId("legacy-row")

		expect(findDOMNode(legacyNode)).toBe(legacyNode)
		expect(resolvedNode === null || resolvedNode === legacyNode).toBe(true)
		expect(findDOMNode({} as React.ReactInstance)).toBeNull()
		expect(getPageXY(touchEvent)).toBe(34)
		expect(getPageXY(touchEvent, true)).toBe(12)
	})

	it("prevents track mouse down defaults and exposes the imperative hide delay", () => {
		vi.useFakeTimers()
		const ref = React.createRef<{ delayHiddenScrollBar: () => void }>()
		const { getByTestId } = render(
			<InternalScrollBar
				ref={ref}
				orientation="vertical"
				prefixCls="scroll-bar"
				scrollState={baseScrollState}
				containerSize={100}
				scrollRange={1000}
				thumbSize={{ width: 6, height: 25 }}
				autoHideTimeout={100}
				renderTrack={renderTrack}
				renderThumb={renderThumb}
			/>
		)
		const track = getByTestId("track")
		const preventDefault = vi.fn()
		const event = new MouseEvent("mousedown", { bubbles: true })
		Object.defineProperty(event, "preventDefault", { value: preventDefault })
		const touchPreventDefault = vi.fn()
		const touchEvent = new Event("touchstart", { bubbles: true })
		Object.defineProperty(touchEvent, "preventDefault", { value: touchPreventDefault })

		act(() => {
			track.dispatchEvent(event)
			track.dispatchEvent(touchEvent)
			ref.current?.delayHiddenScrollBar()
			vi.advanceTimersByTime(100)
		})

		expect(preventDefault).toHaveBeenCalled()
		expect(touchPreventDefault).toHaveBeenCalled()
		vi.useRealTimers()
	})

	it("scrolls when dragging the vertical thumb", () => {
		vi.useFakeTimers()
		const onScroll = vi.fn()
		const onStartMove = vi.fn()
		const onStopMove = vi.fn()
		const { getByTestId } = render(
			<InternalScrollBar
				orientation="vertical"
				prefixCls="scroll-bar"
				scrollState={baseScrollState}
				containerSize={100}
				scrollRange={1000}
				thumbSize={{ width: 6, height: 25 }}
				autoHideTimeout={1000}
				renderTrack={renderTrack}
				renderThumb={renderThumb}
				onScroll={onScroll}
				onStartMove={onStartMove}
				onStopMove={onStopMove}
			/>
		)
		const thumb = getByTestId("thumb")
		const mouseDown = new MouseEvent("mousedown", { bubbles: true })
		Object.defineProperty(mouseDown, "pageY", { value: 0 })
		const mouseMove = new MouseEvent("mousemove", { bubbles: true })
		Object.defineProperty(mouseMove, "pageY", { value: 50 })

		act(() => {
			thumb.dispatchEvent(mouseDown)
		})
		act(() => {
			window.dispatchEvent(mouseMove)
			vi.advanceTimersByTime(20)
		})
		act(() => {
			fireEvent.mouseUp(window)
		})

		expect(onStartMove).toHaveBeenCalledTimes(1)
		expect(onScroll).toHaveBeenLastCalledWith(600)
		expect(onStopMove).toHaveBeenCalledTimes(1)
		vi.useRealTimers()
	})

	it("flushes the latest drag offset when the thumb is released before the next frame", () => {
		vi.useFakeTimers()
		const onScroll = vi.fn()
		const { getByTestId } = render(
			<InternalScrollBar
				orientation="vertical"
				prefixCls="scroll-bar"
				scrollState={baseScrollState}
				containerSize={100}
				scrollRange={1000}
				thumbSize={{ width: 6, height: 25 }}
				autoHideTimeout={1000}
				renderTrack={renderTrack}
				renderThumb={renderThumb}
				onScroll={onScroll}
			/>
		)
		const thumb = getByTestId("thumb")
		const mouseDown = new MouseEvent("mousedown", { bubbles: true })
		Object.defineProperty(mouseDown, "pageY", { value: 0 })
		const mouseMove = new MouseEvent("mousemove", { bubbles: true })
		Object.defineProperty(mouseMove, "pageY", { value: 50 })

		act(() => {
			thumb.dispatchEvent(mouseDown)
		})
		act(() => {
			window.dispatchEvent(mouseMove)
			fireEvent.mouseUp(window)
		})

		expect(onScroll).toHaveBeenLastCalledWith(600)
		vi.useRealTimers()
	})

	it("keeps drag output at zero when the thumb has no available track", () => {
		vi.useFakeTimers()
		const onScroll = vi.fn()
		const { getByTestId } = render(
			<InternalScrollBar
				orientation="vertical"
				prefixCls="scroll-bar"
				scrollState={baseScrollState}
				containerSize={100}
				scrollRange={1000}
				thumbSize={{ width: 6, height: 100 }}
				autoHideTimeout={1000}
				renderTrack={renderTrack}
				renderThumb={renderThumb}
				onScroll={onScroll}
			/>
		)
		const thumb = getByTestId("thumb")
		const mouseDown = new MouseEvent("mousedown", { bubbles: true })
		Object.defineProperty(mouseDown, "pageY", { value: 0 })
		const mouseMove = new MouseEvent("mousemove", { bubbles: true })
		Object.defineProperty(mouseMove, "pageY", { value: 50 })

		act(() => {
			thumb.dispatchEvent(mouseDown)
		})
		act(() => {
			window.dispatchEvent(mouseMove)
			vi.advanceTimersByTime(20)
		})

		expect(onScroll).toHaveBeenLastCalledWith(0)
		vi.useRealTimers()
	})
})

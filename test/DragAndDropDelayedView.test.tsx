import { act, render } from "@testing-library/react"
import React from "react"
import { describe, expect, it, vi } from "vitest"

const sortableCreate = vi.hoisted(() => vi.fn(() => ({destroy: vi.fn()})))

vi.mock("sortablejs", () => ({
	default: {
		create: sortableCreate
	}
}))

vi.mock("../src", async () => {
	const ReactModule = await import("react")

	function DeferredVirtualScrollBar({
		renderItem,
		renderView,
		onItemsRendered
	}: {
		renderItem?: (index: number) => React.ReactElement
		renderView?: (props: React.HTMLProps<HTMLDivElement>) => React.ReactElement
		onItemsRendered?: (info: {
			startIndex: number
			endIndex: number
			visibleStartIndex: number
			visibleEndIndex: number
		}) => void
	}) {
		const [ready, setReady] = ReactModule.useState(false)

		ReactModule.useEffect(() => {
			onItemsRendered?.({
				startIndex: 0,
				endIndex: 1,
				visibleStartIndex: 0,
				visibleEndIndex: 1
			})
			setReady(true)
		}, [onItemsRendered])

		if (!ready || !renderView || !renderItem) {
			return <div data-testid="deferred-virtual-view"/>
		}

		return ReactModule.cloneElement(
			renderView({
				className: "scroll-bar-wrapper"
			}),
			{},
			<>
				{renderItem(0)}
				{renderItem(1)}
			</>
		)
	}

	return {
		default: DeferredVirtualScrollBar
	}
})

describe("DragAndDrop deferred virtual view", () => {
	it("initializes Sortable when the virtual wrapper attaches after the parent layout effect", async () => {
		sortableCreate.mockClear()
		const { default: DragAndDrop } = await import("../site/examplex/DragAndDrop/DragAndDrop")

		await act(async () => {
			render(<DragAndDrop/>)
		})

		expect(sortableCreate).toHaveBeenCalledTimes(1)
		const calls = sortableCreate.mock.calls as unknown as Array<[HTMLElement]>
		expect(calls[0]?.[0].className).toBe("scroll-bar-wrapper")
	})
})

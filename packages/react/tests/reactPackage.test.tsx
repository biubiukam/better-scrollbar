import React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ReactScrollBar, {
	ScrollBar,
	getStickyIndicesFromGroups,
	type VirtualScrollBarRef
} from "@better-scrollbar/react"

describe("@better-scrollbar/react", () => {
	it("exports the React ScrollBar component and public helpers", () => {
		expect(ReactScrollBar).toBe(ScrollBar)
		expect(getStickyIndicesFromGroups([2, 1])).toEqual([0, 3])

		const ref = React.createRef<VirtualScrollBarRef>()
		const { container } = render(
			<ScrollBar ref={ref} height={120} width={200}>
				<div style={{ height: 30 }}>Row 1</div>
				<div style={{ height: 30 }}>Row 2</div>
			</ScrollBar>
		)

		expect(container.querySelector(".scroll-bar-outer-container")).not.toBeNull()
		expect(ref.current?.getScrollState().clientHeight).toBe(120)
	})
})

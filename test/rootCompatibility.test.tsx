import { describe, expect, it } from "vitest"
import RootDefault, { ScrollBar as RootScrollBar } from "../src"
import {
	ScrollBar as RootScrollBarFile,
	default as RootScrollBarFileDefault
} from "../src/ScrollBar"
import HorizontalScrollBar from "../src/components/HorizontalScrollBar"
import VerticalScrollBar from "../src/components/VerticalScrollBar"
import rootRaf from "../src/raf"
import { getSpinSize } from "../src/scrollUtil"
import { getStickyIndicesFromGroups } from "../src/stickyUtils"
import useResizeObserver from "../src/hooks/useResizeObserver"
import { ScrollBar as ReactScrollBar } from "@better-scrollbar/react"

describe("better-scrollbar compatibility wrappers", () => {
	it("re-exports React package APIs from the root package source", () => {
		expect(RootDefault).toBe(ReactScrollBar)
		expect(RootScrollBar).toBe(ReactScrollBar)
		expect(RootScrollBarFile).toBe(ReactScrollBar)
		expect(RootScrollBarFileDefault).toBe(ReactScrollBar)
		expect(typeof HorizontalScrollBar).toBe("object")
		expect(typeof VerticalScrollBar).toBe("object")
		expect(typeof rootRaf).toBe("function")
		expect(typeof useResizeObserver).toBe("function")
		expect(getSpinSize(100, 400)).toBe(25)
		expect(getStickyIndicesFromGroups([1, 2])).toEqual([0, 2])
	})
})

import { useCallback, useEffect, useRef, useState } from "react"
import type { ItemsRenderedInfo, ScrollState } from "../../src"

export const MILLION_ROW_COUNT = 50_000_000
export const FIXED_MILLION_ROW_HEIGHT = 36
export const ESTIMATED_MILLION_ROW_HEIGHT = 40
export const PROGRESS_SCALE = 10_000

export const INITIAL_ITEMS_RENDERED: ItemsRenderedInfo = {
	startIndex: 0,
	endIndex: -1,
	visibleStartIndex: 0,
	visibleEndIndex: -1
}

export const MILLION_JUMP_POINTS = [
	{label: "起点", ratio: 0},
	{label: "25%", ratio: 0.25},
	{label: "中段", ratio: 0.5},
	{label: "75%", ratio: 0.75},
	{label: "末尾", ratio: 1},
]

export function createInitialScrollState(): ScrollState {
	return {
		x: 0,
		y: 0,
		isScrolling: false,
		scrollHeight: 0,
		scrollWidth: 0,
		clientWidth: 0,
		clientHeight: 0
	}
}

export function getFixedMillionRowHeight() {
	return FIXED_MILLION_ROW_HEIGHT
}

export function getMillionRowHeight(index: number) {
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

export function getMillionRowTone(index: number) {
	if (index % 36 === 0) {
		return "alert"
	}
	if (index % 11 === 0) {
		return "focus"
	}
	if (index % 5 === 0) {
		return "warm"
	}
	return "plain"
}

export function getMillionRowStatus(index: number) {
	if (index % 36 === 0) {
		return "Priority"
	}
	if (index % 11 === 0) {
		return "Review"
	}
	if (index % 5 === 0) {
		return "Batch"
	}
	return "Ready"
}

export function getMaxScrollOffset(scrollHeight: number, clientHeight: number) {
	return Math.max(scrollHeight - clientHeight, 0)
}

export function getJumpOffset(scrollHeight: number, clientHeight: number, ratio: number) {
	const boundedRatio = Math.min(Math.max(ratio, 0), 1)
	return Math.round(getMaxScrollOffset(scrollHeight, clientHeight) * boundedRatio)
}

export function getOffsetFromProgress(progress: number, scrollHeight: number, clientHeight: number) {
	const boundedProgress = Math.min(Math.max(progress, 0), PROGRESS_SCALE)
	return Math.round(getMaxScrollOffset(scrollHeight, clientHeight) * (boundedProgress / PROGRESS_SCALE))
}

export function getProgressValue(scrollOffset: number, scrollHeight: number, clientHeight: number) {
	const maxScrollOffset = getMaxScrollOffset(scrollHeight, clientHeight)
	if (maxScrollOffset === 0) {
		return 0
	}

	return Math.round((Math.min(Math.max(scrollOffset, 0), maxScrollOffset) / maxScrollOffset) * PROGRESS_SCALE)
}

export function getScrollProgressRatio(scrollOffset: number, scrollHeight: number, clientHeight: number) {
	const maxScrollOffset = getMaxScrollOffset(scrollHeight, clientHeight)
	if (maxScrollOffset === 0) {
		return 0
	}

	return Math.min(Math.max(scrollOffset, 0), maxScrollOffset) / maxScrollOffset
}

export function getToneChannel(scrollState: ScrollState) {
	return Math.round(getScrollProgressRatio(scrollState.y, scrollState.scrollHeight, scrollState.clientHeight) * 255)
}

export function getRenderedCount(range: Pick<ItemsRenderedInfo, "startIndex" | "endIndex">) {
	if (range.endIndex < range.startIndex) {
		return 0
	}

	return range.endIndex - range.startIndex + 1
}

export function formatVirtualRange(range: Pick<ItemsRenderedInfo, "startIndex" | "endIndex">) {
	if (range.endIndex < range.startIndex) {
		return "-"
	}

	return `${ range.startIndex.toLocaleString() } - ${ range.endIndex.toLocaleString() }`
}

export function useRafScrollState() {
	const [scrollState, setScrollState] = useState<ScrollState>(createInitialScrollState)
	const frameRef = useRef<number>()
	const pendingStateRef = useRef<ScrollState>()

	const scheduleScrollState = useCallback((nextState: ScrollState) => {
		pendingStateRef.current = nextState
		if (frameRef.current !== undefined) {
			return
		}

		frameRef.current = requestAnimationFrame(() => {
			frameRef.current = undefined
			if (pendingStateRef.current) {
				setScrollState(pendingStateRef.current)
			}
		})
	}, [])

	useEffect(() => {
		return () => {
			if (frameRef.current !== undefined) {
				cancelAnimationFrame(frameRef.current)
			}
		}
	}, [])

	return [scrollState, scheduleScrollState] as const
}

export function useFpsSample() {
	const [fps, setFps] = useState(0)

	useEffect(() => {
		let animationFrame = 0
		let frameCount = 0
		let lastTime = performance.now()

		const tick = (now: number) => {
			frameCount += 1
			if (now - lastTime >= 500) {
				setFps(Math.round((frameCount * 1000) / (now - lastTime)))
				frameCount = 0
				lastTime = now
			}
			animationFrame = requestAnimationFrame(tick)
		}

		animationFrame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(animationFrame)
	}, [])

	return fps
}

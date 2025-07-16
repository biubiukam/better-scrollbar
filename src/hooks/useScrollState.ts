import { useCallback, useRef } from "react"
import { useImmer } from "use-immer"
import { ScrollState } from "../types"
import raf from "../raf"

export const useScrollState = (isUnmountedRef: React.MutableRefObject<boolean>) => {
	const [scrollState, setScrollState] = useImmer<ScrollState>({
		x: 0,
		y: 0,
		scrollHeight: 0,
		scrollWidth: 0,
		clientHeight: 0,
		clientWidth: 0,
		isScrolling: false
	})

	const detectScrollingInterval = useRef<ReturnType<typeof setTimeout>>()
	const wheelingRaf = useRef<number>(-1)

	const cleanupTimersAndRaf = useCallback(() => {
		if (detectScrollingInterval.current) {
			clearTimeout(detectScrollingInterval.current)
			detectScrollingInterval.current = undefined
		}
		if (wheelingRaf.current !== -1) {
			raf.cancel(wheelingRaf.current)
			wheelingRaf.current = -1
		}
	}, [])

	const delayScrollStateChange = useCallback(() => {
		if (isUnmountedRef.current) return

		if (detectScrollingInterval.current) {
			clearTimeout(detectScrollingInterval.current)
		}

		detectScrollingInterval.current = setTimeout(() => {
			if (isUnmountedRef.current) return

			setScrollState((preScrollState) => {
				preScrollState.isScrolling = false
			})
		}, 200)
	}, [setScrollState, isUnmountedRef])

	const onUpdateScrollState = useCallback(
		(
			scrollTop: number | ((preScrollTop: number) => number),
			viewContainerRef?: React.MutableRefObject<HTMLDivElement>
		) => {
			if (isUnmountedRef.current) return

			setScrollState((preScrollState) => {
				if (typeof scrollTop === "function") {
					preScrollState.y = scrollTop(preScrollState.y)
				} else {
					preScrollState.y = scrollTop
				}
				preScrollState.isScrolling = true
				if (viewContainerRef?.current) {
					viewContainerRef.current.scrollTop = preScrollState.y
				}
			})

			delayScrollStateChange()
		},
		[setScrollState, delayScrollStateChange, isUnmountedRef]
	)

	return {
		scrollState,
		setScrollState,
		onUpdateScrollState,
		cleanupTimersAndRaf,
		wheelingRaf
	}
}

import { nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from "vue"
import type { Ref } from "vue"
import type { UseResizeObserverSize } from "../types"

function readElementSize(element: HTMLElement | null): UseResizeObserverSize {
	if (!element) {
		return { width: 0, height: 0 }
	}

	return {
		width: element.clientWidth,
		height: element.clientHeight
	}
}

export function useResizeObserver(target: Ref<HTMLElement | null>) {
	const size = ref<UseResizeObserverSize>({ width: 0, height: 0 })
	let observer: ResizeObserver | null = null

	const updateSize = () => {
		size.value = readElementSize(unref(target))
	}

	const stopObserver = () => {
		observer?.disconnect()
		observer = null
		window.removeEventListener("resize", updateSize)
	}

	const startObserver = () => {
		stopObserver()
		const element = unref(target)
		if (!element) {
			updateSize()
			return
		}

		updateSize()
		window.addEventListener("resize", updateSize)
		if (typeof ResizeObserver !== "undefined") {
			observer = new ResizeObserver(updateSize)
			observer.observe(element)
		}
	}

	onMounted(() => {
		void nextTick(startObserver)
	})

	watch(target, () => {
		void nextTick(startObserver)
	})

	onBeforeUnmount(stopObserver)

	return {
		size,
		updateSize,
		stopObserver,
		startObserver
	}
}

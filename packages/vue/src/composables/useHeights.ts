import { computed, shallowRef, triggerRef, watch } from "vue"
import { createVirtualHeightIndexStore, type VirtualHeightIndexStore } from "@better-scrollbar/core"
import type { UseHeightsOptions } from "../types"
import { resolveNumber, resolveValue } from "./value"

const DEFAULT_HEIGHT_CACHE_LIMIT = 50_000

function createHeightIndex(options: UseHeightsOptions): VirtualHeightIndexStore {
	return createVirtualHeightIndexStore({
		itemCount: Math.max(Math.floor(resolveValue(options.itemCount)), 0),
		estimatedItemHeight: Math.max(resolveValue(options.estimatedItemHeight), 1),
		maxMeasuredItems: resolveNumber(options.heightCacheLimit, DEFAULT_HEIGHT_CACHE_LIMIT)
	})
}

export function useHeights(options: UseHeightsOptions) {
	const heightIndex = shallowRef(createHeightIndex(options))
	const measuredVersion = shallowRef(0)

	const reset = () => {
		heightIndex.value = createHeightIndex(options)
		measuredVersion.value += 1
	}

	watch(
		() => [
			resolveValue(options.itemCount),
			resolveValue(options.estimatedItemHeight),
			resolveValue(options.heightCacheLimit)
		],
		reset
	)

	const setMeasuredHeight = (index: number, height: number) => {
		heightIndex.value.setMeasuredHeight(index, height)
		measuredVersion.value += 1
		triggerRef(heightIndex)
	}

	const deleteMeasuredHeight = (index: number) => {
		heightIndex.value.deleteMeasuredHeight(index)
		measuredVersion.value += 1
		triggerRef(heightIndex)
	}

	const measureElement = (index: number, element: HTMLElement | null) => {
		if (!element) {
			deleteMeasuredHeight(index)
			return
		}

		const height = element.offsetHeight || element.getBoundingClientRect().height
		setMeasuredHeight(index, height)
	}

	const totalHeight = computed(() => {
		void measuredVersion.value
		return heightIndex.value.totalHeight
	})

	return {
		heightIndex,
		totalHeight,
		measuredVersion,
		setMeasuredHeight,
		deleteMeasuredHeight,
		measureElement,
		reset
	}
}

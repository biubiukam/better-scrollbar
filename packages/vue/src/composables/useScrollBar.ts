import { computed, ref, shallowRef, watch } from "vue"
import {
	createVirtualHeightIndexStore,
	getSafeMaxRenderedItems,
	resolveOverscanConfig,
	type ScrollState
} from "@better-scrollbar/core"
import type { UseScrollBarOptions } from "../types"
import { resolveNumber, resolveValue } from "./value"

const DEFAULT_MAX_RENDERED_ITEMS = 500

function getOverscanItems(overscan: UseScrollBarOptions["overscan"]) {
	return resolveOverscanConfig(resolveValue(overscan) ?? 1).items
}

export function useScrollBar(options: UseScrollBarOptions) {
	const heightIndex = shallowRef(
		createVirtualHeightIndexStore({
			itemCount: Math.max(Math.floor(resolveValue(options.itemCount)), 0),
			estimatedItemHeight: Math.max(resolveNumber(options.estimatedItemHeight, 20), 1)
		})
	)
	const scrollState = ref<ScrollState>({
		x: 0,
		y: 0,
		scrollWidth: resolveNumber(options.width, 0),
		scrollHeight: heightIndex.value.totalHeight,
		clientWidth: resolveNumber(options.width, 0),
		clientHeight: Math.max(resolveNumber(options.height, 0), 0),
		isScrolling: false
	})

	const resetHeightIndex = () => {
		heightIndex.value = createVirtualHeightIndexStore({
			itemCount: Math.max(Math.floor(resolveValue(options.itemCount)), 0),
			estimatedItemHeight: Math.max(resolveNumber(options.estimatedItemHeight, 20), 1)
		})
		scrollState.value.scrollHeight = heightIndex.value.totalHeight
		scrollState.value.clientHeight = Math.max(resolveNumber(options.height, 0), 0)
		scrollState.value.clientWidth = resolveNumber(options.width, 0)
		scrollState.value.scrollWidth = resolveNumber(options.width, 0)
	}

	watch(
		() => [
			resolveValue(options.itemCount),
			resolveValue(options.estimatedItemHeight),
			resolveValue(options.height),
			resolveValue(options.width)
		],
		resetHeightIndex
	)

	const range = computed(() =>
		heightIndex.value.getRange({
			scrollOffset: scrollState.value.y,
			viewportSize: Math.max(resolveNumber(options.height, 0), 0),
			overscan: getOverscanItems(options.overscan),
			maxItems: getSafeMaxRenderedItems(
				resolveNumber(options.maxRenderedItems, DEFAULT_MAX_RENDERED_ITEMS)
			)
		})
	)

	const visibleItems = computed(() => {
		const items: number[] = []
		for (let index = range.value.start; index <= range.value.end; index += 1) {
			items.push(index)
		}
		return items
	})

	const scrollTo = (offset: Partial<Pick<ScrollState, "x" | "y">>) => {
		const maxY = Math.max(
			heightIndex.value.totalHeight - Math.max(resolveNumber(options.height, 0), 0),
			0
		)
		const nextX = offset.x ?? scrollState.value.x
		const nextY = Math.min(Math.max(offset.y ?? scrollState.value.y, 0), maxY)
		scrollState.value = {
			...scrollState.value,
			x: nextX,
			y: nextY,
			scrollHeight: heightIndex.value.totalHeight,
			clientHeight: Math.max(resolveNumber(options.height, 0), 0),
			clientWidth: resolveNumber(options.width, 0),
			scrollWidth: resolveNumber(options.width, 0),
			isScrolling: true
		}
	}

	const handleScroll = (event: Event) => {
		const target = event.currentTarget as HTMLElement | null
		scrollTo({
			x: target?.scrollLeft ?? 0,
			y: target?.scrollTop ?? 0
		})
	}

	const getScrollState = () => scrollState.value

	return {
		heightIndex,
		scrollState,
		range,
		visibleItems,
		scrollTo,
		handleScroll,
		getScrollState
	}
}

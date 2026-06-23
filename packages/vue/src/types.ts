import type {
	ItemsRenderedInfo,
	OverscanConfig,
	ScrollOffset,
	ScrollState,
	VirtualHeightIndexStore
} from "@better-scrollbar/core"
import type { ComputedRef, Ref } from "vue"

export type MaybeRef<T> = T | Ref<T>

export interface BScrollBarProps {
	itemCount: number
	estimatedItemHeight?: number
	height: number
	width?: number
	overscan?: number | OverscanConfig
	maxRenderedItems?: number
	prefixCls?: string
}

export interface UseScrollBarOptions {
	itemCount: MaybeRef<number>
	estimatedItemHeight?: MaybeRef<number>
	height: MaybeRef<number>
	width?: MaybeRef<number | undefined>
	overscan?: MaybeRef<number | OverscanConfig | undefined>
	maxRenderedItems?: MaybeRef<number | undefined>
}

export interface UseScrollBarReturn {
	heightIndex: Ref<VirtualHeightIndexStore>
	scrollState: Ref<ScrollState>
	range: ComputedRef<{
		scrollHeight: number
		start: number
		end: number
		visibleStartIndex: number
		visibleEndIndex: number
		offset: number
	}>
	visibleItems: ComputedRef<number[]>
	scrollTo: (offset: Partial<ScrollOffset>) => void
	handleScroll: (event: Event) => void
	getScrollState: () => ScrollState
}

export interface UseHeightsOptions {
	itemCount: MaybeRef<number>
	estimatedItemHeight: MaybeRef<number>
	heightCacheLimit?: MaybeRef<number | undefined>
}

export interface UseResizeObserverSize {
	width: number
	height: number
}

export interface BScrollBarExposed {
	scrollTo: (offset: Partial<ScrollOffset>) => void
	getScrollState: () => ScrollState
}

export type { ItemsRenderedInfo, OverscanConfig, ScrollOffset, ScrollState }

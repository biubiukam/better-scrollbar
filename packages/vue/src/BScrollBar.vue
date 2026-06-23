<template>
	<div :class="`${prefixCls}-outer-container`" :style="outerStyle">
		<div :class="`${prefixCls}-inner-container`" @scroll="onNativeScroll">
			<div :class="`${prefixCls}-wrapper`" :style="wrapperStyle">
				<BScrollBarItem
					v-for="index in visibleItems"
					:key="index"
					:index="index"
					:style="getItemStyle(index)"
				>
					<slot :index="index">
						{{ index }}
					</slot>
				</BScrollBarItem>
			</div>
		</div>
		<VerticalScrollBar
			:prefix-cls="prefixCls"
			:scroll-state="scrollState"
			:container-size="height"
			:scroll-range="scrollState.scrollHeight"
		/>
		<HorizontalScrollBar
			:prefix-cls="prefixCls"
			:scroll-state="scrollState"
			:container-size="resolvedWidth"
			:scroll-range="scrollState.scrollWidth"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue"
import type { CSSProperties } from "vue"
import type { BScrollBarExposed, BScrollBarProps, ScrollState } from "./types"
import BScrollBarItem from "./BScrollBarItem.vue"
import HorizontalScrollBar from "./components/HorizontalScrollBar.vue"
import VerticalScrollBar from "./components/VerticalScrollBar.vue"
import { useScrollBar } from "./composables/useScrollBar"

defineOptions({
	name: "BScrollBar"
})

const props = withDefaults(defineProps<BScrollBarProps>(), {
	estimatedItemHeight: 20,
	maxRenderedItems: 500,
	prefixCls: "scroll-bar",
	width: undefined
})

const emit = defineEmits<{
	scroll: [state: ScrollState]
	scrollStart: []
	scrollEnd: []
	itemsRendered: [
		info: {
			startIndex: number
			endIndex: number
			visibleStartIndex: number
			visibleEndIndex: number
		}
	]
}>()

const scrollBar = useScrollBar({
	itemCount: toRef(props, "itemCount"),
	estimatedItemHeight: toRef(props, "estimatedItemHeight"),
	height: toRef(props, "height"),
	width: toRef(props, "width"),
	overscan: toRef(props, "overscan"),
	maxRenderedItems: toRef(props, "maxRenderedItems")
})
const { heightIndex, scrollState, range, visibleItems, scrollTo, handleScroll, getScrollState } =
	scrollBar

const prefixCls = computed(() => props.prefixCls)
const resolvedWidth = computed(() => props.width ?? 0)
const outerStyle = computed<CSSProperties>(() => ({
	height: `${props.height}px`,
	width: props.width === undefined ? "100%" : `${props.width}px`
}))
const wrapperStyle = computed<CSSProperties>(() => ({
	height: `${scrollState.value.scrollHeight}px`
}))

const getItemStyle = (index: number): CSSProperties => ({
	position: "absolute",
	top: 0,
	left: 0,
	width: "100%",
	transform: `translateY(${heightIndex.value.getOffset(index)}px)`
})

const onNativeScroll = (event: Event) => {
	const wasIdle = !scrollState.value.isScrolling
	if (wasIdle) {
		emit("scrollStart")
	}

	handleScroll(event)
	emit("scroll", getScrollState())
	emit("itemsRendered", {
		startIndex: range.value.start,
		endIndex: range.value.end,
		visibleStartIndex: range.value.visibleStartIndex,
		visibleEndIndex: range.value.visibleEndIndex
	})
	emit("scrollEnd")
}

defineExpose<BScrollBarExposed>({
	scrollTo,
	getScrollState
})
</script>

<template>
	<ScrollBarTrack
		orientation="horizontal"
		:prefix-cls="prefixCls"
		:thumb-size="thumbSize"
		:thumb-offset="thumbOffset"
	/>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { getSpinSize, type ScrollState } from "@better-scrollbar/core"
import ScrollBarTrack from "./ScrollBarTrack.vue"

const props = defineProps<{
	prefixCls: string
	scrollState: ScrollState
	containerSize: number
	scrollRange: number
}>()

const thumbSize = computed(() => getSpinSize(props.containerSize, props.scrollRange))
const thumbOffset = computed(() => {
	const movableRange = Math.max(props.containerSize - thumbSize.value, 0)
	const scrollableRange = Math.max(props.scrollRange - props.containerSize, 0)
	if (scrollableRange === 0) {
		return 0
	}

	return (props.scrollState.x / scrollableRange) * movableRange
})
</script>

<template>
	<div :class="trackClass">
		<div :class="thumbClass" :style="thumbStyle" />
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
	orientation: "vertical" | "horizontal"
	prefixCls: string
	thumbSize: number
	thumbOffset: number
}>()

const trackClass = computed(() => `${props.prefixCls}-${props.orientation}-track`)
const thumbClass = computed(() => `${props.prefixCls}-${props.orientation}-thumb`)
const thumbStyle = computed(() =>
	props.orientation === "vertical"
		? {
				height: `${props.thumbSize}px`,
				transform: `translateY(${props.thumbOffset}px)`
			}
		: {
				width: `${props.thumbSize}px`,
				transform: `translateX(${props.thumbOffset}px)`
			}
)
</script>

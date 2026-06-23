<template>
	<div class="scroll-bar-item" :data-index="index">
		<slot :index="index" />
	</div>
</template>

<script setup lang="ts">
defineOptions({
	name: "BScrollBarItem"
})

defineProps<{
	index: number
}>()
</script>

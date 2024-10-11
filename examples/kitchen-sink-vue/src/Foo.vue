<script setup lang="ts">
const {foo = 123} = defineProps<{
	foo: number
}>()
</script>

<template>
	<div aria-atomic="false">value: {{ foo }}</div>
</template>

<style scoped>
div {
	border: 1px solid red;
	background: pink;
	height: 100px;
}
</style>

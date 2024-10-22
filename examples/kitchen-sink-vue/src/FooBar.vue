<script setup lang="ts">
const {foo = 123} = defineProps<{
	foo: number
}>()
</script>

<template>
	<div aria-atomic="false">value: {{ foo }}</div>
</template>

<style scoped></style>

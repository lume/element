<script setup lang="ts">
import './KitchenSink.js'
import {useTemplateRef} from 'vue'

const sink = useTemplateRef('sink')
sink.value!.foo
</script>

<template>
	<!-- There should be a type error here: -->
	<kitchen-sink ref="sink" :foo="true"></kitchen-sink>
</template>

<style scoped>
kitchen-sink#sink {
	cursor: pointer;
	user-select: none;
}
</style>

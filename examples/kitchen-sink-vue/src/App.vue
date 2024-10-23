<script setup lang="ts">
import './KitchenSink.js'
import {useTemplateRef} from 'vue'

const sink = useTemplateRef('sink')

sink.value!.someMethod()
sink.value!.foo = 123
</script>

<template>
	<!-- There should be no type errors: -->
	<kitchen-sink ref="sink" :foo="123" :bar="true"></kitchen-sink>

	<!-- There should be type errors: -->
	<kitchen-sink ref="sink" :foo="true" :bar="123"></kitchen-sink>
</template>

<style scoped></style>

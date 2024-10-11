<script setup lang="ts">
import {useTemplateRef, onMounted} from 'vue'
import {createEffect} from 'solid-js'
import './KitchenSink.js'
import './Foo.ce.js'

const sink = useTemplateRef('sink')
const sink2 = useTemplateRef('sink2')

onMounted(() => {
	createEffect(() => {
		console.log('values outside the element:', sink.value!.count, sink.value!.name, sink.value!.doingSomething)
	})

	// Event listeners can be set on 'on*' event properties directly, as
	// with builtin events, as an alternative to `.addEventListener()`.
	sink2.value!.onawesomeness = event => {
		console.log('more awesomeness happened!', event.type)
	}
})
</script>

<template>
	<!-- Start with an initial value of 5 -->
	<kitchen-sink
		ref="sink"
		id="sink"
		count="5"
		name="Mo"
		doingSomething
		@click="
			() => {
				sink!.count++
				sink!.name += 'Mo'
				// Get or set attributes (dash-case)
				sink!.setAttribute(
					'doing-something',
					// Or get or set the same-name properties (camelCase)
					sink!.doingSomething ? 'false' : 'true',
				)
				console.log('doingSomething after attribute change:', sink!.doingSomething)
			}
		"
		@awesomeness="
			event => {
				console.log('awesomeness happened!', event.type)
			}
		"
		onawesomeness="console.log('this works too!')"
	></kitchen-sink>

	<kitchen-sink
		ref="sink2"
		id="sink2"
		count="1"
		name="Po"
		doingSomething="false"
		color="blue"
		@awesomeness="console.log('And this also works!')"
	>
		<p>child from light DOM, no slot specified</p>
		<p slot="foo">child from light DOM, slotted to the foo slot</p>
	</kitchen-sink>
</template>

<style scoped>
kitchen-sink#sink {
	cursor: pointer;
	user-select: none;
}
</style>

<script setup lang="ts">
import {useTemplateRef, onMounted} from 'vue'
import {createEffect} from 'solid-js'
import './KitchenSink.js'

const sink = useTemplateRef('sink')
const sink2 = useTemplateRef('sink2')

onMounted(() => {
	createEffect(() => {
		// console.log('values outside the element:', sink.value!.count, sink.value!.name, sink.value!.doingSomething)
	})

	// Event listeners can be set on 'on*' event properties directly, as
	// with builtin events, as an alternative to `.addEventListener()`.
	// sink2.value!.onawesomeness = event => {
	// 	console.log('more awesomeness happened!', event.type)
	// }
})

import {FooBar} from './FooBar.ce.js'
</script>

<template>
	<!-- Start with an initial value of 5 -->
	<kitchen-sink
		ref="sink"
		id="sink"
		count="5"
		name="Mo"
		doingSomething
		aria-atomic="false"
		@click="
			() => {
				// sink!.count++
				// sink!.name += 'Mo'
				// // Get or set attributes (dash-case)
				// sink!.setAttribute(
				// 	'doing-something',
				// 	// Or get or set the same-name properties (camelCase)
				// 	sink!.doingSomething ? 'false' : 'true',
				// )
				// console.log('doingSomething after attribute change:', sink!.doingSomething)
			}
		"
		@awesomeness="
			(event: Event) => {
				// The 'on*' event properties are also available in JSX or `html` templates.
				console.log('awesomeness happened!', event.type)
			}
		"
	></kitchen-sink>

	<kitchen-sink ref="sink2" id="sink2" count="1" name="Po" doingSomething="false" color="blue">
		<p>child from light DOM, no slot specified</p>
		<p slot="foo">child from light DOM, slotted to the foo slot</p>
	</kitchen-sink>

	<foo-bar :foo="true" />

	<divv :blah="123"></divv>

	<!-- <kitchen-sink :count="123" :foo="true"></kitchen-sink> -->

	<kitchen-sink :count="true"></kitchen-sink>
</template>

<style scoped>
kitchen-sink#sink {
	cursor: pointer;
	user-select: none;
}
</style>

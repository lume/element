<script setup lang="ts">
import './KitchenSink.js'
import {useTemplateRef} from 'vue'

const sink = useTemplateRef('sink')

// Ref works as expected:
sink.value!.someMethod()
sink.value!.foo = 123

// Unfortunately, these properties are unnecessarily exposed on the element ref.
// We marked them deprecated to prevent users from using them:
sink.value!.$props
sink.value!.$emit
</script>

<template>
	<!-- There should be no type errors: -->
	<kitchen-sink ref="sink" key="123" :foo="123" :bar="true"></kitchen-sink>

	<!-- no error (all props optional) -->
	<kitchen-sink></kitchen-sink>

	<!-- @vue-expect-error boolean not assignable to number -->
	<kitchen-sink :foo="true"></kitchen-sink>
	<!-- @vue-expect-error number not assignable to boolean -->
	<kitchen-sink :bar="123"></kitchen-sink>

	<!-- The 'some-event' event type is known: -->
	<kitchen-sink
		@some-event="
			event => {
				const n: number = event.foo // ok
				// @ts-expect-error number is not assignable to string
				const s: string = event.foo // error
			}
		"
	></kitchen-sink>

	<!-- @vue-expect-error built-in attributes are type checked -->
	<kitchen-sink spellcheck="123"></kitchen-sink>

	<!-- @vue-expect-error technically .attr should accept strings because it is
	setting an attribute, but the types are limited in this regard: the type is
	the same regardless if .attr or .prop is used. -->
	<kitchen-sink :foo.attr="'123'"></kitchen-sink>
</template>

<style scoped></style>

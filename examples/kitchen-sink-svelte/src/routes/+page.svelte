<script lang="ts">
	import '$lib/KitchenSink'
	import type { KitchenSink } from '$lib/KitchenSink'
	import { onMount } from 'svelte'

	let sink: KitchenSink
	let sink2: KitchenSink

	onMount(() => {
		$effect(() => {
			console.log('values outside the element:', sink.count, sink.name, sink.doingSomething)
		})

		// Event listeners can be set on 'on*' event properties directly, as
		// with builtin events, as an alternative to `.addEventListener()`.
		sink2.onawesomeness = event => {
			console.log('more awesomeness happened!', event.type)
		}
	})
</script>

<!-- Start with an initial value of 5 -->
<!-- svelte-ignore a11y_no_static_element_interactions (typically you should not use these svelte-ignore comments, but for sake of example to show that type definitions work we're skipping the accessibility warnings) -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<kitchen-sink
	bind:this={sink}
	id="sink"
	count="5"
	name="Mo"
	doingSomething
	onclick={e => {
		sink.count++
		sink.name += 'Mo'
		// Get or set attributes (dash-case)
		sink.setAttribute(
			'doing-something',
			// Or get or set the same-name properties (camelCase)
			sink.doingSomething ? 'false' : 'true',
		)
		console.log('doingSomething after attribute change:', sink.doingSomething)
	}}
	onawesomeness={event => console.log('awesomeness happened!', event.type)}
></kitchen-sink>

<kitchen-sink bind:this={sink2} id="sink2" count={1} name="Po" doingSomething="false" color="blue">
	<p>child from light DOM, no slot specified</p>
	<p slot="foo">child from light DOM, slotted to the foo slot</p>
</kitchen-sink>

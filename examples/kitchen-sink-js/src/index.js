import {createEffect} from 'solid-js'
import html from 'solid-js/html'
import './KitchenSink.js'

document.body.append(
	...html`
		<!-- Start with an initial value of 5 -->
		<kitchen-sink
			id="sink"
			count="5"
			name="Mo"
			doing-something
			onclick=${() => {
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
			onawesomeness=${event => {
				// The 'on*' event properties are also available in JSX or `html` templates.
				console.log('awesomeness happened!', event.type)
			}}
		></kitchen-sink>

		<kitchen-sink id="sink2" count="1" name="Po" doing-something="false" color="blue">
			<p>child from light DOM, no slot specified</p>
			<p slot="foo">child from light DOM, slotted to the foo slot</p>
		</kitchen-sink>
	`,
)

createEffect(() => {
	console.log('values outside the element:', sink.count, sink.name, sink.doingSomething)
})

// Event listeners can be set on 'on*' event properties directly, as with builtin events.
sink2.onawesomeness = event => {
	console.log('more awesomeness happened!', event.type)
}

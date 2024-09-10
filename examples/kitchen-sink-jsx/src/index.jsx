import {createEffect} from 'solid-js'
import './KitchenSink.js'

document.body.append(
	...(
		<>
			{/* Start with an initial value of 5 */}
			<kitchen-sink
				id="sink"
				count="5"
				name="Mo"
				doing-something
				onclick={() => {
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
			></kitchen-sink>

			<kitchen-sink id="sink2" count="1" name="Po" doing-something="false" color="blue">
				<p>child from light DOM, no slot specified</p>
				<p slot="foo">child from light DOM, slotted to the foo slot</p>
			</kitchen-sink>
		</>
	),
)

createEffect(() => {
	console.log('values outside the element:', sink.count, sink.name, sink.doingSomething)
})

import * as React from 'react'
import {createEffect} from 'solid-js'
import './KitchenSink.js'
import {KitchenSink} from './KitchenSink.js'
import {render} from 'react-dom'
import {useEffect, useRef} from 'react'

function ReactApp() {
	let sink = useRef<KitchenSink>(null)
	let sink2 = useRef<KitchenSink>(null)

	// on mount
	useEffect(() => {
		createEffect(() => {
			console.log('values outside the element:', sink.current!.count, sink.current!.name, sink.current!.doingSomething)
		})

		// Event listeners can be set on 'on*' event properties directly, as
		// with builtin events, as an alternative to `.addEventListener()`.
		sink2.current!.onawesomeness = event => {
			console.log('more awesomeness happened!', event.type)
		}
	}, [])

	return (
		<>
			{/* Start with an initial value of 5 */}
			<kitchen-sink
				ref={sink}
				id="sink"
				count="5"
				name="Mo"
				doingSomething
				onClick={() => {
					sink.current!.count++
					sink.current!.name += 'Mo'
					// Get or set attributes (dash-case)
					sink.current!.setAttribute(
						'doing-something',
						// Or get or set the same-name properties (camelCase)
						sink.current!.doingSomething ? 'false' : 'true',
					)

					console.log('doingSomething after attribute change:', sink.current!.doingSomething)
				}}
				// This does not work in React 17 because it does not support
				// custom events, but it works in React 18 and up. Use a ref and
				// the `.on*` event properties as shown above or
				// `addEventListener()`.
				//
				onawesomeness={event => {
					// The 'on*' event properties are also available in JSX or `html` templates.
					console.log('awesomeness happened!', event.type)
				}}
			></kitchen-sink>

			<kitchen-sink ref={sink2} id="sink2" count="1" name="Po" doingSomething="false" color="blue">
				<p>child from light DOM, no slot specified</p>
				<p slot="foo">child from light DOM, slotted to the foo slot</p>
			</kitchen-sink>
		</>
	)
}

render(<ReactApp />, document.body)

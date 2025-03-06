import {Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, viewChild} from '@angular/core'
import {RouterOutlet} from '@angular/router'
import '../KitchenSink.js'
import {KitchenSink} from '../KitchenSink.js'
import {createEffect} from 'solid-js'

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: './app.component.html',
	styleUrl: './app.component.css',
})
export class AppComponent {
	title = 'kitch-sink-angular'

	@ViewChild('sink') sink!: ElementRef<KitchenSink>
	@ViewChild('sink2') sink2!: ElementRef<KitchenSink>

	ngAfterViewInit() {
		const sink = this.sink.nativeElement

		createEffect(() => {
			console.log('values outside the element:', sink.count, sink.name, sink.doingSomething)
		})

		const sink2 = this.sink2.nativeElement

		// Event listeners can be set on 'on*' event properties directly, as with builtin events.
		sink2.onawesomeness = event => {
			console.log('more awesomeness happened!', event.type)
		}
	}

	clickSink1(event: Event) {
		const sink = this.sink.nativeElement
		sink.count++
		sink.name += 'Mo'
		// Get or set attributes (dash-case)
		sink.setAttribute(
			'doing-something',
			// Or get or set the same-name properties (camelCase)
			sink.doingSomething ? 'false' : 'true',
		)
		console.log('doingSomething after attribute change:', sink.doingSomething)
	}

	onSink1Awesomeness(event: Event) {
		console.log('awesomeness happened!', event.type)
	}
}

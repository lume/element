import {element} from './element.js'
import {event} from './event.js'
import {Element} from './LumeElement.js'

describe('@event', () => {
	it.only('registers event listeners when assigned to event-named properties', () => {
		let testEvent: Event | null = null
		const ontestevent = (e: Event) => (testEvent = e)

		let otherEvent: Event | null = null
		const onotherevent = (e: Event) => (otherEvent = e)

		let anotherEvent: Event | null = null
		const onanother = (e: Event) => (anotherEvent = e)

		let yetanotherEvent: Event | null = null
		const onyetanother = (e: Event) => (yetanotherEvent = e)

		let onemoreEvent: Event | null = null
		const ononemore = (e: Event) => (onemoreEvent = e)

		let lastoneEvent: Event | null = null
		const onlastone = (e: Event) => (lastoneEvent = e)

		@element('event-listeners')
		class MyEl extends Element {
			@event accessor ontestevent = ontestevent

			@event accessor onotherevent: ((event: Event) => void) | null = null

			#onanother: EventListener | null = onanother

			@event get onanother() {
				return this.#onanother
			}
			@event set onanother(v: EventListener | null) {
				this.#onanother = v
			}

			#onyetanother: EventListener | null = null

			@event get onyetanother() {
				return this.#onyetanother
			}
			@event set onyetanother(v: EventListener | null) {
				this.#onyetanother = v
			}

			@event ononemore: EventListener | null = ononemore

			@event onlastone: EventListener | null = null

			override connectedCallback() {
				super.connectedCallback()

				this.dispatchEvent(new Event('testevent'))
				this.dispatchEvent(new Event('otherevent'))
				this.dispatchEvent(new Event('another'))
				this.dispatchEvent(new Event('yetanother'))
				this.dispatchEvent(new Event('onemore'))
				this.dispatchEvent(new Event('lastone'))
			}
		}

		const el = new MyEl()

		el.onotherevent = onotherevent
		el.onyetanother = onyetanother
		el.onlastone = onlastone

		document.body.append(el)

		expect(testEvent).toBeInstanceOf(Event)
		expect(otherEvent).toBeInstanceOf(Event)
		expect(String(anotherEvent)).toBe('null')
		expect(yetanotherEvent).toBeInstanceOf(Event)
		expect(onemoreEvent).toBeInstanceOf(Event)
		expect(lastoneEvent).toBeInstanceOf(Event)

		testEvent = null
		otherEvent = null
		anotherEvent = null
		yetanotherEvent = null
		onemoreEvent = null
		lastoneEvent = null

		el.dispatchEvent(new Event('testevent'))
		el.dispatchEvent(new Event('otherevent'))
		el.dispatchEvent(new Event('another'))
		el.dispatchEvent(new Event('yetanother'))
		el.dispatchEvent(new Event('onemore'))
		el.dispatchEvent(new Event('lastone'))

		expect(testEvent).toBeInstanceOf(Event)
		expect(otherEvent).toBeInstanceOf(Event)
		expect(String(anotherEvent)).toBe('null')
		expect(yetanotherEvent).toBeInstanceOf(Event)
		expect(onemoreEvent).toBeInstanceOf(Event)
		expect(lastoneEvent).toBeInstanceOf(Event)

		testEvent = null
		otherEvent = null
		anotherEvent = null
		yetanotherEvent = null
		onemoreEvent = null
		lastoneEvent = null

		let testEvent2: Event | null = null
		const ontestevent2 = (e: Event) => (testEvent2 = e)
		el.ontestevent = ontestevent2

		let otherEvent2: Event | null = null
		const onotherevent2 = (e: Event) => (otherEvent2 = e)
		el.onotherevent = onotherevent2

		let anotherEvent2: Event | null = null
		const onanother2 = (e: Event) => (anotherEvent2 = e)
		el.onanother = onanother2

		let yetanotherEvent2: Event | null = null
		const onyetanother2 = (e: Event) => (yetanotherEvent2 = e)
		el.onyetanother = onyetanother2

		let onemoreEvent2: Event | null = null
		const ononemore2 = (e: Event) => (onemoreEvent2 = e)
		el.ononemore = ononemore2

		let lastoneEvent2: Event | null = null
		const onlastone2 = (e: Event) => (lastoneEvent2 = e)
		el.onlastone = onlastone2

		el.dispatchEvent(new Event('testevent'))
		el.dispatchEvent(new Event('otherevent'))
		el.dispatchEvent(new Event('another'))
		el.dispatchEvent(new Event('yetanother'))
		el.dispatchEvent(new Event('onemore'))
		el.dispatchEvent(new Event('lastone'))

		expect(String(testEvent)).toBe('null')
		expect(String(otherEvent)).toBe('null')
		expect(String(anotherEvent)).toBe('null')
		expect(String(yetanotherEvent)).toBe('null')
		expect(String(onemoreEvent)).toBe('null')
		expect(String(lastoneEvent)).toBe('null')

		expect(testEvent2).toBeInstanceOf(Event)
		expect(otherEvent2).toBeInstanceOf(Event)
		expect(anotherEvent2).toBeInstanceOf(Event)
		expect(yetanotherEvent2).toBeInstanceOf(Event)
		expect(onemoreEvent2).toBeInstanceOf(Event)
		expect(lastoneEvent2).toBeInstanceOf(Event)
	})
})

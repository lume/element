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

		let LastOneForRealEvent: Event | null = null
		const onLastOneForReal = (e: Event) => (LastOneForRealEvent = e)

		let lastOneForRealForRealEvent: Event | null = null
		const onLastOneForRealForReal = (e: Event) => (lastOneForRealForRealEvent = e)

		// test builtin event props work the same
		let loadEvent: Event | null = null
		const onload = (e: Event) => (loadEvent = e)

		let seriouslyTheLastOneEvent: Event | null = null
		const onSeriouslyTheLastOne = (e: Event) => (seriouslyTheLastOneEvent = e)

		let okThisIsTheFinalOneEvent: Event | null = null
		const onokThisIsTheFinalOne = (e: Event) => (okThisIsTheFinalOneEvent = e)

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

			@event onLastOneForReal: EventListener | null = null

			@event 'onlast-one-for-real-for-real': EventListener | null = null

			// onload = null // this is a builtin event prop

			// Test non-decorator usage
			static override events = ['seriously-the-last-one', 'okThisIsTheFinalOne']
			'onseriously-the-last-one': EventListener | null = null
			// In non-decorator usage, the property does not have to pre-exist (using `declare` to emulate that).
			declare onokThisIsTheFinalOne: EventListener | null

			override connectedCallback() {
				super.connectedCallback()

				this.dispatchEvent(new Event('testevent'))
				this.dispatchEvent(new Event('otherevent'))
				this.dispatchEvent(new Event('another'))
				this.dispatchEvent(new Event('yetanother'))
				this.dispatchEvent(new Event('onemore'))
				this.dispatchEvent(new Event('lastone'))
				this.dispatchEvent(new Event('LastOneForReal'))
				this.dispatchEvent(new Event('last-one-for-real-for-real'))
				this.dispatchEvent(new Event('load'))
				this.dispatchEvent(new Event('seriously-the-last-one'))
				this.dispatchEvent(new Event('okThisIsTheFinalOne'))
			}
		}

		const el = new MyEl()

		el.onotherevent = onotherevent
		el.onyetanother = onyetanother
		el.onlastone = onlastone
		el.onLastOneForReal = onLastOneForReal
		el['onlast-one-for-real-for-real'] = onLastOneForRealForReal
		el.onload = onload
		el['onseriously-the-last-one'] = onSeriouslyTheLastOne
		el.onokThisIsTheFinalOne = onokThisIsTheFinalOne

		document.body.append(el)

		expect(testEvent).toBeInstanceOf(Event)
		expect(otherEvent).toBeInstanceOf(Event)
		expect(String(anotherEvent)).toBe('null')
		expect(yetanotherEvent).toBeInstanceOf(Event)
		expect(onemoreEvent).toBeInstanceOf(Event)
		expect(lastoneEvent).toBeInstanceOf(Event)
		expect(LastOneForRealEvent).toBeInstanceOf(Event)
		expect(lastOneForRealForRealEvent).toBeInstanceOf(Event)
		expect(loadEvent).toBeInstanceOf(Event)
		expect(seriouslyTheLastOneEvent).toBeInstanceOf(Event)
		expect(okThisIsTheFinalOneEvent).toBeInstanceOf(Event)

		testEvent = null
		otherEvent = null
		anotherEvent = null
		yetanotherEvent = null
		onemoreEvent = null
		lastoneEvent = null
		LastOneForRealEvent = null
		lastOneForRealForRealEvent = null
		loadEvent = null
		seriouslyTheLastOneEvent = null
		okThisIsTheFinalOneEvent = null

		el.dispatchEvent(new Event('testevent'))
		el.dispatchEvent(new Event('otherevent'))
		el.dispatchEvent(new Event('another'))
		el.dispatchEvent(new Event('yetanother'))
		el.dispatchEvent(new Event('onemore'))
		el.dispatchEvent(new Event('lastone'))
		el.dispatchEvent(new Event('LastOneForReal'))
		el.dispatchEvent(new Event('last-one-for-real-for-real'))
		el.dispatchEvent(new Event('load'))
		el.dispatchEvent(new Event('seriously-the-last-one'))
		el.dispatchEvent(new Event('okThisIsTheFinalOne'))

		expect(testEvent).toBeInstanceOf(Event)
		expect(otherEvent).toBeInstanceOf(Event)
		expect(String(anotherEvent)).toBe('null')
		expect(yetanotherEvent).toBeInstanceOf(Event)
		expect(onemoreEvent).toBeInstanceOf(Event)
		expect(lastoneEvent).toBeInstanceOf(Event)
		expect(LastOneForRealEvent).toBeInstanceOf(Event)
		expect(lastOneForRealForRealEvent).toBeInstanceOf(Event)
		expect(loadEvent).toBeInstanceOf(Event)
		expect(seriouslyTheLastOneEvent).toBeInstanceOf(Event)
		expect(okThisIsTheFinalOneEvent).toBeInstanceOf(Event)

		testEvent = null
		otherEvent = null
		anotherEvent = null
		yetanotherEvent = null
		onemoreEvent = null
		lastoneEvent = null
		LastOneForRealEvent = null
		lastOneForRealForRealEvent = null
		loadEvent = null
		seriouslyTheLastOneEvent = null
		okThisIsTheFinalOneEvent = null

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

		let LastOneForRealEvent2: Event | null = null
		const onLastOneForReal2 = (e: Event) => (LastOneForRealEvent2 = e)
		el.onLastOneForReal = onLastOneForReal2

		let lastOneForRealForRealEvent2: Event | null = null
		const onLastOneForRealForReal2 = (e: Event) => (lastOneForRealForRealEvent2 = e)
		el['onlast-one-for-real-for-real'] = onLastOneForRealForReal2

		let loadEvent2: Event | null = null
		const onload2 = (e: Event) => (loadEvent2 = e)
		el.onload = onload2

		let seriouslyTheLastOneEvent2: Event | null = null
		const onSeriouslyTheLastOne2 = (e: Event) => (seriouslyTheLastOneEvent2 = e)
		el['onseriously-the-last-one'] = onSeriouslyTheLastOne2

		let okThisIsTheFinalOneEvent2: Event | null = null
		const onokThisIsTheFinalOne2 = (e: Event) => (okThisIsTheFinalOneEvent2 = e)
		el.onokThisIsTheFinalOne = onokThisIsTheFinalOne2

		el.dispatchEvent(new Event('testevent'))
		el.dispatchEvent(new Event('otherevent'))
		el.dispatchEvent(new Event('another'))
		el.dispatchEvent(new Event('yetanother'))
		el.dispatchEvent(new Event('onemore'))
		el.dispatchEvent(new Event('lastone'))
		el.dispatchEvent(new Event('LastOneForReal'))
		el.dispatchEvent(new Event('last-one-for-real-for-real'))
		el.dispatchEvent(new Event('load'))
		el.dispatchEvent(new Event('seriously-the-last-one'))
		el.dispatchEvent(new Event('okThisIsTheFinalOne'))

		expect(String(testEvent)).toBe('null')
		expect(String(otherEvent)).toBe('null')
		expect(String(anotherEvent)).toBe('null')
		expect(String(yetanotherEvent)).toBe('null')
		expect(String(onemoreEvent)).toBe('null')
		expect(String(lastoneEvent)).toBe('null')
		expect(String(LastOneForRealEvent)).toBe('null')
		expect(String(lastOneForRealForRealEvent)).toBe('null')
		expect(String(loadEvent)).toBe('null')
		expect(String(seriouslyTheLastOneEvent)).toBe('null')
		expect(String(okThisIsTheFinalOneEvent)).toBe('null')

		expect(testEvent2).toBeInstanceOf(Event)
		expect(otherEvent2).toBeInstanceOf(Event)
		expect(anotherEvent2).toBeInstanceOf(Event)
		expect(yetanotherEvent2).toBeInstanceOf(Event)
		expect(onemoreEvent2).toBeInstanceOf(Event)
		expect(lastoneEvent2).toBeInstanceOf(Event)
		expect(LastOneForRealEvent2).toBeInstanceOf(Event)
		expect(lastOneForRealForRealEvent2).toBeInstanceOf(Event)
		expect(loadEvent2).toBeInstanceOf(Event)
		expect(seriouslyTheLastOneEvent2).toBeInstanceOf(Event)
		expect(okThisIsTheFinalOneEvent2).toBeInstanceOf(Event)
	})
})

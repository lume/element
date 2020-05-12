// TODO re-enable this once we figure out what to do about the fact that mixins
// are not supported by declaration files. See
// https://github.com/microsoft/TypeScript/issues/35822

// import {Constructor, Mixin, MixinResult} from 'lowclass'
// import createEmotion, {Emotion} from 'create-emotion'
//
// // prettier-ignore
// const base26Chars = [
//   'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
// ]
//
// /**
//  * Given an array of characters `baseChars` with length X, convert an int
//  * `value` to base X, using the chars in the array for the digit representation.
//  */
// // We need this because Emotion.js accepts only letters in the createEmotion key
// // option.
// // Based on https://stackoverflow.com/a/923814/454780
// function integerToString(value: number, baseChars: string[]): string {
// 	value = Math.floor(value)
//
// 	let result = ''
// 	const targetBase = baseChars.length
//
// 	do {
// 		result = baseChars[value % targetBase] + result
// 		value = value / targetBase
// 	} while (value > 1)
//
// 	return result
// }
//
// let emotionCount = 0
//
// const emotions = new WeakMap<WithEmotion, Emotion>()
//
// /**
//  * This mixin can only be applied onto anything that extends from
//  * window.Element. It gives the target class a `.css` property which is a
//  * template tag for creating CSS styles using Emotion syntax. The `.css`
//  * template tag is unique for each instance of the Element class, and applies
//  * scoped styling to the class using a unique identifier including the
//  * Element's tagName.
//  */
// // eslint-disable-next-line typescript/explicit-function-return-type
// function WithEmotionMixin<T extends Constructor<Element>>(Base?: T) {
// 	if (!Base) Base = Constructor(Element)
//
// 	class WithEmotion extends Constructor<Element>(Base) {
// 		get emotion(): ReturnType<typeof createEmotion> {
// 			let emotion = emotions.get(this)
//
// 			if (!emotion) {
// 				emotions.set(
// 					this,
// 					(emotion = createEmotion({
// 						// The key option is required when there will be multiple instances
// 						// of Emotion in a single app, and we need one instance of Emotion
// 						// per element instance, for now.
// 						key: this.tagName.toLowerCase() + '-' + integerToString(++emotionCount, base26Chars),
//
// 						// The `as HTMLElement` cast is needed because the type def for
// 						// `createEmotion` is too specific, and does not accept just Node
// 						// (f.e. shadow roots are Node, but not HTMLElement, and we may want
// 						// to attach the generated <style> elements to this element's shadow
// 						// root)
// 						container: this.root as HTMLElement,
// 					})),
// 				)
// 			}
//
// 			return emotion
// 		}
//
// 		get css(): ReturnType<typeof createEmotion>['css'] {
// 			return this.emotion.css
// 		}
// 	}
//
// 	return WithEmotion as MixinResult<typeof WithEmotion, T>
// }
//
// export const WithEmotion = Mixin(WithEmotionMixin, Element)
// export interface WithEmotion extends InstanceType<typeof WithEmotion> {}

export {}

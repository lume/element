<script setup lang="ts">
import './KitchenSink.js'
// import {FooBar} from './FooBar.ce.js'
import './FooBar.ce.js'
</script>

<template>
	<!-- not working (expected type error): -->
	<!-- <FooBar :foo="true" /> -->
	<foo-bar :foo="true" />
	<!-- <fooBar :foo="true" /> -->

	<!-- <kitchen-sink :count="123" :foo="true"></kitchen-sink> -->

	<!-- This works (expect error) -->
	<kitchen-sink :foo="true"></kitchen-sink>
	<!-- This works (expect no error) -->
	<kitchen-sink :foo="123"></kitchen-sink>
</template>

<style scoped>
kitchen-sink#sink {
	cursor: pointer;
	user-select: none;
}
</style>

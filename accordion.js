import '@polymer/polymer/polymer-legacy.js';
import './accordion-collapse.js';
import { IronMultiSelectableBehavior } from '@polymer/iron-selector/iron-multi-selectable.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-labs-accordion">
	<template strip-whitespace="">
		<style>
		:host {
			display: block;
			box-sizing: border-box;
		}
	</style>
	<slot></slot>
	</template>


</dom-module>`;

document.head.appendChild($_documentContainer.content);
/**
 * `d2l-labs-accordion`
 *
 * @demo demo/index.html
 */
Polymer({
	is: 'd2l-labs-accordion',
	properties: {
		/**
		 * Indicates the component is an accordion.
		 */
		isAccordion: {
			type: Boolean,
			readOnly: true,
			value: true
		},
		/**
		 * Whether to automatically close other opened branches
		 */
		autoClose: {
			type: Boolean,
			value: false
		}
	},
	behaviors: [
		IronMultiSelectableBehavior
	],
	ready: function() {
		this.selectable = 'd2l-labs-accordion-collapse';
		this.activateEvent = 'd2l-labs-accordion-collapse-state-opened';
		this.selectedAttribute = 'opened';
	}
});

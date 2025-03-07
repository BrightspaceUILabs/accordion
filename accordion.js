import '@polymer/polymer/polymer-legacy.js';
import './accordion-collapse.js';
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
		},
		selected: {
			observer:'_updateSelected'
		}
	},
	attached:function(){
		this.addEventListener('d2l-labs-accordion-collapse-state-opened', this._handleAccordionOpened)
	},
	detached:function() {
		this.removeEventListener('d2l-labs-accordion-collapse-state-opened', this._handleAccordionOpened)
	},
	created: function() {
		this._handleAccordionOpened = this._handleAccordionOpened.bind(this);
	},
	_handleAccordionOpened(e){
		this._updateSelected(this.items.indexOf(e.target))
	},

	_updateSelected(selected) {
		const items = this.items
		for (const i in items) {
			items[i].opened = i === selected;
		}
	}
});

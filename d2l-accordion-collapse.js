import '@polymer/polymer/polymer-legacy.js';
import 'd2l-colors/d2l-colors.js';
import 'd2l-icons/d2l-icon.js';
import 'd2l-icons/tier1-icons.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import 'd2l-polymer-behaviors/d2l-dom.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-accordion-collapse">
	<template strip-whitespace="">
		<style is="custom-style">
			:host {
				display: block;
			}
			#trigger {
				@apply --layout-horizontal;
				@apply --layout-center;
				text-decoration: none;
			}
			#trigger[data-border] {
				border-bottom: solid 1px var(--d2l-color-corundum);
				padding-bottom: 0.4rem;
				margin-bottom: 0.4rem;
			}
			#trigger, #trigger:visited, #trigger:hover, #trigger:active {
				color: inherit;
			}
			:host([flex]) .collapse-title {
				@apply --layout-flex;
			}
			.content {
				height: auto;
				padding: 1px;
				margin: -1px;
				position: relative;
				overflow: hidden;
			}
			.content[data-opened] .summary {
				opacity: 0;
			}
			.summary {
				opacity: 1;
				transition: opacity 300ms ease;
			}
			iron-collapse {
				--iron-collapse-transition-duration: 1000ms;
			}
			:host([_state="closed"]) .content { 
				min-height: 0;
			}
			:host([_state="closed"]) .summary { 
				position: static;
			}
			:host([_state="opened"]) .summary { 
				position: absolute;
				transition-delay: 0;
			}
		</style>

		<a href="javascript:void(0)" id="trigger" on-click="toggle" aria-controls="collapse" role="button" data-border$="[[border]]">
			<div class="collapse-title" title="[[label]]">[[title]][[label]]<slot name="header"></slot>
			</div>
			<template is="dom-if" if="[[!noIcons]]">
				<d2l-icon icon="[[_toggle(opened, collapseIcon, expandIcon)]]"></d2l-icon>
			</template>
		</a>
		<div class="content" data-opened$="[[opened]]">
			<iron-collapse id="detail" class="detail" no-animation="[[noAnimation]]" opened="[[opened]]" on-transitioning-changed="_handleTransitionChanged">
				<slot></slot>
			</iron-collapse>
			<div class="summary">
				<slot name="summaryData"></slot>
			</div>
		</div>
	</template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
/**
 * `d2l-accordion-collapse`
 * An iron-collapse with a trigger section and optional expand/collapse icons.
 * Originally taken from: https://www.webcomponents.org/element/jifalops/iron-collapse-button
 *
 * @demo demo/d2l-accordion-collapse.html
 */
Polymer({
	is: 'd2l-accordion-collapse',
	properties: {
		/**
		 * Label title
		 */
		title: {
			type: String,
			value: ''
		},
		/**
		 * Label. Does not apply title to entire accordion
		 */
		label: {
			type: String,
			value: ''
		},
		/**
		 * Corresponds to the iron-collapse's noAnimation property.
		 */
		noAnimation: {
			type: Boolean,
			value: false
		},
		/**
		 * Whether currently expanded.
		 */
		opened: {
			type: Boolean,
			value: false,
			notify: true,
			observer: '_notifyStateChanged',
			reflectToAttribute: true
		},
		/**
		 * The icon when collapsed.
		 */
		expandIcon: {
			type: String,
			value: 'd2l-tier1:arrow-expand'
		},
		/**
		 * The icon when expanded.
		 */
		collapseIcon: {
			type: String,
			value: 'd2l-tier1:arrow-collapse'
		},
		/**
		 * Whether to hide the expand/collapse icon.
		 */
		noIcons: {
			type: Boolean,
			value: false
		},
		/**
		 * Whether or not to use flex layout.
		 */
		flex: {
			type: Boolean,
			value: false
		},
		/**
		 * Whether or not to add a border between the header and the content.
		 */
		border: {
			type: Boolean,
			value: false
		},
		/**
		 * Whether the accordion's expand/collapse function is disabled.
		 */
		disabled: {
			type: Boolean,
			value: false
		},
		/**
		 * Listener for state changes.
		 */
		_boundListener: {
			type: Function
		},
		/**
		 * The current state of the accordion (opened, closed)
		 */
		_state: {
			type: String,
			reflectToAttribute: true,
			value: 'closed'
		}
	},
	ready: function() {
		this._boundListener = this._onStateChanged.bind(this);
		this.$.trigger.setAttribute('aria-expanded', this.opened);
	},

	attached: function() {
		if (this.disabled) {
			return;
		}
		window.addEventListener('d2l-accordion-collapse-state-changed', this._boundListener);
		this.$.detail.addEventListener('iron-resize', this._fireAccordionResizeEvent);
	},

	detached: function() {
		if (this.disabled) {
			return;
		}
		window.removeEventListener('d2l-accordion-collapse-state-changed', this._boundListener);
		this.$.detail.removeEventListener('iron-resize', this._fireAccordionResizeEvent);
	},
	open: function() {
		if (this.disabled) {
			return;
		}

		const ironCollapse = this.$.detail;
		const inTransition = ironCollapse.transitioning === true && ironCollapse.opened === false;

		if (!inTransition) {
			const content = this.shadowRoot.querySelector('.content');
			content.style.minHeight = (content.offsetHeight - 2) + 'px';
			this._state = 'opened';
		}
		this.opened = true;
		this._notifyStateChanged();
	},
	close: function() {
		if (this.disabled) {
			return;
		}
		this.opened = false;
		this._notifyStateChanged();
	},
	toggle: function() {
		this.fire('d2l-accordion-collapse-clicked');
		if (this.disabled) {
			return;
		}
		if (this.opened) {
			this.close();
		} else {
			this.open();
		}
	},
	_handleTransitionChanged(event) {
		const isClosed =
			event.target.opened === false && event.target.transitioning === false;
		const isOpened =
			event.target.opened === true && event.target.transitioning === false;
		if (isClosed) {
			this._state = 'closed';
			const content = this.shadowRoot.querySelector('.content');
			content.style.minHeight = 0;
		} else if (isOpened) {
			this._state = 'opened';
		}
	},
	_toggle: function(cond, t, f) { return cond ? t : f; },
	_onStateChanged: function(event) {
		if (this.opened
			&& event.detail.el !== this
			&& this._haveSharedAutoCloseAccordionAncestor(this, event.detail.el)
		) {
			/* close an opened child */
			if (!event.detail.opened
				&& D2L.Dom.isComposedAncestor(event.detail.el, this)
			) {
				this.opened = false;
			}
			/* close an opened sibling */
			if (event.detail.opened
				&& !D2L.Dom.isComposedAncestor(event.detail.el, this)
				&& !D2L.Dom.isComposedAncestor(this, event.detail.el)
			) {
				this.opened = false;
			}
		}
	},
	_notifyStateChanged: function() {
		if (this.opened) {
			this.fire('d2l-accordion-collapse-state-opened');
		}
		this.fire('d2l-accordion-collapse-state-changed', { opened: this.opened, el: this });
		this.$.trigger.setAttribute('aria-expanded', this.opened);
	},
	_haveSharedAutoCloseAccordionAncestor: function(node1, node2) {
		var accordionAncestor = D2L.Dom.findComposedAncestor(node1, function(elem) {
			if (elem.isAccordion && elem.autoClose) {
				return true;
			}
		});
		if (!accordionAncestor) {
			return false;
		}
		if (!D2L.Dom.isComposedAncestor(accordionAncestor, node2)) {
			return false;
		}
		return true;
	},
	_fireAccordionResizeEvent: function() {
		var event = new CustomEvent('d2l-accordion-collapse-resize', {
			bubbles: true
		});
		window.dispatchEvent(event);
	}
});

import '@polymer/polymer/polymer-legacy.js';
import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/icons/icon.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import { findComposedAncestor, isComposedAncestor } from '@brightspace-ui/core/helpers/dom.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-labs-accordion-collapse">
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
			:host([paddingIcon]) d2l-icon {
				padding-left: 25px;
			}
			:host([paddingIcon][dir="rtl"]) d2l-icon {
				padding-right: 25px;
				padding-left: 0px;
			}
			:host([flex][paddingIcon]) d2l-icon {
				padding-right: 25px;
			}
			:host([flex][paddingIcon][dir="rtl"]) d2l-icon {
				padding-left: 25px;
				padding-right: 0px;
			}
			.content {
				height: auto;
				padding: 1px;
				margin: -1px;
				position: relative;
			}
			.summary {
				transition: opacity 500ms ease;
			}
			iron-collapse {
				--iron-collapse-transition-duration: 700ms;
			}
			:host([_state="closing"]) .content,
			:host([_state="opening"]) .content {
				overflow: hidden;
			}
			:host([_state="closed"]) .summary,
			:host([_state="closing"]) .summary {
				transition-delay: 500ms;
			}
			:host([_state="opening"]) .summary,
			:host([_state="opened"]) .summary {
				opacity: 0;
			}
			:host([_state="closing"]) .summary,
			:host([_state="opening"]) .summary,
			:host([_state="opened"]) .summary {
				position: absolute;
				pointer-events: none;
			}
		</style>

		<a href="javascript:void(0)" id="trigger" on-click="toggle" aria-controls="collapse" role="button" data-border$="[[headerBorder]]">
			<div class="collapse-title" title="[[label]]">[[title]][[label]]<slot name="header"></slot>
			</div>
			<template is="dom-if" if="[[!noIcons]]">
				<d2l-icon icon="[[_toggle(opened, collapseIcon, expandIcon)]]"></d2l-icon>
			</template>
		</a>
		<div class="content">
			<iron-collapse id="detail" class="detail" no-animation="[[noAnimation]]" opened="[[opened]]" on-transitioning-changed="_handleTransitionChanged">
				<slot></slot>
			</iron-collapse>
			<div class="summary">
				<slot name="summary"></slot>
			</div>
		</div>
	</template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
/**
 * `d2l-labs-accordion-collapse`
 * An iron-collapse with a trigger section and optional expand/collapse icons.
 * Originally taken from: https://www.webcomponents.org/element/jifalops/iron-collapse-button
 *
 * @demo demo/accordion-collapse.html
 */
Polymer({
	is: 'd2l-labs-accordion-collapse',
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
		 * Whether or not to add extra padding for icon.
		 */
		paddingIcon: {
			type: Boolean,
			value: false
		},
		/**
		 * Whether or not to add a border between the header and the content.
		 */
		headerBorder: {
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
		window.addEventListener('d2l-labs-accordion-collapse-state-changed', this._boundListener);
		this.$.detail.addEventListener('iron-resize', this._fireAccordionResizeEvent);
	},

	detached: function() {
		if (this.disabled) {
			return;
		}
		window.removeEventListener('d2l-labs-accordion-collapse-state-changed', this._boundListener);
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
		this.fire('d2l-labs-accordion-collapse-clicked');
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

		const opened = event.target.opened === true;
		const transitioning = event.target.transitioning === true;

		const isClosing = !opened && transitioning;
		if (isClosing) {
			this._state = 'closing';
			return;
		}

		const isClosed = !opened && !transitioning;
		if (isClosed) {
			this._state = 'closed';
			const content = this.shadowRoot.querySelector('.content');
			content.style.removeProperty('minHeight');
			return;
		}

		const isOpening = opened && transitioning;
		if (isOpening) {
			this._state = 'opening';
			return;
		}

		const isOpened = opened && !transitioning;
		if (isOpened) {
			this._state = 'opened';
			return;
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
				&& isComposedAncestor(event.detail.el, this)
			) {
				this.opened = false;
			}
			/* close an opened sibling */
			if (event.detail.opened
				&& !isComposedAncestor(event.detail.el, this)
				&& !isComposedAncestor(this, event.detail.el)
			) {
				this.opened = false;
			}
		}
	},
	_notifyStateChanged: function() {
		if (this.opened) {
			this.fire('d2l-labs-accordion-collapse-state-opened');
		}
		this.fire('d2l-labs-accordion-collapse-state-changed', { opened: this.opened, el: this });
		this.$.trigger.setAttribute('aria-expanded', this.opened);
	},
	_haveSharedAutoCloseAccordionAncestor: function(node1, node2) {
		var accordionAncestor = findComposedAncestor(node1, function(elem) {
			if (elem.isAccordion && elem.autoClose) {
				return true;
			}
		});
		if (!accordionAncestor) {
			return false;
		}
		if (!isComposedAncestor(accordionAncestor, node2)) {
			return false;
		}
		return true;
	},
	_fireAccordionResizeEvent: function() {
		var event = new CustomEvent('d2l-labs-accordion-collapse-resize', {
			bubbles: true
		});
		window.dispatchEvent(event);
	}
});

import '@polymer/polymer/polymer-legacy.js';
import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/icons/icon.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import { findComposedAncestor, isComposedAncestor } from '@brightspace-ui/core/helpers/dom.js';
import { offscreenStyles } from '@brightspace-ui/core/components/offscreen/offscreen.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-labs-accordion-collapse">
	<template strip-whitespace="">
		<style is="custom-style">
			:host {
				display: block;
			}
			#interactive-header-content{
				@apply --layout-horizontal;
				@apply --layout-center;
			}
			#trigger {
				@apply --layout-horizontal;
				@apply --layout-center;
				text-decoration: none;
			}
			#trigger:focus-visible {
				outline-offset: 3px;
			}
			#trigger[data-border] {
				border-bottom: solid 1px var(--d2l-color-corundum);
				margin-bottom: 0.4rem;
				padding-bottom: 0.4rem;
			}
			#trigger, #trigger:visited, #trigger:hover, #trigger:active {
				color: inherit;
			}
			:host([flex]) .collapse-title {
				@apply --layout-flex;
				overflow: hidden;
			}
			:host([icon-has-padding]) d2l-icon {
				padding-left: 1.25rem;
				padding-right: 0;
			}
			:host([icon-has-padding][dir="rtl"]) d2l-icon {
				padding-left: 0;
				padding-right: 1.25rem;
			}
			:host([flex][icon-has-padding]) d2l-icon {
				padding-left: 0;
				padding-right: 1.25rem;
			}
			:host([flex][icon-has-padding][dir="rtl"]) d2l-icon {
				padding-left: 1.25rem;
				padding-right: 0;
			}
			.content {
				height: auto;
				margin: -1px;
				padding: 1px;
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
				pointer-events: none;
				position: absolute;
			}
			:host([_state="closing"]) .summary,
			:host([_state="opened"]) .summary {
				transition-property: none;
			}
			:host([disabled]) a {
				cursor: default;
			}
			:host([disabled]) d2l-icon {
				color: var(--d2l-color-chromite);
			}
			:host([disable-default-trigger-focus]) #trigger:focus {
				outline: none;
			}
		</style>
		<template is="dom-if" if="[[headerHasInteractiveContent]]">
			<style>
				#header-container {
					display: grid;
					grid-template-columns: auto;
					grid-template-rows: auto;
				}
				.header-grid-item {
					grid-column: 1;
					grid-row: 1;
				}
				#interactive-header-content {
					cursor: pointer;
				}
			</style>
		</template>

		<div id="header-container">
			<a href="javascript:void(0)" id="trigger" class="header-grid-item" aria-controls="collapse" role="button" data-border$="[[headerBorder]]" on-blur="_triggerBlur" on-click="toggle" on-focus="_triggerFocus">
				<template is="dom-if" if="[[!headerHasInteractiveContent]]">
					<div class="collapse-title" title="[[label]]">[[title]][[label]]<slot name="header"></slot>
					</div>
					<template is="dom-if" if="[[!noIcons]]">
						<d2l-icon icon="[[_toggle(opened, collapseIcon, expandIcon)]]"></d2l-icon>
					</template>
				</template>
				<template is="dom-if" if="[[headerHasInteractiveContent]]">
					<span class="d2l-offscreen">[[screenReaderHeaderText]]</span>
				</template>
			</a>
			<template is="dom-if" if="[[headerHasInteractiveContent]]">
				<div id="interactive-header-content" class="header-grid-item" on-click="toggle">
					<div class="collapse-title" title="[[label]]">[[title]][[label]]<slot name="header"></slot>
					</div>
					<template is="dom-if" if="[[!noIcons]]">
						<d2l-icon icon="[[_toggle(opened, collapseIcon, expandIcon)]]"></d2l-icon>
					</template>
				</div>
			</template>
		</div>

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
		 * Header text hidden on the screen, but to be read by a screen reader
		 */
		screenReaderHeaderText: {
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
		iconHasPadding: {
			type: Boolean,
			reflectToAttribute: true,
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
			reflectToAttribute: true,
			type: Boolean,
			value: false
		},
		/**
		 * Whether or not to disable default focus styles
		 */
		disableDefaultTriggerFocus: {
			type: Boolean,
			reflectToAttribute: true,
			value: false
		},
		/**
		 * Whether or not the header contains an interactive element inside it (e.g. clickable)
		 */
		headerHasInteractiveContent: {
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

		const styleElement = document.createElement('style');
		styleElement.textContent = offscreenStyles.cssText;
		this.shadowRoot.appendChild(styleElement);
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
			content.style.minHeight = `${content.offsetHeight - 2}px`;
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
	_triggerFocus: function() {
		this.fire('d2l-labs-accordion-collapse-toggle-focus');
	},
	_triggerBlur: function() {
		this.fire('d2l-labs-accordion-collapse-toggle-blur');
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
			content.style.removeProperty('min-height');
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
		const accordionAncestor = findComposedAncestor(node1, (elem) => {
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
		const event = new CustomEvent('d2l-labs-accordion-collapse-resize', {
			bubbles: true
		});
		window.dispatchEvent(event);
	}
});

import { css, html, LitElement } from 'lit';
import '@polymer/polymer/polymer-legacy.js';
import './accordion-collapse.js';

class LabsAccordion extends LitElement {
	static get properties() {
		return {
			/**
			 * Indicates the component is an accordion.
			 */
			_isAccordion: { type: Boolean, attribute: 'is-accordion' },
			/**
			 * Whether to automatically close other opened branches
			 */
			autoClose: { type: Boolean, attribute: 'auto-close' },
			selected: {  }
		};
	}

	static get styles() {
		return css`
			:host {
				display: block;
				box-sizing: border-box;
			}
		`;
	}

	constructor() {
		super();
		this._handleAccordionOpened = this._handleAccordionOpened.bind(this);this._isAccordion = true;
		this.autoClose = false;
	}

	get isAccordion() {
		return this._isAccordion;
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('d2l-labs-accordion-collapse-state-opened', this._handleAccordionOpened)
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener('d2l-labs-accordion-collapse-state-opened', this._handleAccordionOpened)
	}

	render() {
		return html`
				<slot></slot>

		`;
	}

	willUpdate(changedProperties) {
		super.willUpdate(changedProperties);
		if (changedProperties.has('selected')) {
			this._updateSelected(this.selected);
		}

	}

	_handleAccordionOpened(e) {
		this._updateSelected(this.items.indexOf(e.target))
	}

	_setisAccordion(val) {
		this._isAccordion = val;
	}

	_updateSelected(selected) {
		const items = this.items;
		for (const i in items) {
			items[i].opened = i === selected;
		}
	}
}

customElements.define('d2l-labs-accordion', LabsAccordion);

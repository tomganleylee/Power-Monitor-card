import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TestCardConfig, CUSTOM_CARD_ID } from './common';

export class SimpleTestCardEditor extends LitElement {
  @property({ attribute: false }) public hass: any;
  @state() private _config!: TestCardConfig;

  static styles = css`
    .card-config {
      padding: 16px;
    }
    ha-textfield,
    ha-entity-picker {
      width: 100%;
      margin-bottom: 16px;
    }
  `;

  setConfig(config: TestCardConfig): void {
    this._config = config;
    this.loadEntityPicker();
  }

  private _valueChanged(ev: CustomEvent): void {
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target as any;
    const name = target.id || target.name;
    let value = target.value;

    if (value === this._config[name]) {
      return;
    }

    const newConfig = { ...this._config };

    if (value === '' || value === undefined) {
      delete newConfig[name];
    } else {
      newConfig[name] = value;
    }

    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  private async loadEntityPicker(): Promise<void> {
    if (!customElements.get('ha-entity-picker')) {
      try {
        const helpers = await (window as any).loadCardHelpers?.();
        if (helpers) {
          await helpers.createCardElement({ type: 'entities', entities: [] });
        }
      } catch (err) {
        console.warn('Could not load card helpers:', err);
      }
    }
  }

  render() {
    if (!this._config || !this.hass) {
      return html`<div class="card-config">Loading...</div>`;
    }

    return html`
      <div class="card-config">
        <ha-textfield
          id="name"
          .label=${'Name (Optional)'}
          .value=${this._config.name || ''}
          @input=${this._valueChanged}
        ></ha-textfield>

        <ha-entity-picker
          id="entity"
          .hass=${this.hass}
          .label=${'Entity (Optional)'}
          .value=${this._config.entity || ''}
          @value-changed=${this._valueChanged}
          allow-custom-entity
        ></ha-entity-picker>
      </div>
    `;
  }
}

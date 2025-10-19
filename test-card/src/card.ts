import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TestCardConfig, CUSTOM_CARD_ID } from './common';

export class SimpleTestCard extends LitElement {
  @property({ attribute: false }) public hass: any;
  @state() private config!: TestCardConfig;

  static styles = css`
    :host {
      display: block;
    }
    .card {
      padding: 16px;
      background: var(--ha-card-background, white);
      border-radius: var(--ha-card-border-radius, 4px);
    }
    .entity-value {
      font-size: 2em;
      font-weight: bold;
      color: var(--primary-color);
    }
  `;

  setConfig(config: TestCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'name', selector: { text: {} } },
        { name: 'entity', selector: { entity: {} } }
      ]
    };
  }

  static getStubConfig(): TestCardConfig {
    return {
      type: CUSTOM_CARD_ID,
      name: 'Simple Test Card',
      entity: ''
    };
  }

  render() {
    if (!this.config || !this.hass) {
      return html`<div class="card">Loading...</div>`;
    }

    const entityState = this.config.entity
      ? this.hass.states[this.config.entity]?.state || 'unavailable'
      : 'No entity selected';

    return html`
      <ha-card .header=${this.config.name || 'Test Card'}>
        <div class="card">
          <div>Entity: ${this.config.entity || 'None'}</div>
          <div class="entity-value">${entityState}</div>
        </div>
      </ha-card>
    `;
  }
}

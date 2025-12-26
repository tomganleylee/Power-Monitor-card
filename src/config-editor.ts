/**
 * ConfigEditor - Visual configuration editor for Energy Flow Card
 * Following Home Assistant config editor patterns
 *
 * Key implementation notes:
 * 1. Must define static properties for hass and _config for proper reactivity
 * 2. Must dispatch config-changed events with bubbles:true and composed:true
 * 3. Must load HA card helpers to use ha-entity-picker and other HA components
 */

import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { EnergyFlowCardConfig, DeviceConfig, CategoryConfig } from './types';

// Ensure window.customCards exists
(window as any).customCards = (window as any).customCards || [];

@customElement('energy-flow-card-editor')
export class EnergyFlowCardEditor extends LitElement {
  // CRITICAL: Define static properties for Home Assistant integration
  // This ensures Lit properly reacts to hass and config changes
  static get properties() {
    return {
      hass: { attribute: false },
      _config: { state: true },
    };
  }

  @property({ attribute: false }) public hass?: any;
  @property({ attribute: false }) public lovelace?: any;
  @state() private _config?: EnergyFlowCardConfig;
  @state() private _entities: string[] = [];
  @state() private _selectedTab: 'sources' | 'devices' | 'categories' | 'display' | 'warnings' = 'sources';
  @state() private _helpersLoaded: boolean = false;

  // setConfig is called by HA when the editor is initialized
  public setConfig(config: EnergyFlowCardConfig): void {
    console.log('[EnergyFlowCardEditor] setConfig called with:', JSON.stringify(config, null, 2));
    // Create a deep copy to avoid mutation issues
    this._config = JSON.parse(JSON.stringify(config));
    // Request update to re-render with new config
    this.requestUpdate();
  }

  static styles = css`
    :host {
      display: block;
    }

    .card-config {
      padding: 16px;
    }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--divider-color);
    }

    .tab {
      padding: 8px 16px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      font-size: 14px;
      margin-bottom: -1px;
    }

    .tab:hover {
      color: var(--primary-text-color);
    }

    .tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    .option {
      padding: 16px 0;
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--divider-color);
    }

    .option-label {
      flex: 1;
    }

    .option-label .secondary {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    ha-select,
    ha-textfield {
      width: 200px;
    }

    ha-switch {
      padding: 16px 0;
    }

    .devices-list {
      margin-top: 16px;
    }

    .device-item {
      display: grid;
      grid-template-columns: 50px 1fr 200px auto;
      gap: 8px;
      align-items: center;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .device-icon {
      font-size: 24px;
      text-align: center;
    }

    mwc-button {
      margin-top: 8px;
    }
  `;

  /**
   * Called when element is connected to DOM
   */
  connectedCallback(): void {
    super.connectedCallback();
    console.log('[EnergyFlowCardEditor] connectedCallback - starting initialization');
    this._loadCardHelpers();
    this._loadEntities();
  }

  /**
   * Called when properties change - re-load entities when hass becomes available
   */
  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('hass') && this.hass) {
      console.log('[EnergyFlowCardEditor] hass property updated, reloading entities');
      this._loadEntities();
    }
  }

  /**
   * Load Home Assistant card helpers and UI components
   * This ensures ha-entity-picker and other components are available
   */
  private async _loadCardHelpers(): Promise<void> {
    console.log('[EnergyFlowCardEditor] _loadCardHelpers called');

    // Check if ha-entity-picker is already defined
    if (customElements.get('ha-entity-picker')) {
      console.log('[EnergyFlowCardEditor] ha-entity-picker already loaded');
      this._helpersLoaded = true;
      this.requestUpdate();
      return;
    }

    try {
      // Load card helpers from Home Assistant
      console.log('[EnergyFlowCardEditor] Loading card helpers...');
      const helpers = await (window as any).loadCardHelpers?.();
      if (helpers) {
        // Create a dummy entities card to force load ha-entity-picker
        console.log('[EnergyFlowCardEditor] Creating dummy card to load HA components...');
        const element = await helpers.createCardElement({ type: 'entities', entities: [] });
        // Wait for element to be defined
        if (element) {
          await element.updateComplete;
        }
        console.log('[EnergyFlowCardEditor] HA components loaded successfully');
        this._helpersLoaded = true;
        this.requestUpdate();
      } else {
        console.warn('[EnergyFlowCardEditor] loadCardHelpers not available, trying alternative method');
        // Alternative: Try to import directly from HA frontend
        await this._loadEntityPickerDirect();
      }
    } catch (err) {
      console.warn('[EnergyFlowCardEditor] Could not load card helpers:', err);
      // Try alternative method
      await this._loadEntityPickerDirect();
    }
  }

  /**
   * Alternative method to load ha-entity-picker directly
   */
  private async _loadEntityPickerDirect(): Promise<void> {
    try {
      // Try using customElements.whenDefined to wait for it
      if (!customElements.get('ha-entity-picker')) {
        console.log('[EnergyFlowCardEditor] Waiting for ha-entity-picker to be defined...');
        // Set a timeout to prevent infinite waiting
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout waiting for ha-entity-picker')), 5000)
        );
        await Promise.race([
          customElements.whenDefined('ha-entity-picker'),
          timeout
        ]).catch(() => {
          console.warn('[EnergyFlowCardEditor] ha-entity-picker not available, using fallback UI');
        });
      }
      this._helpersLoaded = true;
      this.requestUpdate();
    } catch (err) {
      console.warn('[EnergyFlowCardEditor] Could not load entity picker directly:', err);
      this._helpersLoaded = true; // Still mark as loaded to show UI
      this.requestUpdate();
    }
  }

  /**
   * Load available entities from Home Assistant
   */
  private _loadEntities(): void {
    if (!this.hass) {
      return;
    }

    this._entities = Object.keys(this.hass.states)
      .filter(entityId => entityId.startsWith('sensor.'))
      .sort();
  }

  /**
   * Dispatch config-changed event to Home Assistant
   * CRITICAL: Must use CustomEvent with bubbles and composed for HA to receive it
   */
  private _configChanged(config: EnergyFlowCardConfig): void {
    console.log('[EnergyFlowCardEditor] _configChanged called with:', JSON.stringify(config, null, 2));

    // Create a new config object to ensure immutability
    const newConfig = JSON.parse(JSON.stringify(config));
    this._config = newConfig;

    // Fire the config-changed event that Home Assistant listens for
    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    });

    console.log('[EnergyFlowCardEditor] Dispatching config-changed event');
    this.dispatchEvent(event);

    // Force re-render
    this.requestUpdate();
  }

  /**
   * Handle value changes from form inputs
   * Supports both HA components (value-changed) and native inputs (change/input)
   */
  private _valueChanged(ev: Event | CustomEvent): void {
    ev.stopPropagation();

    if (!this._config) {
      console.warn('[EnergyFlowCardEditor] _valueChanged called but no config');
      return;
    }

    const target = ev.target as any;
    const path = target.configValue;

    if (!path) {
      console.warn('[EnergyFlowCardEditor] _valueChanged called but no configValue on target');
      return;
    }

    // Get value from various HA component types
    let value: any;

    // For ha-entity-picker and other HA components that use CustomEvent
    if ((ev as CustomEvent).detail !== undefined) {
      value = (ev as CustomEvent).detail?.value ?? target.value;
    }
    // For ha-switch and other toggles
    else if (target.checked !== undefined) {
      value = target.checked;
    }
    // For ha-select
    else if (target.selected !== undefined) {
      value = target.value || target.selected;
    }
    // For native inputs
    else {
      value = target.value;
    }

    console.log(`[EnergyFlowCardEditor] _valueChanged: ${path} = ${value}`);

    // Skip if value hasn't changed
    const currentValue = this._getValue(path);
    if (currentValue === value) {
      return;
    }

    // Create a deep copy of config to avoid mutation
    const newConfig = JSON.parse(JSON.stringify(this._config));

    if (path.includes('.')) {
      // Handle nested paths like 'entities.solar'
      const parts = path.split('.');
      let current: any = newConfig;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = value;
    } else {
      // Direct property access
      (newConfig as any)[path] = value;
    }

    this._configChanged(newConfig);
  }

  /**
   * Add a new device
   */
  private _addDevice(): void {
    if (!this._config) {
      return;
    }

    const newDevice: DeviceConfig = {
      id: `device_${Date.now()}`,
      entity_id: '',
      name: 'New Device',
      icon: '🔌',
      show_when_off: false
    };

    const devices = [...(this._config.devices || []), newDevice];
    this._configChanged({ ...this._config, devices });
  }

  /**
   * Remove a device
   */
  private _removeDevice(index: number): void {
    if (!this._config) {
      return;
    }

    const devices = [...(this._config.devices || [])];
    devices.splice(index, 1);
    this._configChanged({ ...this._config, devices });
  }

  /**
   * Update a device field
   */
  private _updateDevice(index: number, field: keyof DeviceConfig, value: any): void {
    if (!this._config) {
      return;
    }

    const devices = [...(this._config.devices || [])];
    devices[index] = { ...devices[index], [field]: value };
    this._configChanged({ ...this._config, devices });
  }

  /**
   * Add a new category
   */
  private _addCategory(): void {
    if (!this._config) {
      return;
    }

    const newCategory: CategoryConfig = {
      id: `category_${Date.now()}`,
      name: 'New Category',
      icon: '📁'
    };

    const categories = [...(this._config.categories || []), newCategory];
    this._configChanged({ ...this._config, categories });
  }

  /**
   * Remove a category
   */
  private _removeCategory(index: number): void {
    if (!this._config) {
      return;
    }

    const categories = [...(this._config.categories || [])];
    const categoryId = categories[index].id;
    categories.splice(index, 1);

    // Remove category assignment from devices
    const devices = (this._config.devices || []).map(device => {
      if (device.category === categoryId) {
        const { category, ...rest } = device;
        return rest;
      }
      return device;
    });

    this._configChanged({ ...this._config, categories, devices });
  }

  /**
   * Update a category field
   */
  private _updateCategory(index: number, field: keyof CategoryConfig, value: any): void {
    if (!this._config) {
      return;
    }

    const categories = [...(this._config.categories || [])];
    categories[index] = { ...categories[index], [field]: value };
    this._configChanged({ ...this._config, categories });
  }

  /**
   * Get nested config value
   */
  private _getValue(path: string): any {
    if (!this._config) {
      return '';
    }

    const parts = path.split('.');
    let value: any = this._config;

    for (const part of parts) {
      value = value?.[part];
    }

    return value ?? '';
  }

  protected render() {
    console.log('[EnergyFlowCardEditor] render called, config:', !!this._config, 'hass:', !!this.hass, 'helpersLoaded:', this._helpersLoaded);

    if (!this._config) {
      return html`
        <div class="card-config" style="padding: 16px;">
          <div style="color: var(--secondary-text-color);">Loading configuration...</div>
        </div>
      `;
    }

    if (!this.hass) {
      return html`
        <div class="card-config" style="padding: 16px;">
          <div style="color: var(--secondary-text-color);">Connecting to Home Assistant...</div>
        </div>
      `;
    }

    // Show loading state while helpers are loading
    if (!this._helpersLoaded) {
      return html`
        <div class="card-config" style="padding: 16px;">
          <div style="color: var(--secondary-text-color);">Loading editor components...</div>
        </div>
      `;
    }

    return html`
      <div class="card-config">
        <div class="tabs">
          <button
            class="tab ${this._selectedTab === 'sources' ? 'active' : ''}"
            @click=${() => { this._selectedTab = 'sources'; this.requestUpdate(); }}
          >
            Energy Sources
          </button>
          <button
            class="tab ${this._selectedTab === 'devices' ? 'active' : ''}"
            @click=${() => { this._selectedTab = 'devices'; this.requestUpdate(); }}
          >
            Devices
          </button>
          <button
            class="tab ${this._selectedTab === 'categories' ? 'active' : ''}"
            @click=${() => { this._selectedTab = 'categories'; this.requestUpdate(); }}
          >
            Categories
          </button>
          <button
            class="tab ${this._selectedTab === 'display' ? 'active' : ''}"
            @click=${() => { this._selectedTab = 'display'; this.requestUpdate(); }}
          >
            Display
          </button>
          <button
            class="tab ${this._selectedTab === 'warnings' ? 'active' : ''}"
            @click=${() => { this._selectedTab = 'warnings'; this.requestUpdate(); }}
          >
            Warnings
          </button>
        </div>

        ${this._selectedTab === 'sources' ? this._renderSourcesTab() : ''}
        ${this._selectedTab === 'devices' ? this._renderDevicesTab() : ''}
        ${this._selectedTab === 'categories' ? this._renderCategoriesTab() : ''}
        ${this._selectedTab === 'display' ? this._renderDisplayTab() : ''}
        ${this._selectedTab === 'warnings' ? this._renderWarningsTab() : ''}
      </div>
    `;
  }

  private _renderSourcesTab() {
    // Check if ha-entity-picker is available
    const hasEntityPicker = customElements.get('ha-entity-picker');

    return html`
      <div class="option">
        <div class="option-label">
          <div>Solar Power</div>
          <div class="secondary">Sensor measuring solar panel output (watts)</div>
        </div>
        ${hasEntityPicker ? html`
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._getValue('entities.solar') || ''}
            .configValue=${'entities.solar'}
            @value-changed=${this._valueChanged}
            .includeDomains=${['sensor']}
            allow-custom-entity
          ></ha-entity-picker>
        ` : html`
          <input
            type="text"
            .value=${this._getValue('entities.solar') || ''}
            .configValue=${'entities.solar'}
            @change=${this._valueChanged}
            placeholder="sensor.solar_power"
            style="width: 200px; padding: 8px;"
          />
        `}
      </div>

      <div class="option">
        <div class="option-label">
          <div>Battery Power</div>
          <div class="secondary">Sensor measuring battery charge/discharge (watts)</div>
        </div>
        ${hasEntityPicker ? html`
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._getValue('entities.battery') || ''}
            .configValue=${'entities.battery'}
            @value-changed=${this._valueChanged}
            .includeDomains=${['sensor']}
            allow-custom-entity
          ></ha-entity-picker>
        ` : html`
          <input
            type="text"
            .value=${this._getValue('entities.battery') || ''}
            .configValue=${'entities.battery'}
            @change=${this._valueChanged}
            placeholder="sensor.battery_power"
            style="width: 200px; padding: 8px;"
          />
        `}
      </div>

      <div class="option">
        <div class="option-label">
          <div>Battery State of Charge</div>
          <div class="secondary">Sensor showing battery percentage (0-100%)</div>
        </div>
        ${hasEntityPicker ? html`
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._getValue('entities.battery_soc') || ''}
            .configValue=${'entities.battery_soc'}
            @value-changed=${this._valueChanged}
            .includeDomains=${['sensor']}
            allow-custom-entity
          ></ha-entity-picker>
        ` : html`
          <input
            type="text"
            .value=${this._getValue('entities.battery_soc') || ''}
            .configValue=${'entities.battery_soc'}
            @change=${this._valueChanged}
            placeholder="sensor.battery_soc"
            style="width: 200px; padding: 8px;"
          />
        `}
      </div>

      <div class="option">
        <div class="option-label">
          <div>Battery Capacity (kWh)</div>
          <div class="secondary">Total battery capacity in kilowatt-hours</div>
        </div>
        <ha-textfield
          type="number"
          .value=${String(this._getValue('entities.battery_capacity') || '')}
          .configValue=${'entities.battery_capacity'}
          @change=${this._valueChanged}
        ></ha-textfield>
      </div>

      <div class="option">
        <div class="option-label">
          <div>Grid Power</div>
          <div class="secondary">Sensor measuring grid import/export (watts)</div>
        </div>
        ${hasEntityPicker ? html`
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._getValue('entities.grid') || ''}
            .configValue=${'entities.grid'}
            @value-changed=${this._valueChanged}
            .includeDomains=${['sensor']}
            allow-custom-entity
          ></ha-entity-picker>
        ` : html`
          <input
            type="text"
            .value=${this._getValue('entities.grid') || ''}
            .configValue=${'entities.grid'}
            @change=${this._valueChanged}
            placeholder="sensor.grid_power"
            style="width: 200px; padding: 8px;"
          />
        `}
      </div>
    `;
  }

  private _renderDevicesTab() {
    const devices = this._config?.devices || [];
    const categories = this._config?.categories || [];
    const hasEntityPicker = customElements.get('ha-entity-picker');

    return html`
      <div class="devices-list">
        ${devices.map((device, index) => html`
          <div class="device-item" style="grid-template-columns: 50px 1fr 200px 150px auto;">
            <div class="device-icon">${device.icon || '🔌'}</div>

            <ha-textfield
              .value=${device.name || ''}
              @change=${(e: Event) => this._updateDevice(index, 'name', (e.target as any).value)}
              label="Name"
            ></ha-textfield>

            ${hasEntityPicker ? html`
              <ha-entity-picker
                .hass=${this.hass}
                .value=${device.entity_id || ''}
                @value-changed=${(e: CustomEvent) => this._updateDevice(index, 'entity_id', e.detail.value)}
                .includeDomains=${['sensor']}
                allow-custom-entity
              ></ha-entity-picker>
            ` : html`
              <input
                type="text"
                .value=${device.entity_id || ''}
                @change=${(e: Event) => this._updateDevice(index, 'entity_id', (e.target as any).value)}
                placeholder="sensor.device"
                style="width: 180px; padding: 8px;"
              />
            `}

            <ha-select
              .value=${device.category || ''}
              @selected=${(e: CustomEvent) => this._updateDevice(index, 'category', (e.target as any).value)}
              @closed=${(e: Event) => e.stopPropagation()}
              label="Category"
            >
              <mwc-list-item value="">None</mwc-list-item>
              ${categories.map(cat => html`
                <mwc-list-item value="${cat.id}">${cat.name}</mwc-list-item>
              `)}
            </ha-select>

            <mwc-icon-button
              @click=${() => this._removeDevice(index)}
              title="Remove device"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </mwc-icon-button>
          </div>
        `)}
      </div>

      <mwc-button @click=${this._addDevice}>
        Add Device
      </mwc-button>
    `;
  }

  private _renderCategoriesTab() {
    const categories = this._config?.categories || [];
    const hasEntityPicker = customElements.get('ha-entity-picker');

    return html`
      <div style="margin-bottom: 16px;">
        <p style="color: var(--secondary-text-color); margin-top: 0;">
          Categories allow you to group devices together. Click a category in the card to expand/collapse it.
          Optionally assign a circuit entity to show the total power for the circuit.
        </p>
      </div>

      <div class="devices-list">
        ${categories.map((category, index) => html`
          <div class="device-item" style="grid-template-columns: 50px 1fr 200px auto;">
            <div class="device-icon">${category.icon || '📁'}</div>

            <ha-textfield
              .value=${category.name || ''}
              @change=${(e: Event) => this._updateCategory(index, 'name', (e.target as any).value)}
              label="Category Name"
            ></ha-textfield>

            ${hasEntityPicker ? html`
              <ha-entity-picker
                .hass=${this.hass}
                .value=${category.circuit_entity || ''}
                @value-changed=${(e: CustomEvent) => this._updateCategory(index, 'circuit_entity', e.detail.value)}
                .includeDomains=${['sensor']}
                allow-custom-entity
                label="Circuit Entity (Optional)"
              ></ha-entity-picker>
            ` : html`
              <input
                type="text"
                .value=${category.circuit_entity || ''}
                @change=${(e: Event) => this._updateCategory(index, 'circuit_entity', (e.target as any).value)}
                placeholder="sensor.circuit"
                style="width: 180px; padding: 8px;"
              />
            `}

            <mwc-icon-button
              @click=${() => this._removeCategory(index)}
              title="Remove category"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </mwc-icon-button>
          </div>

          <div style="padding: 8px 16px; font-size: 12px; color: var(--secondary-text-color);">
            ${this._getCategoryDeviceCount(category.id)} device(s) assigned
          </div>
        `)}
      </div>

      <mwc-button @click=${this._addCategory}>
        Add Category
      </mwc-button>
    `;
  }

  private _getCategoryDeviceCount(categoryId: string): number {
    const devices = this._config?.devices || [];
    return devices.filter(d => d.category === categoryId).length;
  }

  private _renderDisplayTab() {
    return html`
      <div class="option">
        <div class="option-label">
          <div>Visualization Mode</div>
          <div class="secondary">Choose particle animation, flow lines, or both</div>
        </div>
        <ha-select
          .value=${this._config?.visualization_mode || 'particles'}
          .configValue=${'visualization_mode'}
          @selected=${this._valueChanged}
          @closed=${(e: Event) => e.stopPropagation()}
        >
          <mwc-list-item value="particles">Animated Particles</mwc-list-item>
          <mwc-list-item value="sankey">Sankey Flow Lines</mwc-list-item>
          <mwc-list-item value="both">Both</mwc-list-item>
        </ha-select>
      </div>

      <div class="option">
        <div class="option-label">
          <div>Show Statistics</div>
          <div class="secondary">Display efficiency and self-sufficiency metrics</div>
        </div>
        <ha-switch
          .checked=${this._config?.show_statistics ?? true}
          .configValue=${'show_statistics'}
          @change=${this._valueChanged}
        ></ha-switch>
      </div>

      <div class="option">
        <div class="option-label">
          <div>Update Interval (ms)</div>
          <div class="secondary">How often to refresh sensor data</div>
        </div>
        <ha-textfield
          type="number"
          .value=${String(this._config?.update_interval || 2000)}
          .configValue=${'update_interval'}
          @change=${this._valueChanged}
          min="500"
          max="10000"
          step="500"
        ></ha-textfield>
      </div>
    `;
  }

  private _renderWarningsTab() {
    // Initialize warnings object if it doesn't exist
    const warnings = this._config?.warnings || {};

    return html`
      <div class="option">
        <div class="option-label">
          <div>Battery Low Warning (%)</div>
          <div class="secondary">Warn when battery falls below this percentage</div>
        </div>
        <ha-textfield
          type="number"
          .value=${String(warnings.battery_low || 20)}
          .configValue=${'warnings.battery_low'}
          @change=${this._valueChanged}
          min="0"
          max="100"
          step="5"
        ></ha-textfield>
      </div>

      <div class="option">
        <div class="option-label">
          <div>High Grid Import (W)</div>
          <div class="secondary">Warn when importing more than this from the grid</div>
        </div>
        <ha-textfield
          type="number"
          .value=${String(warnings.grid_import || 3000)}
          .configValue=${'warnings.grid_import'}
          @change=${this._valueChanged}
          min="0"
          max="10000"
          step="100"
        ></ha-textfield>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'energy-flow-card-editor': EnergyFlowCardEditor;
  }
}

// Log when the editor module is loaded
console.log('[EnergyFlowCardEditor] Module loaded, customElement registered:', !!customElements.get('energy-flow-card-editor'));

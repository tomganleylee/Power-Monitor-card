/**
 * Simple Test Card - Minimal example to test visual editor
 */

import { CUSTOM_CARD_ID } from './common';
import { SimpleTestCard } from './card';
import { SimpleTestCardEditor } from './editor';

// Register custom elements
customElements.define(CUSTOM_CARD_ID.replace('custom:', ''), SimpleTestCard);
customElements.define(CUSTOM_CARD_ID.replace('custom:', '') + '-editor', SimpleTestCardEditor);

// Register in Home Assistant custom cards
window.customCards = window.customCards || [];
window.customCards.push({
  type: CUSTOM_CARD_ID,
  name: 'Simple Test Card',
  description: 'A minimal test card to verify visual editor functionality',
  preview: true
});

console.log('Simple Test Card loaded successfully');

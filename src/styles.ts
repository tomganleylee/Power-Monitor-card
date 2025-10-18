/**
 * Dark theme styles for Energy Flow Card - matching image.png design
 */

import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
    background: linear-gradient(135deg, #0a1628 0%, #1a2332 100%);
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    font-family: var(--primary-font-family, 'Roboto', sans-serif);
    color: #ffffff;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    padding: 20px;
    position: relative;
    background: linear-gradient(135deg, rgba(10, 22, 40, 0.95) 0%, rgba(26, 35, 50, 0.95) 100%);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .card-title {
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .refresh-button {
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #ffffff;
    transition: all 0.3s ease;
  }

  .refresh-button:hover {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 12px rgba(100, 200, 255, 0.3);
  }

  .canvas-container {
    position: relative;
    width: 100%;
    min-height: 500px;
    background: radial-gradient(ellipse at center, rgba(30, 50, 80, 0.3) 0%, rgba(10, 20, 35, 0.8) 100%);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.5);
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
    opacity: 1;
    transition: opacity 0.15s ease-in;
  }

  canvas.initializing {
    opacity: 0;
  }

  /* Statistics Panel - Dark styled panel at bottom */
  .statistics-panel {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-top: 24px;
    padding: 20px 32px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .stat-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #64b5f6;
    text-shadow: 0 0 20px rgba(100, 181, 246, 0.5);
  }

  .stat-unit {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin-left: 4px;
  }

  /* Warning Banner - Orange alert style */
  .warning-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    margin-bottom: 16px;
    background: rgba(255, 152, 0, 0.15);
    border-left: 4px solid #ff9800;
    border-radius: 8px;
    font-size: 14px;
    color: #ffb74d;
    backdrop-filter: blur(10px);
  }

  .warning-icon {
    font-size: 22px;
    filter: drop-shadow(0 0 8px rgba(255, 152, 0, 0.6));
  }

  .stale-indicator {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 6px 12px;
    background: rgba(244, 67, 54, 0.2);
    border: 1px solid #f44336;
    color: #ff5252;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;
  }

  .error {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    padding: 32px;
    color: #f44336;
    text-align: center;
  }

  .error-icon {
    font-size: 56px;
    filter: drop-shadow(0 0 12px rgba(244, 67, 54, 0.5));
  }

  .error-message {
    font-size: 15px;
    line-height: 1.5;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .card-content {
      padding: 16px;
    }

    .statistics-panel {
      gap: 20px;
      padding: 16px 20px;
    }

    .stat-value {
      font-size: 24px;
    }

    .canvas-container {
      min-height: 400px;
    }
  }

  @media (max-width: 480px) {
    .card-title {
      font-size: 18px;
    }

    .statistics-panel {
      flex-direction: column;
      gap: 16px;
    }

    .canvas-container {
      min-height: 350px;
    }
  }

  /* Glow animations */
  @keyframes pulse-glow {
    0%, 100% {
      opacity: 1;
      filter: drop-shadow(0 0 8px currentColor);
    }
    50% {
      opacity: 0.7;
      filter: drop-shadow(0 0 16px currentColor);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.4s ease-out;
  }

  .pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  /* Accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  *:focus-visible {
    outline: 2px solid #64b5f6;
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

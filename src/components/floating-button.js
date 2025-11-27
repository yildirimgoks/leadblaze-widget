/**
 * FloatingButton Component
 * Creates a collapsible floating chat button with expand/collapse functionality
 */

import { ShadowDOMWrapper } from '../utils/shadow-dom.js';

export class FloatingButton {
  constructor(config, onExpand) {
    this.config = config;
    this.onExpand = onExpand;
    this.container = null;
    this.collapsedButton = null;
    this.closeButton = null;
    this.host = null;
    this.shadowWrapper = null;
  }

  /**
   * Create and inject the floating button elements into the page
   */
  create() {
    // Create a dedicated host and Shadow DOM for isolation
    if (!this.host) {
      this.host = document.createElement('div');
      this.host.id = 'chatbot-floating-button-host';
      document.body.appendChild(this.host);
    }

    // If Shadow DOM is supported, isolate styles; otherwise fall back to light DOM
    if (this.host.attachShadow) {
      this.shadowWrapper = new ShadowDOMWrapper(this.host);
      // Override generic wrapper containment so fixed-position content isn't clipped
      this.shadowWrapper.injectStyles(':host{ contain: none !important; }');
      // Build collapsed button inside shadow root
      this.collapsedButton = document.createElement('div');
      this.collapsedButton.id = 'chatbot-widget-collapsed';
      this.collapsedButton.className = `chatbot-widget-collapsed chatbot-widget-${this.config.position}`;
      this.collapsedButton.style.display = 'none';

      const button = document.createElement('button');
      button.className = 'chatbot-collapsed-button';
      button.title = 'Open Chat';
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
          <circle cx="7" cy="9" r="1" fill="currentColor"/>
          <circle cx="12" cy="9" r="1" fill="currentColor"/>
          <circle cx="17" cy="9" r="1" fill="currentColor"/>
        </svg>
        <span class="chatbot-collapsed-text">Chat</span>
      `;

      const allowClose = this.config && this.config.allowFloatingButtonClose !== false;

      this.collapsedButton.appendChild(button);
      if (allowClose) {
        this.closeButton = document.createElement('button');
        this.closeButton.className = 'chatbot-close-button';
        this.closeButton.title = 'Close';
        this.closeButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
          </svg>
        `;
        this.collapsedButton.appendChild(this.closeButton);
      }

      // Event listeners
      button.addEventListener('click', () => this.handleExpand());
      if (allowClose && this.closeButton) {
        this.closeButton.addEventListener('click', (e) => this.handleClose(e));
      }

      // Inject styles into shadow root
      this.injectStyles(true);
      this.shadowWrapper.appendChild(this.collapsedButton);

      return this.collapsedButton;
    }

    // Fallback: light DOM (older browsers)
    this.collapsedButton = document.createElement('div');
    this.collapsedButton.id = 'chatbot-widget-collapsed';
    this.collapsedButton.className = `chatbot-widget-collapsed chatbot-widget-${this.config.position}`;
    this.collapsedButton.style.display = 'none';

    const button = document.createElement('button');
    button.className = 'chatbot-collapsed-button';
    button.title = 'Open Chat';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
        <circle cx="7" cy="9" r="1" fill="currentColor"/>
        <circle cx="12" cy="9" r="1" fill="currentColor"/>
        <circle cx="17" cy="9" r="1" fill="currentColor"/>
      </svg>
      <span class="chatbot-collapsed-text">Chat</span>
    `;

    const allowClose = this.config && this.config.allowFloatingButtonClose !== false;

    this.collapsedButton.appendChild(button);
    if (allowClose) {
      this.closeButton = document.createElement('button');
      this.closeButton.className = 'chatbot-close-button';
      this.closeButton.title = 'Close';
      this.closeButton.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
        </svg>
      `;
      this.collapsedButton.appendChild(this.closeButton);
    }

    button.addEventListener('click', () => this.handleExpand());
    if (allowClose && this.closeButton) {
      this.closeButton.addEventListener('click', (e) => this.handleClose(e));
    }

    this.injectStyles(false);
    this.host.appendChild(this.collapsedButton);
    return this.collapsedButton;
  }

  /**
   * Handle expand button click
   */
  handleExpand() {
    this.hide();
    if (this.onExpand) {
      this.onExpand();
    }
  }

  /**
   * Handle close button click
   */
  handleClose(event) {
    event.stopPropagation();
    this.hide();
    // Save closed state
    this.saveState('closed');
  }

  /**
   * Show the collapsed button
   */
  show() {
    if (this.collapsedButton) {
      this.collapsedButton.style.display = 'flex';
      this.saveState('collapsed');
    }
  }

  /**
   * Hide the collapsed button
   */
  hide() {
    if (this.collapsedButton) {
      this.collapsedButton.style.display = 'none';
    }
  }

  /**
   * Check if button is visible
   */
  isVisible() {
    return this.collapsedButton && this.collapsedButton.style.display !== 'none';
  }

  /**
   * Save state to localStorage
   */
  saveState(state) {
    try {
      const siteKey = this.config.siteKey || 'default';
      const domain = window.location.hostname;
      const stateKey = `chatbot-widget-state-${siteKey}-${domain}`;
      localStorage.setItem(stateKey, state);
    } catch (e) {
      console.warn('Failed to save widget state:', e);
    }
  }

  /**
   * Get saved state from localStorage
   */
  getSavedState() {
    try {
      const siteKey = this.config.siteKey || 'default';
      const domain = window.location.hostname;
      const stateKey = `chatbot-widget-state-${siteKey}-${domain}`;
      return localStorage.getItem(stateKey);
    } catch (e) {
      console.warn('Failed to load widget state:', e);
      return null;
    }
  }

  /**
   * Inject styles for the floating button
   */
  injectStyles(inShadow = false) {
    const css = `
      .chatbot-widget-collapsed {
        position: fixed;
        z-index: 2147483645; /* Ensure above common site overlays */
        display: flex;
        align-items: center;
        gap: 8px;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        pointer-events: auto;
      }

      .chatbot-collapsed-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: #ffffff;
        color: #374151;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 50px;
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;
      }

      .chatbot-collapsed-button:hover {
        background: #f9fafb;
        transform: translateY(-1px);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
      }

      .chatbot-collapsed-button svg {
        flex-shrink: 0;
      }

      .chatbot-close-button {
        width: 28px;
        height: 28px;
        min-width: 28px;
        min-height: 28px;
        padding: 0; /* prevent host styles stretching the button */
        line-height: 0; /* avoid inherited line-height affecting layout */
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none !important;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        box-sizing: border-box;
      }

      .chatbot-close-button:hover {
        background: rgba(0, 0, 0, 0.8);
        transform: scale(1.1);
      }

      /* Ensure icons render even if host page globally overrides SVG fills */
      .chatbot-close-button svg {
        width: 14px;
        height: 14px;
        display: block;
        pointer-events: none;
      }
      .chatbot-close-button svg path { fill: currentColor !important; }
      .chatbot-collapsed-button svg path { fill: currentColor !important; }

      /* Position classes */
      .chatbot-widget-bottom-right {
        bottom: 24px;
        right: 24px;
      }

      .chatbot-widget-bottom-left {
        bottom: 24px;
        left: 24px;
      }

      .chatbot-widget-top-right {
        top: 24px;
        right: 24px;
      }

      .chatbot-widget-top-left {
        top: 24px;
        left: 24px;
      }

      /* Responsive adjustments */
      @media (max-width: 600px) {
        .chatbot-widget-collapsed {
          bottom: 16px !important;
          right: 16px !important;
          left: auto !important;
          top: auto !important;
          /* Safe-area support for iOS */
          bottom: calc(16px + env(safe-area-inset-bottom)) !important;
          right: calc(16px + env(safe-area-inset-right)) !important;
        }

        .chatbot-collapsed-button {
          padding: 10px 14px;
          font-size: 13px;
        }

        .chatbot-collapsed-text {
          display: none;
        }

        .chatbot-close-button {
          width: 24px;
          height: 24px;
        }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .chatbot-collapsed-button {
          background: #1f2937;
          color: #f9fafb;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .chatbot-collapsed-button:hover {
          background: #111827;
        }
      }
    `;
    if (inShadow && this.shadowWrapper) {
      this.shadowWrapper.injectStyles(css);
    } else {
      // Light DOM fallback: dedupe style injection
      if (document.getElementById('chatbot-floating-button-styles')) return;
      const style = document.createElement('style');
      style.id = 'chatbot-floating-button-styles';
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  /**
   * Destroy the floating button
   */
  destroy() {
    if (this.host && this.host.parentNode) {
      this.host.parentNode.removeChild(this.host);
    }
    // Remove global style only if we were in light DOM and no other widget uses it
    const style = document.getElementById('chatbot-floating-button-styles');
    if (style && !document.querySelector('.chatbot-widget-collapsed')) {
      style.remove();
    }
  }
}

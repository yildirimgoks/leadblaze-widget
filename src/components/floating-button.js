/**
 * FloatingButton Component
 * Creates a collapsible floating chat button with expand/collapse functionality
 */

export class FloatingButton {
  constructor(config, onExpand) {
    this.config = config;
    this.onExpand = onExpand;
    this.container = null;
    this.collapsedButton = null;
    this.closeButton = null;
  }

  /**
   * Create and inject the floating button elements into the page
   */
  create() {
    // Create collapsed button container
    this.collapsedButton = document.createElement('div');
    this.collapsedButton.id = 'chatbot-widget-collapsed';
    this.collapsedButton.className = `chatbot-widget-collapsed chatbot-widget-${this.config.position}`;
    this.collapsedButton.style.display = 'none'; // Initially hidden

    // Create the button with icon and text
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

    // Create close button (small X icon)
    this.closeButton = document.createElement('button');
    this.closeButton.className = 'chatbot-close-button';
    this.closeButton.title = 'Close';
    this.closeButton.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
      </svg>
    `;

    this.collapsedButton.appendChild(button);
    this.collapsedButton.appendChild(this.closeButton);

    // Setup event listeners
    button.addEventListener('click', () => this.handleExpand());
    this.closeButton.addEventListener('click', (e) => this.handleClose(e));

    // Inject styles
    this.injectStyles();

    // Append to body
    document.body.appendChild(this.collapsedButton);

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
  injectStyles() {
    // Check if styles already exist
    if (document.getElementById('chatbot-floating-button-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'chatbot-floating-button-styles';
    style.textContent = `
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
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .chatbot-close-button:hover {
        background: rgba(0, 0, 0, 0.8);
        transform: scale(1.1);
      }

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

    document.head.appendChild(style);
  }

  /**
   * Destroy the floating button
   */
  destroy() {
    if (this.collapsedButton && this.collapsedButton.parentNode) {
      this.collapsedButton.parentNode.removeChild(this.collapsedButton);
    }

    // Remove styles if no other floating widgets exist
    const style = document.getElementById('chatbot-floating-button-styles');
    if (style && !document.querySelector('.chatbot-widget-collapsed')) {
      style.remove();
    }
  }
}

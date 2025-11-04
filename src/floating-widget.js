import { ChatbotWidget } from './chatbot-widget.js';
import { FloatingButton } from './components/floating-button.js';

/**
 * FloatingChatbotWidget
 * Wrapper that manages the floating button and chat widget container
 */
export class FloatingChatbotWidget {
  constructor() {
    this.chatWidget = null;
    this.floatingButton = null;
    this.container = null;
    this.config = null;
    this.isInitialized = false;
    this._initScheduled = false;
    this._scrollLock = { locked: false, y: 0 };
  }

  /**
   * Initialize the floating widget with config
   */
  init(config) {
    if (this.isInitialized) {
      console.warn('FloatingChatbotWidget already initialized, reinitializing...');
      this.unmount();
    }

    // Validate required fields
    if (!config.clientId) {
      throw new Error('clientId is required');
    }

    if (!config.siteKey) {
      throw new Error('siteKey is required');
    }

    // Persist normalized config
    this.config = {
      clientId: config.clientId,
      siteKey: config.siteKey,
      sessionId: config.sessionId,
      theme: config.theme || 'light',
      themeMode: config.themeMode,
      locale: config.locale || 'en',
      apiEndpoint: config.apiEndpoint || 'https://leadgate-backend-production.up.railway.app/chat',
      greetingMessage: config.greetingMessage || 'Hi, how can I help you?',
      position: config.position || 'bottom-right',
      floatingDefaultState: config.floatingDefaultState || 'expanded',
      // Controls how the floating button behaves on mobile (<=600px)
      // 'auto' (default): treat saved 'closed' as 'collapsed' to ensure visibility
      // 'respect-saved': use saved state as-is on mobile
      // 'force-collapsed': always collapsed on mobile
      // 'force-closed': always closed on mobile
      mobileStatePolicy: config.mobileStatePolicy || 'auto',
      skipGreeting: config.skipGreeting
    };

    // Ensure DOM is ready before manipulating body
    if (!this._isDomReady()) {
      if (!this._initScheduled) {
        this._initScheduled = true;
        const run = () => {
          // Guard against multiple triggers
          if (this.isInitialized) return;
          this._performInit();
        };
        document.addEventListener('DOMContentLoaded', run, { once: true });
        // Fallback for cases where DOMContentLoaded has already fired but body wasn't ready
        window.addEventListener('load', run, { once: true });
      }
      return; // Defer actual initialization
    }

    // DOM is ready; perform initialization now
    this._performInit();
  }

  /**
   * Internal: performs initialization after DOM is available
   */
  _performInit() {
    // Create or reuse the floating container
    this.createContainer();

    // Initialize floating button
    this.floatingButton = new FloatingButton(this.config, () => this.handleExpand());

    // Determine initial state with mobile policy
    const savedState = this.floatingButton.getSavedState();
    const initialState = this._resolveInitialState(savedState);

    // Initialize based on state
    if (initialState === 'collapsed') {
      this.floatingButton.create();
      this.floatingButton.show();
      this.container.style.display = 'none';
      this._applySheet(false);
      this._unlockScroll();
    } else if (initialState === 'closed') {
      this.floatingButton.create();
      this.floatingButton.hide();
      this.container.style.display = 'none';
      this._applySheet(false);
      this._unlockScroll();
    } else {
      // expanded
      this.floatingButton.create();
      this.initializeChatWidget();
      this.container.style.display = 'block';
      // Mobile: use full-screen sheet and lock background scroll
      this._applySheet(this._isMobile());
      if (this._isMobile()) this._lockScroll();
    }

    this.isInitialized = true;
    this._initScheduled = false;
    console.log('FloatingChatbotWidget initialized with state:', initialState);
  }

  /**
   * Detects whether DOM is ready for body manipulation
   */
  _isDomReady() {
    return !!document.body && document.readyState !== 'loading';
  }

  /**
   * Basic mobile detection based on viewport width
   */
  _isMobile() {
    try {
      return window.matchMedia && window.matchMedia('(max-width: 600px)').matches;
    } catch (_) {
      return window.innerWidth <= 600;
    }
  }

  /**
   * Resolve initial state based on saved state, defaults, and mobile policy
   */
  _resolveInitialState(savedState) {
    // Non-mobile: simple saved or default
    if (!this._isMobile()) {
      return savedState || this.config.floatingDefaultState;
    }

    const policy = this.config.mobileStatePolicy || 'auto';
    switch (policy) {
      case 'respect-saved':
        return savedState || this.config.floatingDefaultState;
      case 'force-collapsed':
        return 'collapsed';
      case 'force-closed':
        return 'closed';
      case 'auto':
      default:
        // Default: ensure visibility by downgrading 'closed' to 'collapsed'
        if (savedState === 'closed') return 'collapsed';
        return savedState || this.config.floatingDefaultState;
    }
  }

  /**
   * Create the floating container element
   */
  createContainer() {
    // Reuse existing container if present (avoid duplicates)
    const existing = document.getElementById('chatbot-widget-container');
    if (existing) {
      this.container = existing;
    } else {
      this.container = document.createElement('div');
      this.container.id = 'chatbot-widget-container';
      this.container.className = `chatbot-widget-floating chatbot-widget-${this.config.position}`;
      this.container.style.display = 'none'; // Initially hidden

      // Inject container styles
      this.injectContainerStyles();

      // Note: Minimize button is created inside the chat widget's Shadow DOM (chat-ui.js)
      // and uses the onCollapse callback passed in config

      document.body.appendChild(this.container);
    }
  }

  /**
   * Initialize the chat widget inside the container
   */
  initializeChatWidget() {
    if (this.chatWidget) {
      return; // Already initialized
    }

    this.chatWidget = new ChatbotWidget();
    this.chatWidget.init({
      ...this.config,
      container: this.container,
      isFloating: true, // Flag to indicate this is a floating widget
      onCollapse: () => this.handleCollapse() // Pass collapse handler
    });
  }

  /**
   * Handle expand from collapsed state
   */
  handleExpand() {
    // Hide floating button
    this.floatingButton.hide();

    // Show container
    this.container.style.display = 'block';

    // Initialize chat widget if not already done
    if (!this.chatWidget) {
      this.initializeChatWidget();
    }

    // Mobile: enter sheet mode and lock background scroll
    const isMobile = this._isMobile();
    this._applySheet(isMobile);
    if (isMobile) this._lockScroll();

    // Save expanded state
    this.saveState('expanded');
  }

  /**
   * Handle collapse from expanded state
   */
  handleCollapse() {
    // Hide container
    this.container.style.display = 'none';

    // Show floating button
    this.floatingButton.show();

    // Exit sheet mode and unlock background scroll
    this._applySheet(false);
    this._unlockScroll();
    this.saveState('collapsed');
  }

  /**
   * Send a message programmatically
   */
  send(message) {
    if (!this.chatWidget) {
      throw new Error('Chat widget not initialized');
    }
    return this.chatWidget.send(message);
  }

  /**
   * Inject history into the chat
   */
  injectHistory(history) {
    if (!this.chatWidget) {
      // Initialize widget first if trying to inject history
      this.initializeChatWidget();
    }
    return this.chatWidget.injectHistory(history);
  }

  /**
   * Get the chat widget instance
   */
  getChatWidget() {
    return this.chatWidget;
  }

  /**
   * Save widget state
   */
  saveState(state) {
    if (this.floatingButton) {
      this.floatingButton.saveState(state);
    }
  }

  /**
   * Toggle full-screen sheet mode for the floating container (mobile only)
   */
  _applySheet(enable) {
    if (!this.container) return;
    if (enable) {
      this.container.classList.add('is-sheet');
    } else {
      this.container.classList.remove('is-sheet');
    }
  }

  /**
   * Prevent page behind the widget from scrolling while sheet is open
   */
  _lockScroll() {
    try {
      if (this._scrollLock.locked) return;
      this._scrollLock.y = window.scrollY || window.pageYOffset || 0;
      const body = document.body;
      body.style.top = `-${this._scrollLock.y}px`;
      body.style.position = 'fixed';
      body.style.width = '100%';
      body.style.overflow = 'hidden';
      this._scrollLock.locked = true;
    } catch (_) {}
  }

  _unlockScroll() {
    try {
      if (!this._scrollLock.locked) return;
      const body = document.body;
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.overflow = '';
      window.scrollTo(0, this._scrollLock.y || 0);
      this._scrollLock.locked = false;
    } catch (_) {}
  }

  /**
   * Inject styles for the floating container
   */
  injectContainerStyles() {
    // Check if styles already exist
    if (document.getElementById('chatbot-floating-container-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'chatbot-floating-container-styles';
    style.textContent = `
      .chatbot-widget-floating {
        position: fixed;
        z-index: 2147483646; /* Above the button and common overlays */
        width: 380px;
        height: 600px;
        max-width: calc(100vw - 48px);
        max-height: calc(100vh - 48px);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
                   0 2px 8px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        backdrop-filter: blur(10px);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }

      /* Prefer dynamic viewport units when available */
      @supports (height: 100dvh) {
        .chatbot-widget-floating {
          max-height: calc(100dvh - 48px);
        }
      }

      /* Position classes */
      .chatbot-widget-floating.chatbot-widget-bottom-right {
        bottom: 24px;
        right: 24px;
      }

      .chatbot-widget-floating.chatbot-widget-bottom-left {
        bottom: 24px;
        left: 24px;
      }

      .chatbot-widget-floating.chatbot-widget-top-right {
        top: 24px;
        right: 24px;
      }

      .chatbot-widget-floating.chatbot-widget-top-left {
        top: 24px;
        left: 24px;
      }

      /* Mobile responsive */
      @media (max-width: 600px) {
        /* Standard compact mode when not sheet */
        .chatbot-widget-floating {
          width: calc(100vw - 32px);
          height: calc(100vh - 120px);
          max-width: none;
          bottom: 16px !important;
          right: 16px !important;
          left: 16px !important;
          top: auto !important;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          /* Safe-area support for iOS */
          bottom: calc(16px + env(safe-area-inset-bottom)) !important;
          right: calc(16px + env(safe-area-inset-right)) !important;
          left: calc(16px + env(safe-area-inset-left)) !important;
        }
        @supports (height: 100dvh) {
          .chatbot-widget-floating {
            height: calc(100dvh - 120px);
          }
        }

        /* Full-screen sheet variant when expanded */
        .chatbot-widget-floating.is-sheet {
          position: fixed;
          inset: 0 !important; /* ensure no visible gaps around edges */
          width: auto;
          height: auto;
          max-width: none;
          max-height: none;
          min-height: 100vh;
          border-radius: 0;
          box-shadow: none;
          background: #ffffff;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }
        @supports (height: 100dvh) {
          .chatbot-widget-floating.is-sheet {
            min-height: 100dvh;
          }
        }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .chatbot-widget-floating {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25),
                     0 2px 8px rgba(0, 0, 0, 0.15),
                     0 0 0 1px rgba(255, 255, 255, 0.05);
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Unmount and destroy the floating widget
   */
  unmount() {
    if (!this.isInitialized) {
      return;
    }

    // Destroy chat widget
    if (this.chatWidget) {
      this.chatWidget.unmount();
      this.chatWidget = null;
    }

    // Destroy floating button
    if (this.floatingButton) {
      this.floatingButton.destroy();
      this.floatingButton = null;
    }

    // Remove container
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }

    // Remove container styles
    const style = document.getElementById('chatbot-floating-container-styles');
    if (style) {
      style.remove();
    }

    this.isInitialized = false;
    console.log('FloatingChatbotWidget unmounted successfully');
    // Ensure scroll is unlocked if it was locked
    this._applySheet(false);
    this._unlockScroll();
  }
}

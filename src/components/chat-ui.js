import { Message } from './message.js';
import { ChatInput } from './chat-input.js';
import { HistoryAPI } from '../utils/history-api.js';

export class ChatUI {
  constructor(shadowWrapper, config, chatAPI) {
    this.shadowWrapper = shadowWrapper;
    this.config = config;
    this.chatAPI = chatAPI;
    this.messages = [];
    this.isAtBottom = true;
    this.intersectionObserver = null;
    this._sheetOpen = false;
    this._scrollLock = { locked: false, y: 0 };
    this._lastFocusBeforeSheet = null;
    
    // Initialize history API for backend-based conversation history
    this.historyAPI = new HistoryAPI(config);
    
    this.createElement();
    this.setupScrollObserver();
    this.applyTheme();
    
    // Add entrance animation and focus input
    requestAnimationFrame(() => {
      this.container.classList.add('chatbot-widget--visible');
    });
    
    // Do not auto-focus the input on initialization to avoid page auto-scroll

    // Setup mobile viewport/keyboard behavior
    this.setupMobileViewportHandlers();

    // Smart expand prompt for embedded widgets on constrained height
    if (!this.config.isFloating && this.shouldShowExpandAffordance()) {
      this.addExpandPrompt();
    }
    
    // Show greeting if no history will be injected
    if (!config.skipGreeting) {
      this.showGreeting();
    }
  }

  createElement() {
    const container = document.createElement('div');
    container.className = 'chatbot-widget';
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-label', 'Chat conversation');
    container.setAttribute('aria-labelledby', 'chatbot-widget-title');
    
    // Header
    const header = document.createElement('div');
    header.className = 'chatbot-widget__header';

    // Check if this is a floating widget using the isFloating flag
    const isFloating = this.config.isFloating === true;
    console.log('ChatUI: isFloating =', isFloating, 'config.isFloating =', this.config.isFloating);
    // Title
    const title = document.createElement('h2');
    title.className = 'chatbot-widget__title';
    title.textContent = 'Contact us';
    title.id = 'chatbot-widget-title';
    header.appendChild(title);

    // Floating: collapse button; Embedded on mobile: expand/collapse toggle
    if (isFloating) {
      const collapseBtn = document.createElement('button');
      collapseBtn.className = 'chatbot-widget__collapse-btn';
      collapseBtn.title = 'Minimize';
      collapseBtn.setAttribute('aria-label', 'Minimize chat');
      collapseBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 8H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
      header.appendChild(collapseBtn);
      collapseBtn.addEventListener('click', () => {
        if (this.config.onCollapse && typeof this.config.onCollapse === 'function') {
          this.config.onCollapse();
        } else {
          this.collapseWidget();
        }
      });
    } else if (this.isMobileLike()) {
      // Embedded mobile header toggle button
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'chatbot-widget__expand-btn';
      toggleBtn.title = 'Expand';
      toggleBtn.setAttribute('aria-label', 'Expand chat');
      toggleBtn.innerHTML = this._getExpandIcon();
      header.appendChild(toggleBtn);
      this.headerToggleBtn = toggleBtn;
      toggleBtn.addEventListener('click', () => {
        if (this._sheetOpen) {
          this.closeEmbeddedSheet();
        } else {
          this._lastFocusBeforeSheet = toggleBtn;
          this.openEmbeddedSheet();
        }
      });
    }
    
    // Messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'chatbot-widget__messages';
    messagesContainer.setAttribute('aria-live', 'polite');
    messagesContainer.setAttribute('aria-label', 'Chat messages');
    
    // Input
    this.chatInput = new ChatInput((message) => this.sendMessage(message));
    
    // Error toast
    this.errorToast = this.createErrorToast();
    
    container.appendChild(header);
    container.appendChild(messagesContainer);
    container.appendChild(this.chatInput.getElement());
    container.appendChild(this.errorToast);
    
    this.shadowWrapper.appendChild(container);
    this.container = container;
    this.messagesContainer = messagesContainer;
    
    // Setup floating widget functionality if needed
    if (isFloating) {
      this.setupFloatingWidget();
    }
    // Focus trap for floating sheet on mobile
    if (isFloating && this.isMobileLike()) {
      this._enableFocusTrap();
    }
    
    // Widget is now ready for history injection if needed
  }

  shouldShowExpandAffordance() {
    try {
      const threshold = typeof this.config.autoSuggestExpandBelowPx === 'number' ? this.config.autoSuggestExpandBelowPx : 420;
      const host = this.shadowWrapper && this.shadowWrapper.container ? this.shadowWrapper.container : null;
      if (!host) return false;
      const rect = host.getBoundingClientRect();
      return this.isMobileLike() && rect.height > 0 && rect.height < threshold;
    } catch (_) {
      return false;
    }
  }

  addExpandPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'chatbot-expand-prompt';
    const text = document.createElement('span');
    text.className = 'chatbot-expand-prompt__text';
    text.textContent = 'Open full screen for a better view';
    const btn = document.createElement('button');
    btn.className = 'chatbot-expand-prompt__btn';
    btn.textContent = 'Expand';
    btn.addEventListener('click', () => {
      this._lastFocusBeforeSheet = btn;
      this.openEmbeddedSheet();
    });
    prompt.appendChild(text);
    prompt.appendChild(btn);
    // Insert after header
    const header = this.container.querySelector('.chatbot-widget__header');
    if (header) {
      header.insertAdjacentElement('afterend', prompt);
    } else {
      this.container.prepend(prompt);
    }
  }

  injectHistory(history) {
    // Clear any existing messages first
    this.clearMessages();
    
    // Validate and process each message in the history
    if (history.length > 0) {
      history.forEach((msgData, index) => {
        if (msgData && msgData.content && msgData.sender && msgData.content.trim()) {
          // Map 'ai' sender from backend to 'bot' for UI consistency
          const uiSender = msgData.sender === 'ai' ? 'bot' : msgData.sender;
          const message = new Message(msgData.content, uiSender);
          this.addMessageToUI(message);
        }
      });
      
      // Scroll to bottom after injecting history
      setTimeout(() => {
        this.scrollToBottom();
      }, 50);
    }
  }
  
  clearMessages() {
    // Remove all messages from the UI
    this.messages.forEach(message => {
      const element = message.getElement();
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    
    // Clear the messages array
    this.messages = [];
  }

  createErrorToast() {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    
    const message = document.createElement('span');
    message.className = 'error-toast__message';
    
    const retryButton = document.createElement('button');
    retryButton.className = 'error-toast__retry';
    retryButton.textContent = 'Retry';
    retryButton.addEventListener('click', () => this.hideErrorToast());
    
    const closeButton = document.createElement('button');
    closeButton.className = 'error-toast__close';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close error');
    closeButton.addEventListener('click', () => this.hideErrorToast());
    
    toast.appendChild(message);
    toast.appendChild(retryButton);
    toast.appendChild(closeButton);
    
    return toast;
  }

  setupScrollObserver() {
    // Create a sentinel element at the bottom of messages
    const sentinel = document.createElement('div');
    sentinel.className = 'scroll-sentinel';
    this.messagesContainer.appendChild(sentinel);
    
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          this.isAtBottom = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    
    this.intersectionObserver.observe(sentinel);
  }

  setupMobileViewportHandlers() {
    const textarea = this.chatInput && this.chatInput.getTextarea ? this.chatInput.getTextarea() : null;
    if (!textarea) return;

    // Track visual viewport changes while the input is focused on mobile/tablet
    this._vvHandlers = {
      onFocus: () => {
        if (!this.isMobileLike()) return;
        // Clear any pending blur timeout
        if (this._blurTimeout) {
          clearTimeout(this._blurTimeout);
          this._blurTimeout = null;
        }
        this.enableViewportTracking();
        // Ensure latest messages are visible when keyboard opens
        this.scrollToBottom();
        // Run again after keyboard animation
        setTimeout(() => this.scrollToBottom(), 250);
        // Optional: auto-expand embedded sheet on focus when constrained or configured
        try {
          if (!this.config.isFloating && this.config.mobileMode === 'sheet') {
            const host = this.shadowWrapper && this.shadowWrapper.container ? this.shadowWrapper.container : null;
            if (host) {
              const rect = host.getBoundingClientRect();
              const limit = typeof this.config.autoExpandBelowPx === 'number' ? this.config.autoExpandBelowPx : null;
              if (limit && rect.height > 0 && rect.height < limit) {
                this._lastFocusBeforeSheet = textarea;
                this.openEmbeddedSheet();
              } else if (this.config.expandOnFocus === true) {
                this._lastFocusBeforeSheet = textarea;
                this.openEmbeddedSheet();
              }
            }
          }
        } catch (_) {}
      },
      onBlur: () => {
        if (!this.isMobileLike()) return;
        // Don't disable viewport tracking immediately on blur
        // User might be tapping outside the input temporarily (e.g., scrolling)
        // Only disable after a delay to confirm keyboard is actually closing
        this._blurTimeout = setTimeout(() => {
          this.disableViewportTracking();
          this._blurTimeout = null;
        }, 300);
      }
    };

    textarea.addEventListener('focus', this._vvHandlers.onFocus);
    textarea.addEventListener('blur', this._vvHandlers.onBlur);
  }

  enableViewportTracking() {
    const vv = window.visualViewport;
    const apply = () => {
      // Only keep the latest messages visible; avoid resizing the widget to vv-height
      // Resizing the container causes jumpy layout in some browsers/devtools
      try { this.scrollToBottom(); } catch (_) {}
    };
    // Save listeners so we can remove them
    this._vvApply = apply;
    apply();
    if (vv) {
      vv.addEventListener('resize', apply);
      vv.addEventListener('scroll', apply);
    } else {
      // Fallback: listen to window resize
      window.addEventListener('resize', apply);
    }
  }

  disableViewportTracking() {
    const vv = window.visualViewport;
    if (this._vvApply) {
      if (vv) {
        vv.removeEventListener('resize', this._vvApply);
        vv.removeEventListener('scroll', this._vvApply);
      } else {
        window.removeEventListener('resize', this._vvApply);
      }
    }
    this._vvApply = null;
  }

  isMobileLike() {
    try {
      return (
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
        (window.matchMedia && window.matchMedia('(max-width: 768px)').matches)
      );
    } catch (e) {
      const ua = navigator.userAgent || '';
      return /Mobi|Android|iPad|iPhone|iPod/i.test(ua);
    }
  }

  async sendMessage(messageText) {
    // Guard against destroyed state
    if (!this.chatInput) {
      console.warn('ChatUI has been destroyed, cannot send message');
      return;
    }
    
    try {
      // Add user message to UI
      const userMessage = new Message(messageText, 'user');
      this.addMessage(userMessage);
      
      // Create loading bot message immediately
      const loadingBotMessage = Message.createLoadingMessage();
      this.addMessage(loadingBotMessage);
      
      // Disable input and scroll to bottom
      if (this.chatInput) {
        this.chatInput.disable();
      }
      this.scrollToBottom();
      
      // Send to API (backend handles persistence)
      const response = await this.chatAPI.sendMessage(messageText);

      // Update the loading message with actual content
      loadingBotMessage.updateContent(response.content);

      // Dispatch custom event if lead was saved
      if (response.lead_saved === true) {
        this.dispatchLeadSavedEvent();
      }

      // That's it! Backend handles all persistence, no client-side saving needed
      
    } catch (error) {
      // Remove the loading message and show error
      this.removeLastMessage();
      this.showErrorToast(error.message);
    } finally {
      if (this.chatInput) {
        this.chatInput.enable();
        // Do not auto-focus on mobile to avoid sticky keyboard
        if (!this.isMobileLike()) {
          this.chatInput.focus();
        }
      }
    }
  }

  addMessage(message) {
    // Add new message to UI (for real-time messages)
    this.addMessageToUI(message);
  }

  addMessageToUI(message) {
    // Simply add message to UI without any persistence logic
    console.log('ChatbotWidget: addMessageToUI called with message:', message);
    console.log('ChatbotWidget: Current messages array length before add:', this.messages.length);
    console.log('ChatbotWidget: Messages container exists:', !!this.messagesContainer);
    
    this.messages.push(message);
    
    const messageElement = message.getElement();
    console.log('ChatbotWidget: Got message element:', messageElement);
    console.log('ChatbotWidget: Messages container children before insert:', this.messagesContainer.children.length);
    
    this.messagesContainer.insertBefore(
      messageElement,
      this.messagesContainer.lastElementChild // Insert before sentinel
    );
    
    console.log('ChatbotWidget: Messages container children after insert:', this.messagesContainer.children.length);
    console.log('ChatbotWidget: Current messages array length after add:', this.messages.length);
    
    if (this.isAtBottom) {
      console.log('ChatbotWidget: Scrolling to bottom');
      this.scrollToBottom();
    }
  }

  removeLastMessage() {
    if (this.messages.length === 0) return;
    const lastMessage = this.messages[this.messages.length - 1];
    // Only remove the last message if it's a loading placeholder
    if (lastMessage && lastMessage.isLoading) {
      this.messages.pop();
      const lastElement = lastMessage.getElement();
      if (lastElement && lastElement.parentNode) {
        lastElement.parentNode.removeChild(lastElement);
      }
    }
  }

  scrollToBottom() {
    const container = this.messagesContainer;
    container.scrollTop = container.scrollHeight;
  }

  showErrorToast(message) {
    const messageElement = this.errorToast.querySelector('.error-toast__message');
    messageElement.textContent = message;
    this.errorToast.classList.add('error-toast--visible');
    
    // Auto-hide after 5 seconds
    setTimeout(() => this.hideErrorToast(), 5000);
  }

  hideErrorToast() {
    this.errorToast.classList.remove('error-toast--visible');
  }

  applyTheme() {
    const theme = this.config.theme;
    if (theme === 'dark') {
      this.container.classList.add('chatbot-widget--dark');
    } else if (theme === 'light') {
      this.container.classList.add('chatbot-widget--light');
    } else if (typeof theme === 'string' && theme.startsWith('#')) {
      // Custom theme color - generate a complete theme palette
      this.applyCustomTheme(theme);
    }
  }

  applyCustomTheme(primaryColor) {
    // Generate complementary colors for the custom theme
    const customTheme = this.generateCustomTheme(primaryColor, this.config.themeMode);
    
    // Apply all the custom theme variables
    Object.entries(customTheme).forEach(([property, value]) => {
      this.container.style.setProperty(property, value);
    });
  }

  generateCustomTheme(primaryColor, explicitMode = null) {
    // Parse the hex color to RGB
    const rgb = this.hexToRgb(primaryColor);
    
    // Determine if we should use light or dark theme
    let isLight;
    if (explicitMode) {
      // Use explicit mode if provided
      isLight = explicitMode === 'light';
    } else {
      // Fall back to auto-detection based on luminance
      const luminance = this.calculateLuminance(rgb.r, rgb.g, rgb.b);
      isLight = luminance > 0.5;
    }
    
    // Generate hover color (slightly darker for light themes, lighter for dark themes)
    const hoverColor = this.adjustBrightness(primaryColor, isLight ? -0.15 : 0.15);
    
    // Generate theme colors with good contrast
    return {
      '--primary-color': primaryColor,
      '--primary-hover': hoverColor,
      '--background-color': isLight ? '#ffffff' : '#1a1a1a',
      '--surface-color': isLight ? '#f8f9fa' : '#2d2d2d',
      '--text-primary': isLight ? '#1a1a1a' : '#ffffff',
      '--text-secondary': isLight ? '#6c757d' : '#b0b0b0',
      '--border-color': isLight ? '#e9ecef' : '#404040',
      '--shadow-light': isLight ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.3)',
      '--shadow-medium': isLight ? '0 4px 16px rgba(0, 0, 0, 0.15)' : '0 4px 16px rgba(0, 0, 0, 0.4)'
    };
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  calculateLuminance(r, g, b) {
    // Convert RGB to relative luminance
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  adjustBrightness(hex, factor) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    
    const adjust = (value) => {
      const adjusted = Math.round(value * (1 + factor));
      return Math.max(0, Math.min(255, adjusted));
    };
    
    const r = adjust(rgb.r);
    const g = adjust(rgb.g);
    const b = adjust(rgb.b);
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  async loadConversationHistory() {
    try {
      const history = await this.historyAPI.getConversationHistory();
      
      if (history.length > 0) {
        // Add each message from history
        history.forEach((msgData, index) => {
          if (msgData && msgData.content && msgData.sender && msgData.content.trim()) {
            // Map 'ai' sender from backend to 'bot' for UI consistency
            const uiSender = msgData.sender === 'ai' ? 'bot' : msgData.sender;
            const message = new Message(msgData.content, uiSender);
            this.addMessageToUI(message); // Add to UI without saving (already saved on backend)
          }
        });
        
        // Scroll to bottom after loading messages
        this.scrollToBottom();
      } else {
        // No history, show greeting
        this.showGreeting();
      }
    } catch (error) {
      console.error('ChatbotWidget: Failed to load conversation history:', error);
      // Still show greeting even if history fails
      this.showGreeting();
    }
  }

  showGreeting() {
    if (this.config.greetingMessage && this.messages.length === 0) {
      const greetingMessage = new Message(this.config.greetingMessage, 'bot');
      this.addMessageToUI(greetingMessage); // Add to UI only, don't save greeting
    }
  }

  setupFloatingWidget() {
    // Setup collapse functionality
    const collapseBtn = this.container.querySelector('.chatbot-widget__collapse-btn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        // Call the onCollapse callback if provided (for standalone floating widget)
        if (this.config.onCollapse && typeof this.config.onCollapse === 'function') {
          this.config.onCollapse();
        } else {
          // Fallback for WordPress plugin compatibility
          this.collapseWidget();
        }
      });
    }

    // Setup collapsed button functionality (for WordPress plugin)
    const collapsedContainer = document.getElementById('chatbot-widget-collapsed');
    if (collapsedContainer) {
      const expandBtn = collapsedContainer.querySelector('.chatbot-collapsed-button');
      const closeBtn = collapsedContainer.querySelector('.chatbot-close-button');

      if (expandBtn) {
        expandBtn.addEventListener('click', () => this.expandWidget());
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeWidget());
      }
    }

    // Handle initial state with persistence (only for WordPress plugin)
    if (!this.config.onCollapse) {
      this.applyStoredState();
    }
  }

  // Embedded: open/close full-screen sheet
  openEmbeddedSheet() {
    if (this.config.isFloating) return;
    if (this._sheetOpen) return;
    const host = this.shadowWrapper && this.shadowWrapper.container ? this.shadowWrapper.container : null;
    if (!host) return;

    this._ensureEmbeddedSheetStyles();
    host.classList.add('chatbot-embedded-sheet');
    // A11y: modal semantics
    this.container.setAttribute('aria-modal', 'true');
    this.container.setAttribute('aria-labelledby', 'chatbot-widget-title');
    // Lock background scroll
    this._lockScroll();
    // Focus trap
    this._enableFocusTrap();
    this._sheetOpen = true;
    this._setHeaderToggleMode('collapse');
    this._setExpandPromptVisible(false);
  }

  closeEmbeddedSheet() {
    if (!this._sheetOpen) return;
    const host = this.shadowWrapper && this.shadowWrapper.container ? this.shadowWrapper.container : null;
    if (host) host.classList.remove('chatbot-embedded-sheet');
    this.container.removeAttribute('aria-modal');
    this._unlockScroll();
    this._disableFocusTrap();
    this._sheetOpen = false;
    // Return focus to trigger if available
    try { if (this._lastFocusBeforeSheet) this._lastFocusBeforeSheet.focus(); } catch (_) {}
    this._lastFocusBeforeSheet = null;
    this._setHeaderToggleMode('expand');
    this._setExpandPromptVisible(this.shouldShowExpandAffordance());
  }

  _ensureEmbeddedSheetStyles() {
    if (document.getElementById('chatbot-embedded-sheet-styles')) return;
    const style = document.createElement('style');
    style.id = 'chatbot-embedded-sheet-styles';
    style.textContent = `
      .chatbot-embedded-sheet {
        position: fixed !important;
        inset: 0 !important; /* cover entire viewport reliably */
        z-index: 2147483646 !important;
        background: transparent !important;
        /* Avoid 1-3px gaps on mobile browsers by relying on inset instead of 100vh */
        height: auto !important;
        min-height: 100vh !important;
      }
      @supports (height: 100dvh) {
        .chatbot-embedded-sheet { min-height: 100dvh !important; }
      }
    `;
    document.head.appendChild(style);
  }

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

  _enableFocusTrap() {
    if (this._trapHandler) return;
    this._trapHandler = (e) => {
      if (e.key !== 'Tab') return;
      const focusables = this._getFocusables();
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    this.container.addEventListener('keydown', this._trapHandler);
    // ESC to close (desktop)
    this._escHandler = (e) => {
      if (e.key === 'Escape' && !this.isMobileLike()) {
        if (this.config.isFloating && this.config.onCollapse) {
          this.config.onCollapse();
        } else {
          this.closeEmbeddedSheet();
        }
      }
    };
    window.addEventListener('keydown', this._escHandler);
  }

  _disableFocusTrap() {
    if (this._trapHandler) {
      this.container.removeEventListener('keydown', this._trapHandler);
      this._trapHandler = null;
    }
    if (this._escHandler) {
      window.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
  }

  _getFocusables() {
    try {
      const root = this.container;
      const nodes = root.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
      return Array.from(nodes).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
    } catch (_) {
      return [];
    }
  }

  _getExpandIcon() {
    return `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 14H5v5h5v-2H7v-3zm12 3h-3v2h5v-5h-2v3zM7 7h3V5H5v5h2V7zm9-2v2h3v3h2V5h-5z" fill="currentColor"/>
      </svg>
    `;
  }

  _getCollapseIcon() {
    return `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 8H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }

  _setHeaderToggleMode(mode) {
    if (!this.headerToggleBtn) return;
    if (mode === 'collapse') {
      this.headerToggleBtn.className = 'chatbot-widget__collapse-btn';
      this.headerToggleBtn.title = 'Minimize';
      this.headerToggleBtn.setAttribute('aria-label', 'Minimize chat');
      this.headerToggleBtn.innerHTML = this._getCollapseIcon();
    } else {
      this.headerToggleBtn.className = 'chatbot-widget__expand-btn';
      this.headerToggleBtn.title = 'Expand';
      this.headerToggleBtn.setAttribute('aria-label', 'Expand chat');
      this.headerToggleBtn.innerHTML = this._getExpandIcon();
    }
  }

  _setExpandPromptVisible(show) {
    const prompt = this.container.querySelector('.chatbot-expand-prompt');
    if (!prompt) return;
    prompt.style.display = show ? 'flex' : 'none';
  }

  collapseWidget(saveState = true) {
    const widgetContainer = document.getElementById('chatbot-widget-container');
    const collapsedContainer = document.getElementById('chatbot-widget-collapsed');
    
    if (widgetContainer && collapsedContainer) {
      widgetContainer.style.display = 'none';
      collapsedContainer.style.display = 'flex';
      if (saveState) {
        this.saveWidgetState('collapsed');
      }
    }
  }

  expandWidget(saveState = true) {
    const widgetContainer = document.getElementById('chatbot-widget-container');
    const collapsedContainer = document.getElementById('chatbot-widget-collapsed');
    
    if (widgetContainer && collapsedContainer) {
      collapsedContainer.style.display = 'none';
      widgetContainer.style.display = 'block';
      if (saveState) {
        this.saveWidgetState('expanded');
      }
    }
  }

  closeWidget(saveState = true) {
    // If closing the floating button is not allowed, collapse instead
    if (this.config && this.config.isFloating && this.config.allowFloatingButtonClose === false) {
      this.collapseWidget(saveState);
      return;
    }
    const widgetContainer = document.getElementById('chatbot-widget-container');
    const collapsedContainer = document.getElementById('chatbot-widget-collapsed');
    
    if (widgetContainer && collapsedContainer) {
      widgetContainer.style.display = 'none';
      collapsedContainer.style.display = 'none';
      if (saveState) {
        this.saveWidgetState('closed');
      }
    }
  }

  saveWidgetState(state) {
    try {
      const stateKey = this.getWidgetStateKey();
      localStorage.setItem(stateKey, state);
    } catch (error) {
      console.warn('Failed to save widget state:', error);
    }
  }

  getStoredWidgetState() {
    try {
      const stateKey = this.getWidgetStateKey();
      return localStorage.getItem(stateKey);
    } catch (error) {
      console.warn('Failed to get stored widget state:', error);
      return null;
    }
  }

  getWidgetStateKey() {
    // Create a unique key based on site key or domain to avoid conflicts
    const siteKey = this.config.siteKey || 'default';
    const domain = window.location.hostname;
    return `chatbot-widget-state-${siteKey}-${domain}`;
  }

  applyStoredState() {
    // Check if state was already determined by the inline script
    if (window.__chatbotInitialState) {
      const presetState = window.__chatbotInitialState;

      // The state has already been applied via inline script
      // We just need to ensure our internal state tracking is correct
      // and save if needed

      // Save the state if it wasn't already stored
      const storedState = this.getStoredWidgetState();
      if (!storedState && presetState) {
        this.saveWidgetState(presetState);
      }

      // Clean up the global variable
      delete window.__chatbotInitialState;
      return;
    }

    // Fallback for non-WordPress implementations or if something went wrong
    const storedState = this.getStoredWidgetState();
    const defaultState = this.config.floatingDefaultState || 'expanded';

    // Prioritize stored state over default state
    let finalState = storedState || defaultState;
    // Ensure visibility when closing is disallowed
    if (this.config && this.config.isFloating && this.config.allowFloatingButtonClose === false && finalState === 'closed') {
      finalState = 'collapsed';
    }

    // Apply immediately without delay
    switch (finalState) {
      case 'collapsed':
        this.collapseWidget(false); // Don't save state during initialization
        break;
      case 'closed':
        this.closeWidget(false); // Don't save state during initialization
        break;
      case 'expanded':
      default:
        this.expandWidget(false); // Don't save state during initialization
        break;
    }

    // Save the initial state only if there was no stored state
    // This ensures first-time visitors get the default state saved
    if (!storedState) {
      this.saveWidgetState(finalState);
    }
  }

  dispatchLeadSavedEvent() {
    // Dispatch custom event on the window object
    const event = new CustomEvent('leadblaze:lead_saved', {
      bubbles: true,
      composed: true,
      detail: {
        timestamp: new Date().toISOString(),
        sessionId: this.config.sessionId,
        clientId: this.config.clientId
      }
    });

    // Dispatch on window for easy listening by host page
    window.dispatchEvent(event);
    console.log('ChatbotWidget: leadblaze:lead_saved event dispatched');
  }

  destroy() {
    // Clean up mobile viewport handlers
    try {
      this.disableViewportTracking();
    } catch (e) {}

    // Ensure focus trap and scroll lock are cleared
    try { this._disableFocusTrap(); } catch (e) {}
    try { this._unlockScroll(); } catch (e) {}

    // Clear any pending blur timeout
    if (this._blurTimeout) {
      clearTimeout(this._blurTimeout);
      this._blurTimeout = null;
    }

    const textarea = this.chatInput && this.chatInput.getTextarea ? this.chatInput.getTextarea() : null;
    if (textarea && this._vvHandlers) {
      textarea.removeEventListener('focus', this._vvHandlers.onFocus);
      textarea.removeEventListener('blur', this._vvHandlers.onBlur);
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    // Properly destroy chat input before nullifying
    if (this.chatInput && typeof this.chatInput.destroy === 'function') {
      this.chatInput.destroy();
    }

    // Clean up references
    this.chatInput = null;
    this.messages = [];
    this.chatAPI = null;
    this.historyAPI = null;
    this.config = null;
    this.shadowWrapper = null;
  }
}

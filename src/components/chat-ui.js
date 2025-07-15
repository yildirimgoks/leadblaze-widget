import { Message } from './message.js';
import { ChatInput } from './chat-input.js';

export class ChatUI {
  constructor(shadowWrapper, config, chatAPI) {
    this.shadowWrapper = shadowWrapper;
    this.config = config;
    this.chatAPI = chatAPI;
    this.messages = [];
    this.isAtBottom = true;
    this.intersectionObserver = null;
    
    this.createElement();
    this.setupScrollObserver();
    this.applyTheme();
    this.showGreeting();
  }

  createElement() {
    const container = document.createElement('div');
    container.className = 'chatbot-widget';
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-label', 'Chat conversation');
    
    // Header
    const header = document.createElement('div');
    header.className = 'chatbot-widget__header';
    header.innerHTML = `
      <h2 class="chatbot-widget__title">Chat Support</h2>
    `;
    
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
    
    // Add entrance animation
    requestAnimationFrame(() => {
      container.classList.add('chatbot-widget--visible');
    });
    
    // Focus input after initialization
    setTimeout(() => this.chatInput.focus(), 100);
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

  async sendMessage(messageText) {
    try {
      // Add user message
      const userMessage = new Message(messageText, 'user');
      this.addMessage(userMessage);
      
      // Create loading bot message immediately
      const loadingBotMessage = Message.createLoadingMessage();
      this.addMessage(loadingBotMessage);
      
      // Disable input and scroll to bottom
      this.chatInput.disable();
      this.scrollToBottom();
      
      // Send to API
      const response = await this.chatAPI.sendMessage(messageText);
      
      // Update the loading message with actual content
      loadingBotMessage.updateContent(response.content);
      
    } catch (error) {
      // Remove the loading message and show error
      this.removeLastMessage();
      this.showErrorToast(error.message);
    } finally {
      this.chatInput.enable();
      this.chatInput.focus();
    }
  }

  addMessage(message) {
    this.messages.push(message);
    this.messagesContainer.insertBefore(
      message.getElement(),
      this.messagesContainer.lastElementChild // Insert before sentinel
    );
    
    if (this.isAtBottom) {
      this.scrollToBottom();
    }
  }

  removeLastMessage() {
    if (this.messages.length > 0) {
      const lastMessage = this.messages.pop();
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
    const customTheme = this.generateCustomTheme(primaryColor);
    
    // Apply all the custom theme variables
    Object.entries(customTheme).forEach(([property, value]) => {
      this.container.style.setProperty(property, value);
    });
  }

  generateCustomTheme(primaryColor) {
    // Parse the hex color to RGB
    const rgb = this.hexToRgb(primaryColor);
    
    // Calculate luminance to determine if we need light or dark variations
    const luminance = this.calculateLuminance(rgb.r, rgb.g, rgb.b);
    const isLight = luminance > 0.5;
    
    // Generate hover color (slightly darker)
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

  showGreeting() {
    if (this.config.greetingMessage) {
      const greetingMessage = new Message(this.config.greetingMessage, 'bot');
      this.addMessage(greetingMessage);
    }
  }


  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    // Clean up event listeners
    this.chatInput = null;
    this.messages = [];
  }
}
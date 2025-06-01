import { Message } from './message.js';
import { ChatInput } from './chat-input.js';
import { TypingIndicator } from './typing-indicator.js';

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
    
    // Typing indicator
    this.typingIndicator = new TypingIndicator();
    this.typingIndicator.hide();
    
    // Input
    this.chatInput = new ChatInput((message) => this.sendMessage(message));
    
    // Error toast
    this.errorToast = this.createErrorToast();
    
    container.appendChild(header);
    container.appendChild(messagesContainer);
    container.appendChild(this.typingIndicator.getElement());
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
      
      // Disable input and show typing indicator
      this.chatInput.disable();
      this.typingIndicator.show();
      this.scrollToBottom();
      
      // Send to API
      const response = await this.chatAPI.sendMessage(messageText);
      
      // Hide typing indicator and add bot response
      this.typingIndicator.hide();
      const botMessage = new Message(response.content, 'bot');
      this.addMessage(botMessage);
      
    } catch (error) {
      this.typingIndicator.hide();
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
      // Custom theme color
      this.container.style.setProperty('--primary-color', theme);
    }
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
    this.typingIndicator = null;
    this.messages = [];
  }
}
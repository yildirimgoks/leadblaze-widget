import { ShadowDOMWrapper } from './utils/shadow-dom.js';
import { generateUUID } from './utils/uuid.js';
import { ChatAPI } from './utils/chat-api.js';
import { ChatUI } from './components/chat-ui.js';
import { injectStyles } from './utils/styles.js';

export class ChatbotWidget {
  constructor() {
    this.isInitialized = false;
    this.shadowWrapper = null;
    this.chatAPI = null;
    this.chatUI = null;
    this.config = null;
  }

  init(config) {
    // If already initialized, unmount first
    if (this.isInitialized) {
      console.warn('ChatbotWidget already initialized, reinitializing...');
      this.unmount();
    }

    this.config = this.validateConfig(config);
    
    try {
      this.shadowWrapper = new ShadowDOMWrapper(this.config.container);
      injectStyles(this.shadowWrapper.shadowRoot);
      
      this.chatAPI = new ChatAPI(this.config);
      this.chatUI = new ChatUI(this.shadowWrapper, this.config, this.chatAPI);
      
      this.setupEventListeners();
      this.isInitialized = true;
      
      console.log('ChatbotWidget initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ChatbotWidget:', error);
      throw error;
    }
  }

  validateConfig(config) {
    if (!config) {
      throw new Error('Configuration is required');
    }

    const required = ['clientId', 'container'];
    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required config field: ${field}`);
      }
    }

    return {
      clientId: config.clientId,
      sessionId: config.sessionId || generateUUID(),
      container: config.container,
      theme: config.theme || 'light',
      locale: config.locale || 'en',
      apiEndpoint: config.apiEndpoint || 'https://leadgate-backend-production.up.railway.app/chat',
      greetingMessage: config.greetingMessage || 'Hi, I how can I help you?'
    };
  }

  setupEventListeners() {
    window.addEventListener('beforeunload', () => {
      this.unmount();
    });
  }

  send(message) {
    if (!this.isInitialized) {
      throw new Error('Widget not initialized. Call init() first.');
    }

    if (!message || typeof message !== 'string') {
      throw new Error('Message must be a non-empty string');
    }

    this.chatUI.sendMessage(message);
  }


  unmount() {
    if (!this.isInitialized) {
      return;
    }

    try {
      if (this.chatUI) {
        this.chatUI.destroy();
      }
      
      if (this.shadowWrapper) {
        this.shadowWrapper.destroy();
      }

      this.isInitialized = false;
      this.shadowWrapper = null;
      this.chatAPI = null;
      this.chatUI = null;
      this.config = null;

      console.log('ChatbotWidget unmounted successfully');
    } catch (error) {
      console.error('Error during unmount:', error);
    }
  }
}
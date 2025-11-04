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

    // Generate or use provided sessionId
    const sessionId = config.sessionId || this.getOrCreateSessionId(config.siteKey);
    
    // Override sessionId in config with the managed sessionId
    const configWithSession = {
      ...config,
      sessionId: sessionId,
      skipGreeting: !!config.history // Skip greeting if history will be injected
    };

    this.config = this.validateConfig(configWithSession);
    
    try {
      this.shadowWrapper = new ShadowDOMWrapper(this.config.container);
      injectStyles(this.shadowWrapper.shadowRoot);
      
      this.chatAPI = new ChatAPI(this.config);
      this.chatUI = new ChatUI(this.shadowWrapper, this.config, this.chatAPI);
      
      this.setupEventListeners();
      this.isInitialized = true;
      
      // Inject history if provided
      if (config.history && Array.isArray(config.history)) {
        this.injectHistory(config.history);
      }
      
      console.log('ChatbotWidget initialized successfully with sessionId:', this.config.sessionId);
    } catch (error) {
      console.error('Failed to initialize ChatbotWidget:', error);
      throw error;
    }
  }

  getOrCreateSessionId(siteKey) {
    const sessionKey = `chatbot-session-${siteKey}`;
    
    try {
      // Check if we already have a sessionId in sessionStorage
      let sessionId = sessionStorage.getItem(sessionKey);
      
      if (!sessionId) {
        // Generate new UUID sessionId
        sessionId = generateUUID();
        sessionStorage.setItem(sessionKey, sessionId);
        console.log('ChatbotWidget: New session created:', sessionId);
      } else {
        console.log('ChatbotWidget: Existing session restored:', sessionId);
      }
      
      return sessionId;
    } catch (error) {
      console.warn('ChatbotWidget: Failed to access sessionStorage, using temporary session:', error);
      // Fallback to temporary sessionId if sessionStorage is not available
      return generateUUID();
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

    if (!config.siteKey) {
      throw new Error('Site key is required. Please include site-key attribute in the script tag.');
    }

    // Validate themeMode if provided
    if (config.themeMode && !['light', 'dark'].includes(config.themeMode)) {
      throw new Error('themeMode must be either "light" or "dark"');
    }

    return {
      clientId: config.clientId,
      sessionId: config.sessionId || generateUUID(),
      container: config.container,
      theme: config.theme || 'light',
      themeMode: config.themeMode, // Optional: 'light' or 'dark' for custom themes
      locale: config.locale || 'en',
      apiEndpoint: config.apiEndpoint || 'https://leadgate-backend-production.up.railway.app/chat',
      greetingMessage: config.greetingMessage || 'Hi, how can I help you?',
      siteKey: config.siteKey,
      // Floating-specific flags need to be preserved for UI behavior
      isFloating: config.isFloating === true,
      onCollapse: typeof config.onCollapse === 'function' ? config.onCollapse : undefined,
      floatingDefaultState: config.floatingDefaultState,
      // Embedded mobile options
      // Default to sheet mode on mobile so focusing the input opens full-screen
      // Site can override by passing mobileMode: 'inline'
      mobileMode: config.mobileMode || 'sheet', // 'inline' | 'sheet'
      // By default, focusing the input should expand to sheet on mobile
      // Sites can disable by passing expandOnFocus: false
      expandOnFocus: config.expandOnFocus !== false,
      autoSuggestExpandBelowPx: typeof config.autoSuggestExpandBelowPx === 'number' ? config.autoSuggestExpandBelowPx : 420,
      autoExpandBelowPx: typeof config.autoExpandBelowPx === 'number' ? config.autoExpandBelowPx : null,
      // Preserve skipGreeting if set upstream
      skipGreeting: !!config.skipGreeting
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

  injectHistory(history) {
    if (!this.isInitialized) {
      throw new Error('Widget not initialized. Call init() first.');
    }

    if (!Array.isArray(history)) {
      throw new Error('History must be an array of message objects');
    }

    this.chatUI.injectHistory(history);
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

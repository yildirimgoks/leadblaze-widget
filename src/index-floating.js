import { FloatingChatbotWidget } from './floating-widget.js';

// Extract site-key from the current script tag
function getCurrentScriptSiteKey() {
  // For async scripts, document.currentScript might not be available
  // So we need to find our script by looking for the one with site-key attribute
  const scripts = document.querySelectorAll('script[site-key]');

  // If we have scripts with site-key, use the first one
  if (scripts.length > 0) {
    return scripts[0].getAttribute('site-key');
  }

  // Fallback to document.currentScript for non-async scripts
  const currentScript = document.currentScript;
  if (currentScript) {
    return currentScript.getAttribute('site-key');
  }

  // Last resort: check if there's a script with our widget URL
  const widgetScripts = document.querySelectorAll('script[src*="chatbot-widget-floating.js"]');
  for (const script of widgetScripts) {
    const siteKey = script.getAttribute('site-key');
    if (siteKey) {
      return siteKey;
    }
  }

  return null;
}

// Single global floating widget instance
let floatingWidget = null;

// Check if ChatbotWidget already exists (embedded widget loaded first)
const existingChatbotWidget = window.ChatbotWidget;

// Create or extend the ChatbotWidget namespace
const ChatbotWidgetAPI = {
  // Floating widget init method
  initFloating: (config) => {
    // Use siteKey from config if provided, otherwise try to extract from script tag
    const scriptSiteKey = getCurrentScriptSiteKey();
    const siteKey = config.siteKey || scriptSiteKey;

    if (!siteKey) {
      console.error('Chatbot Widget: No site-key found. Please provide site-key in config or as script attribute.');
    }

    const configWithSiteKey = {
      ...config,
      siteKey: siteKey
    };

    console.log('Chatbot Widget Floating: Site key:', siteKey ? 'Found' : 'Missing');
    console.log('Chatbot Widget Floating: Initializing with config:', configWithSiteKey);

    // If widget already exists, unmount it first
    if (floatingWidget) {
      console.warn('FloatingChatbotWidget already exists, unmounting previous instance');
      floatingWidget.unmount();
    }

    // Create new floating widget instance
    floatingWidget = new FloatingChatbotWidget();
    return floatingWidget.init(configWithSiteKey);
  },

  // Legacy init method - auto-detect if floating or embedded
  init: (config) => {
    // If container is NOT specified or is the floating container ID, use floating widget
    // Otherwise, delegate to embedded widget init if it exists
    if (!config.container || config.container === '#chatbot-widget-container') {
      return ChatbotWidgetAPI.initFloating(config);
    } else if (existingChatbotWidget && existingChatbotWidget.init) {
      // Delegate to embedded widget
      return existingChatbotWidget.init(config);
    } else {
      // No embedded widget available, but container specified - error
      throw new Error('Cannot initialize embedded widget: chatbot-widget.js not loaded. Use initFloating() for floating widget or load chatbot-widget.js for embedded widget.');
    }
  },

  // Floating widget methods
  sendFloating: (message) => {
    if (!floatingWidget) {
      throw new Error('No FloatingChatbotWidget instance found. Call initFloating() first.');
    }
    return floatingWidget.send(message);
  },

  unmountFloating: () => {
    if (floatingWidget) {
      floatingWidget.unmount();
      floatingWidget = null;
    }
  },

  getFloatingInstance: () => {
    return floatingWidget;
  },

  getFloatingChatWidget: () => {
    return floatingWidget ? floatingWidget.getChatWidget() : null;
  },

  // Generic send - tries floating first, then embedded
  send: (message, container = null) => {
    // If container specified, use embedded widget
    if (container && existingChatbotWidget && existingChatbotWidget.send) {
      return existingChatbotWidget.send(message, container);
    }

    // Try floating widget first
    if (floatingWidget) {
      return floatingWidget.send(message);
    }

    // Fall back to embedded widget if available
    if (existingChatbotWidget && existingChatbotWidget.send) {
      return existingChatbotWidget.send(message, container);
    }

    throw new Error('No ChatbotWidget instances found');
  },

  // Generic unmount
  unmount: (container = null) => {
    // If no container specified, unmount floating widget
    if (!container) {
      ChatbotWidgetAPI.unmountFloating();
    }

    // Also try unmounting embedded widget if available
    if (existingChatbotWidget && existingChatbotWidget.unmount) {
      existingChatbotWidget.unmount(container);
    }
  },

  // Get instance by container (embedded) or floating
  getInstance: (container = null) => {
    if (!container) {
      return floatingWidget;
    }

    if (existingChatbotWidget && existingChatbotWidget.getInstance) {
      return existingChatbotWidget.getInstance(container);
    }

    return null;
  }
};

// Preserve existing embedded widget methods if they exist
if (existingChatbotWidget) {
  // Merge with existing methods
  Object.keys(existingChatbotWidget).forEach(key => {
    if (!ChatbotWidgetAPI[key]) {
      ChatbotWidgetAPI[key] = existingChatbotWidget[key];
    }
  });
}

// Export unified API
window.ChatbotWidget = ChatbotWidgetAPI;

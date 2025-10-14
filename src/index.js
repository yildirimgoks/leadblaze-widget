import { ChatbotWidget } from './chatbot-widget.js';

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
  const widgetScripts = document.querySelectorAll('script[src*="chatbot-widget.js"]');
  for (const script of widgetScripts) {
    const siteKey = script.getAttribute('site-key');
    if (siteKey) {
      return siteKey;
    }
  }
  
  return null;
}

// Store multiple widget instances by container
const widgets = new Map();

// Check if ChatbotWidget already exists (floating widget loaded first)
const existingChatbotWidget = window.ChatbotWidget;

// Create or extend the ChatbotWidget namespace
const ChatbotWidgetAPI = {
  init: (config) => {
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
    console.log('Chatbot Widget: Site key:', siteKey ? 'Found' : 'Missing');
    console.log('Chatbot Widget: Initializing with config:', configWithSiteKey);
    
    const container = configWithSiteKey.container;
    
    // If widget already exists for this container, unmount it first
    if (widgets.has(container)) {
      console.warn('ChatbotWidget already exists for container', container, ', unmounting previous instance');
      widgets.get(container).unmount();
    }
    
    // Create new widget instance for this container
    const widget = new ChatbotWidget();
    widgets.set(container, widget);
    
    return widget.init(configWithSiteKey);
  },
  send: (message, container = null) => {
    // If container specified, send to that widget
    if (container && widgets.has(container)) {
      return widgets.get(container).send(message);
    }
    
    // Otherwise, send to the first available widget
    const widget = widgets.values().next().value;
    if (widget) {
      return widget.send(message);
    }
    
    throw new Error('No ChatbotWidget instances found');
  },
  unmount: (container = null) => {
    if (container) {
      // Unmount specific container
      if (widgets.has(container)) {
        widgets.get(container).unmount();
        widgets.delete(container);
      }
    } else {
      // Unmount all widgets
      for (const [key, widget] of widgets) {
        widget.unmount();
      }
      widgets.clear();
    }
  },
  
  // Get widget instance for a specific container (for advanced usage)
  getInstance: (container) => {
    return widgets.get(container) || null;
  }
};

// Preserve existing floating widget methods if they exist
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
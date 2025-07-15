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

const widget = new ChatbotWidget();

window.ChatbotWidget = {
  init: (config) => {
    const siteKey = getCurrentScriptSiteKey();
    const configWithSiteKey = {
      ...config,
      siteKey: siteKey
    };
    console.log('Chatbot Widget: Site key extracted:', siteKey);
    console.log('Chatbot Widget: Initializing with config:', configWithSiteKey);
    return widget.init(configWithSiteKey);
  },
  send: (message) => widget.send(message),
  unmount: () => widget.unmount()
};
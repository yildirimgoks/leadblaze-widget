import { ChatbotWidget } from './chatbot-widget.js';

// Extract site-key from the current script tag
function getCurrentScriptSiteKey() {
  const currentScript = document.currentScript || 
    (function() {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
    
  return currentScript ? currentScript.getAttribute('site-key') : null;
}

const widget = new ChatbotWidget();
const siteKey = getCurrentScriptSiteKey();

window.ChatbotWidget = {
  init: (config) => {
    const configWithSiteKey = {
      ...config,
      siteKey: siteKey
    };
    return widget.init(configWithSiteKey);
  },
  send: (message) => widget.send(message),
  unmount: () => widget.unmount()
};
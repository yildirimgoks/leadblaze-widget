import { ChatbotWidget } from './chatbot-widget.js';

const widget = new ChatbotWidget();

window.ChatbotWidget = {
  init: (config) => widget.init(config),
  send: (message) => widget.send(message),
  unmount: () => widget.unmount()
};
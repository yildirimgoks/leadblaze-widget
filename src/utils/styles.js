// Inline the styles directly for now to debug the issue
const styles = `
:root {
  --primary-color: #0066cc;
  --primary-hover: #0052a3;
  --background-color: #ffffff;
  --surface-color: #f1f3f4;
  --text-primary: #202124;
  --text-secondary: #5f6368;
  --border-color: #e8eaed;
  --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.15);
  --border-radius: 8px;
  --border-radius-small: 4px;
  --transition-fast: 150ms ease;
  --transition-medium: 250ms ease;
}

.chatbot-widget--light {
  --primary-color: #0066cc;
  --primary-hover: #0052a3;
  --background-color: #ffffff;
  --surface-color: #f1f3f4;
  --text-primary: #202124;
  --text-secondary: #5f6368;
  --border-color: #e8eaed;
}

.chatbot-widget--dark {
  --primary-color: #007aff;
  --primary-hover: #0056cc;
  --background-color: #1c1c1e;
  --surface-color: #2c2c2e;
  --text-primary: #ffffff;
  --text-secondary: #8e8e93;
  --border-color: #3a3a3c;
  --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.6);
}

.chatbot-widget {
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--transition-medium), transform var(--transition-medium);
}

.chatbot-widget--visible {
  opacity: 1;
  transform: translateY(0);
}

.chatbot-widget__header {
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.chatbot-widget__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
  text-align: center;
}

.chatbot-widget__collapse-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  position: absolute;
  right: 12px;
}

.chatbot-widget__collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.chatbot-widget__collapse-btn:focus {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.chatbot-widget__messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  scroll-behavior: smooth;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 75%;
  margin-bottom: 0.5rem;
  opacity: 0;
  transform: scale(0.95) translateY(10px);
  animation: messageEnter 150ms ease forwards;
}

.message--user {
  align-self: flex-end;
  align-items: flex-end;
  margin-left: 20%;
}

.message--bot {
  align-self: flex-start;
  align-items: flex-start;
  margin-right: 20%;
}

.message__content {
  padding: 0.625rem 0.875rem;
  border-radius: 18px;
  word-wrap: break-word;
  position: relative;
  font-size: 14px;
  line-height: 1.4;
  transition: opacity 150ms ease;
}

.message__content .typing-dots {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  justify-content: center;
  min-height: 20px;
}

.message__content .typing-dot {
  width: 6px;
  height: 6px;
  background-color: var(--text-secondary);
  border-radius: 50%;
  animation: typingPulse 1.4s infinite ease-in-out both;
}

.message__content .typing-dot:nth-child(1) { animation-delay: -0.32s; }
.message__content .typing-dot:nth-child(2) { animation-delay: -0.16s; }
.message__content .typing-dot:nth-child(3) { animation-delay: 0s; }

.message--user .message__content {
  background-color: var(--primary-color);
  color: #ffffff !important;
  border-bottom-right-radius: 4px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message--user .message__content::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-left-color: var(--primary-color);
  border-bottom: 0;
  border-right: 0;
}

.message--bot .message__content {
  background-color: var(--surface-color);
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 4px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message--bot .message__content::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-right-color: var(--surface-color);
  border-bottom: 0;
  border-left: 0;
}

.message--bot .message__content::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -9px;
  width: 0;
  height: 0;
  border: 9px solid transparent;
  border-right-color: var(--border-color);
  border-bottom: 0;
  border-left: 0;
  z-index: -1;
}

.message__time {
  font-size: 0.6875rem;
  color: var(--text-secondary);
  padding: 0.125rem 0.25rem;
  opacity: 0.8;
  font-weight: 400;
}

.typing-indicator {
  display: none;
  align-items: center;
  align-self: flex-start;
  margin-bottom: 0.5rem;
  max-width: 75%;
  margin-right: 20%;
  opacity: 0;
  transform: scale(0.95) translateY(10px);
  animation: messageEnter 150ms ease forwards;
}

.typing-indicator__bubble {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  padding: 0.75rem 1rem;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.typing-indicator__bubble::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-right-color: var(--surface-color);
  border-bottom: 0;
  border-left: 0;
}

.typing-indicator__bubble::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -9px;
  width: 0;
  height: 0;
  border: 9px solid transparent;
  border-right-color: var(--border-color);
  border-bottom: 0;
  border-left: 0;
  z-index: -1;
}

.chat-input {
  border-top: 1px solid var(--border-color);
  background-color: var(--background-color);
  padding: 0.75rem;
}

.chat-input--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.chat-input__container {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.chat-input__textarea {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--surface-color);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  resize: none;
  transition: border-color var(--transition-fast);
}

.chat-input__textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}

.chat-input__textarea::placeholder {
  color: var(--text-secondary);
}

.chat-input__send {
  min-width: 44px;
  height: 44px;
  padding: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
}

.chat-input__send:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.chat-input__send:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.3);
}

.chat-input__send svg {
  width: 18px;
  height: 18px;
}

.error-toast {
  position: absolute;
  bottom: 80px;
  left: 1rem;
  right: 1rem;
  background-color: #dc3545;
  color: white;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transform: translateY(100%);
  opacity: 0;
  transition: transform var(--transition-medium), opacity var(--transition-medium);
  z-index: 1000;
}

.error-toast--visible {
  transform: translateY(0);
  opacity: 1;
}

.scroll-sentinel {
  height: 1px;
  pointer-events: none;
}

@keyframes messageEnter {
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes typingPulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
`;

export function injectStyles(shadowRoot) {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  shadowRoot.appendChild(styleElement);
}
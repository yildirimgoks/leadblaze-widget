import styles from '../styles/main.scss';

// Fallback minimal CSS used when bundling does not inline the SCSS string correctly
const fallbackStyles = `
.chatbot-widget {
  --primary-color: #0066cc;
  --primary-hover: #0052a3;
  --background-color: #ffffff;
  --surface-color: #f8f9fa;
  --text-primary: #1a1a1a;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --border-radius: 8px;
  --border-radius-small: 4px;
  --bubble-radius: 20px;
  --bubble-radius-small: 8px;
}
.chatbot-widget { width: 100%; height: 100%; min-height: 320px; display: flex; flex-direction: column; background: var(--background-color); color: var(--text-primary); }
.chatbot-widget__header { padding: 12px; background: var(--primary-color); color: #fff; position: relative; }
.chatbot-widget__title { margin: 0; font-size: 16px; font-weight: 600; text-align: center; }
.chatbot-widget__collapse-btn, .chatbot-widget__expand-btn { position: absolute; right: 12px; top: 8px; width: 32px; height: 32px; display:flex; align-items:center; justify-content:center; background:none; border:none; color:#fff; border-radius:4px; }
.chatbot-widget__messages { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
.message { display: flex; flex-direction: column; gap: 4px; max-width: 85%; opacity:1; transform:none; }
.message.message--entering { opacity:0; transform:scale(0.95) translateY(10px); animation: messageEnter 150ms ease forwards; }
.message--user { align-self: flex-end; }
.message--bot { align-self: flex-start; }
.message__content { padding: 10px 12px; border-radius: var(--bubble-radius); font-size: 14px; line-height: 1.4; position: relative; }
.message__content { overflow: hidden; }
.message__content::before, .message__content::after, .message::before, .message::after, .message__tail { content: none !important; display:none !important; width:0 !important; height:0 !important; border:0 !important; background:none !important; box-shadow:none !important; }
.message__content::before, .message__content::after { content: none !important; }
.message--user .message__content { background: var(--primary-color); color: #fff; border-bottom-right-radius: var(--bubble-radius-small); }
.message--bot .message__content { background: var(--surface-color); color: var(--text-primary); border: 1px solid var(--border-color); border-bottom-left-radius: var(--bubble-radius-small); }
/* Tails disabled */
.message__time { font-size: 11px; color: var(--text-secondary); padding: 0 4px; }
.chat-input { border-top: 1px solid var(--border-color); background: var(--background-color); padding: 12px; }
.chat-input__container { display: flex; gap: 8px; align-items: flex-end; }
.chat-input__textarea { flex: 1; min-height: 40px; max-height: 120px; resize: none; padding: 10px; border: 1px solid var(--border-color); border-radius: var(--border-radius); background: var(--surface-color); color: var(--text-primary); font: inherit; }
.chat-input__send { min-width: 44px; height: 44px; background: var(--primary-color); color: #fff; border: none; border-radius: var(--border-radius); display:flex; align-items:center; justify-content:center; }
.scroll-sentinel { height: 1px; pointer-events: none; }
.chatbot-expand-prompt { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 12px; background: var(--surface-color); border-bottom: 1px solid var(--border-color); }
.chatbot-expand-prompt__btn { background: var(--primary-color); color:#fff; border:none; border-radius: 6px; padding:6px 10px; }
`;

export function injectStyles(shadowRoot) {
  const styleElement = document.createElement('style');
  const css = (typeof styles === 'string' && styles.trim().length > 0) ? styles : fallbackStyles;
  styleElement.textContent = css;
  shadowRoot.appendChild(styleElement);
}

export class ChatInput {
  constructor(onSendMessage) {
    this.onSendMessage = onSendMessage;
    this.isDisabled = false;
    this.element = this.createElement();
    this.setupEventListeners();
  }

  createElement() {
    const container = document.createElement('div');
    container.className = 'chat-input';
    
    const form = document.createElement('form');
    form.className = 'chat-input__form';
    
    const inputContainer = document.createElement('div');
    inputContainer.className = 'chat-input__container';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'chat-input__textarea';
    textarea.placeholder = 'Type your message...';
    textarea.rows = 1;
    textarea.setAttribute('aria-label', 'Type your message');
    textarea.setAttribute('maxlength', '2000');
    
    const sendButton = document.createElement('button');
    sendButton.type = 'submit';
    sendButton.className = 'chat-input__send';
    sendButton.setAttribute('aria-label', 'Send message');
    sendButton.innerHTML = this.getSendIcon();
    
    inputContainer.appendChild(textarea);
    inputContainer.appendChild(sendButton);
    form.appendChild(inputContainer);
    container.appendChild(form);
    
    return container;
  }

  setupEventListeners() {
    const textarea = this.getTextarea();
    const form = this.getForm();
    
    // Auto-resize textarea
    textarea.addEventListener('input', () => {
      this.autoResize();
    });
    
    // Handle keyboard shortcuts
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSubmit();
      }
    });
    
    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Handle virtual keyboard on mobile
    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', () => {
        this.handleViewportResize();
      });
    }
  }

  autoResize() {
    const textarea = this.getTextarea();
    textarea.style.height = 'auto';
    const maxHeight = 120; // ~5 lines
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = newHeight + 'px';
  }

  handleSubmit() {
    if (this.isDisabled) return;
    
    const textarea = this.getTextarea();
    const message = textarea.value.trim();
    
    if (message) {
      this.onSendMessage(message);
      textarea.value = '';
      this.autoResize();
    }
  }

  handleViewportResize() {
    // Adjust for virtual keyboard on mobile
    const viewport = window.visualViewport;
    if (viewport) {
      const heightDiff = window.innerHeight - viewport.height;
      if (heightDiff > 150) { // Virtual keyboard is likely open
        this.element.style.paddingBottom = `${heightDiff}px`;
      } else {
        this.element.style.paddingBottom = '';
      }
    }
  }

  disable() {
    this.isDisabled = true;
    const textarea = this.getTextarea();
    const button = this.getSendButton();
    
    textarea.disabled = true;
    button.disabled = true;
    this.element.classList.add('chat-input--disabled');
  }

  enable() {
    this.isDisabled = false;
    const textarea = this.getTextarea();
    const button = this.getSendButton();
    
    textarea.disabled = false;
    button.disabled = false;
    this.element.classList.remove('chat-input--disabled');
  }

  focus() {
    const textarea = this.getTextarea();
    textarea.focus();
  }

  getTextarea() {
    return this.element.querySelector('.chat-input__textarea');
  }

  getSendButton() {
    return this.element.querySelector('.chat-input__send');
  }

  getForm() {
    return this.element.querySelector('.chat-input__form');
  }

  getSendIcon() {
    return `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
      </svg>
    `;
  }

  getElement() {
    return this.element;
  }
}
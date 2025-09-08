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
    // Prevent iOS Safari auto-zoom by setting font-size to 16px minimum
    textarea.style.fontSize = '16px';
    
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
    const inputContainer = this.element.querySelector('.chat-input__container');
    
    // Store event handlers for cleanup with proper this binding
    this.handlers = {
      input: this.autoResize.bind(this),
      keydown: (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSubmit();
        }
      },
      submit: (e) => {
        e.preventDefault();
        this.handleSubmit();
      },
      containerClick: (e) => {
        // Don't interfere if user clicks the send button
        if (!e.target.closest('.chat-input__send')) {
          // On desktop, prevent scroll when focusing via container click
          if (!this.isMobileLike()) {
            try {
              textarea.focus({ preventScroll: true });
            } catch (err) {
              textarea.focus();
            }
          } else {
            textarea.focus();
          }
        }
      },
      focus: () => {
        // Small delay to ensure keyboard animation has started
        setTimeout(() => {
          // Only auto-scroll on mobile/tablet form factors
          if (this.isMobileLike() && textarea && textarea.scrollIntoView) {
            textarea.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        }, 100);
      }
    };

    // Auto-resize textarea
    textarea.addEventListener('input', this.handlers.input);

    // Handle keyboard shortcuts
    textarea.addEventListener('keydown', this.handlers.keydown);

    // Desktop-only: prevent default mouse focus scroll and apply preventScroll focus
    textarea.addEventListener('mousedown', (e) => {
      if (!this.isMobileLike()) {
        e.preventDefault();
        try {
          textarea.focus({ preventScroll: true });
        } catch (err) {
          textarea.focus();
        }
      }
    });
    
    // Handle form submission
    form.addEventListener('submit', this.handlers.submit);
    
    // Make entire input container clickable to focus textarea
    inputContainer.addEventListener('click', this.handlers.containerClick);
    
    // Handle virtual keyboard on mobile - ensure input stays visible
    textarea.addEventListener('focus', this.handlers.focus);
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
    
    // Guard against destroyed state
    if (!this.onSendMessage || !this.element) return;
    
    const textarea = this.getTextarea();
    if (!textarea) return;
    
    const message = textarea.value.trim();
    
    if (message && this.onSendMessage) {
      this.onSendMessage(message);
      textarea.value = '';
      this.autoResize();
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
    if (!textarea) return;
    // On desktop, focus without scrolling the page
    if (!this.isMobileLike()) {
      try {
        textarea.focus({ preventScroll: true });
      } catch (err) {
        textarea.focus();
      }
    } else {
      textarea.focus();
    }
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

  // Helper to detect mobile/tablet where auto-scroll-on-focus is desirable
  isMobileLike() {
    try {
      return (
        window.matchMedia && (
          window.matchMedia('(pointer: coarse)').matches ||
          window.matchMedia('(max-width: 768px)').matches
        )
      );
    } catch (e) {
      // Fallback to user agent heuristic only if matchMedia fails
      const ua = navigator.userAgent || '';
      return /Mobi|Android|iPad|iPhone|iPod/i.test(ua);
    }
  }

  destroy() {
    // Prevent callbacks from being called after destroy
    this.onSendMessage = null;
    
    // Remove event listeners if they exist
    if (this.handlers) {
      const textarea = this.getTextarea();
      const form = this.getForm();
      const inputContainer = this.element.querySelector('.chat-input__container');
      
      if (textarea) {
        textarea.removeEventListener('input', this.handlers.input);
        textarea.removeEventListener('keydown', this.handlers.keydown);
        textarea.removeEventListener('focus', this.handlers.focus);
      }
      
      if (form) {
        form.removeEventListener('submit', this.handlers.submit);
      }
      
      if (inputContainer) {
        inputContainer.removeEventListener('click', this.handlers.containerClick);
      }
    }
    
    // Clear references
    this.handlers = null;
    this.element = null;
  }
}

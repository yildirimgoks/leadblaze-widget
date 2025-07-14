import DOMPurify from 'dompurify';

export class Message {
  constructor(content, type = 'user', timestamp = new Date(), isLoading = false) {
    this.content = content;
    this.type = type; // 'user' or 'bot'
    this.timestamp = timestamp;
    this.isLoading = isLoading;
    this.element = this.createElement();
  }

  createElement() {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message message--${this.type}`;
    messageContainer.setAttribute('role', 'log');
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message__content';
    
    if (this.isLoading) {
      this.createLoadingContent(messageContent);
    } else {
      this.createTextContent(messageContent);
    }
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message__time';
    messageTime.textContent = this.formatTime(this.timestamp);
    messageTime.setAttribute('aria-label', `Sent at ${this.formatTime(this.timestamp, true)}`);
    
    messageContainer.appendChild(messageContent);
    messageContainer.appendChild(messageTime);
    
    // Add animation class for entrance
    messageContainer.classList.add('message--entering');
    
    // Remove animation class after animation completes
    requestAnimationFrame(() => {
      messageContainer.classList.remove('message--entering');
    });
    
    return messageContainer;
  }

  createLoadingContent(messageContent) {
    messageContent.innerHTML = '';
    messageContent.setAttribute('aria-label', 'Bot is typing');
    
    const typingDots = document.createElement('div');
    typingDots.className = 'typing-dots';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'typing-dot';
      typingDots.appendChild(dot);
    }
    
    messageContent.appendChild(typingDots);
  }

  createTextContent(messageContent) {
    // Sanitize content before inserting
    const sanitizedContent = DOMPurify.sanitize(this.content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre'],
      ALLOWED_ATTR: []
    });
    
    messageContent.innerHTML = sanitizedContent;
    messageContent.removeAttribute('aria-label');
  }

  updateContent(newContent) {
    this.content = newContent;
    this.isLoading = false;
    
    const messageContent = this.element.querySelector('.message__content');
    
    // Add a smooth transition effect
    messageContent.style.opacity = '0.7';
    
    setTimeout(() => {
      this.createTextContent(messageContent);
      messageContent.style.opacity = '1';
    }, 150);
  }

  formatTime(date, verbose = false) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    if (verbose) {
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')}`;
  }

  getElement() {
    return this.element;
  }

  static createLoadingMessage() {
    return new Message('', 'bot', new Date(), true);
  }

  static createErrorMessage(errorText) {
    const message = new Message(errorText, 'bot');
    message.element.classList.add('message--error');
    return message;
  }
}
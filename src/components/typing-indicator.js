export class TypingIndicator {
  constructor() {
    this.element = this.createElement();
  }

  createElement() {
    const container = document.createElement('div');
    container.className = 'typing-indicator';
    container.setAttribute('aria-label', 'Bot is typing');
    
    const bubble = document.createElement('div');
    bubble.className = 'typing-indicator__bubble';
    
    const dots = document.createElement('div');
    dots.className = 'typing-dots';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'typing-dot';
      dots.appendChild(dot);
    }
    
    bubble.appendChild(dots);
    container.appendChild(bubble);
    return container;
  }

  show() {
    this.element.style.display = 'flex';
    this.element.setAttribute('aria-live', 'polite');
  }

  hide() {
    this.element.style.display = 'none';
    this.element.removeAttribute('aria-live');
  }

  getElement() {
    return this.element;
  }
}
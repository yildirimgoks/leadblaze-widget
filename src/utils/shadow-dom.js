export class ShadowDOMWrapper {
  constructor(container) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) {
      throw new Error('Container element not found');
    }

    // Check if shadow root already exists, if so use it, otherwise create new one
    if (this.container.shadowRoot) {
      this.shadowRoot = this.container.shadowRoot;
      // Clear existing content
      this.shadowRoot.innerHTML = '';
    } else {
      this.shadowRoot = this.container.attachShadow({ mode: 'open' });
    }
    
    this.setupStyles();
  }

  setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
        display: block;
        contain: layout style paint;
      }
      
      * {
        box-sizing: border-box;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  injectStyles(cssText) {
    const style = document.createElement('style');
    style.textContent = cssText;
    this.shadowRoot.appendChild(style);
  }

  appendChild(element) {
    this.shadowRoot.appendChild(element);
  }

  querySelector(selector) {
    return this.shadowRoot.querySelector(selector);
  }

  querySelectorAll(selector) {
    return this.shadowRoot.querySelectorAll(selector);
  }

  destroy() {
    if (this.container && this.container.shadowRoot) {
      this.container.innerHTML = '';
    }
  }
}
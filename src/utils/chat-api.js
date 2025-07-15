export class ChatAPI {
  constructor(config) {
    this.config = config;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.baseDelay = 1000; // 1 second
  }

  async sendMessage(message) {
    const payload = {
      sessionId: this.config.sessionId,
      clientId: this.config.clientId,
      content: message,
      type: "message"
    };

    return this.makeRequest(payload);
  }

  async makeRequest(payload, attempt = 0) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (this.config.siteKey) {
        headers['x-site-key'] = this.config.siteKey;
        console.log('Chatbot Widget: Adding x-site-key header:', this.config.siteKey);
      } else {
        console.warn('Chatbot Widget: No site key found in config');
      }

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || typeof data.content !== 'string') {
        throw new Error('Invalid response format from server');
      }

      return data;
    } catch (error) {
      if (attempt < this.maxRetries && this.isRetryableError(error)) {
        const delay = this.calculateDelay(attempt);
        console.warn(`Request failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${this.maxRetries})`, error);
        
        await this.sleep(delay);
        return this.makeRequest(payload, attempt + 1);
      }

      console.error('Chat API request failed:', error);
      throw new Error(this.getUserFriendlyError(error));
    }
  }

  isRetryableError(error) {
    // Retry on network errors and 5xx server errors
    return error.name === 'TypeError' || // Network errors
           error.message.includes('fetch') ||
           (error.message.includes('HTTP 5') && error.message.includes('HTTP 50')) ||
           error.message.includes('HTTP 502') ||
           error.message.includes('HTTP 503') ||
           error.message.includes('HTTP 504');
  }

  calculateDelay(attempt) {
    // Exponential backoff with jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, 10000); // Cap at 10 seconds
  }

  getUserFriendlyError(error) {
    if (error.message.includes('HTTP 401') || error.message.includes('HTTP 403')) {
      return 'Access denied. This domain is not authorized to use this service.';
    }
    
    if (error.message.includes('HTTP 429')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    if (error.message.includes('HTTP 4')) {
      return 'Invalid request. Please check your configuration.';
    }
    
    if (error.message.includes('HTTP 5') || error.name === 'TypeError') {
      return 'Service temporarily unavailable. Please try again.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
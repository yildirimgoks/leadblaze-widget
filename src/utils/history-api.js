export class HistoryAPI {
  constructor(config) {
    this.config = config;
    this.baseUrl = this.getBaseUrl();
  }

  getBaseUrl() {
    const apiEndpoint = this.config.apiEndpoint || 'https://leadgate-backend-production.up.railway.app/chat';
    // Extract base URL by removing '/chat' if present
    return apiEndpoint.replace('/chat', '');
  }

  async getConversationHistory() {
    const endpoint = `${this.baseUrl}/get-session-history`;
    
    const payload = {
      sessionId: this.config.sessionId,
      clientId: this.config.clientId
    };

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (this.config.siteKey) {
        headers['x-site-key'] = this.config.siteKey;
        console.log('ChatbotWidget: Fetching history with x-site-key:', this.config.siteKey);
      } else {
        console.warn('ChatbotWidget: No site key found in config for history request');
      }

      console.log('ChatbotWidget: Fetching conversation history for session:', this.config.sessionId);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Handle 404 or similar - probably no conversation history exists yet
        if (response.status === 404) {
          console.log('ChatbotWidget: No conversation history found for session (404)');
          return [];
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate response format - expecting [{"sender":"user|ai", "content":"..."}]
      if (!Array.isArray(data)) {
        console.warn('ChatbotWidget: Expected array response, got:', typeof data);
        return [];
      }

      console.log('ChatbotWidget: Loaded', data.length, 'messages from conversation history');
      return data;

    } catch (error) {
      console.error('ChatbotWidget: Failed to fetch conversation history:', error);
      
      // Return empty array on error - widget should still work without history
      return [];
    }
  }
}
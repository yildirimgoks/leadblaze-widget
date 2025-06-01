/**
 * Sample Backend Implementation for Chatbot Widget
 * 
 * This file demonstrates how to implement domain-based authentication
 * and handle chat requests from the embeddable widget.
 */

// Example using Node.js/Express
const express = require('express');
const cors = require('cors');
const app = express();

// Configuration
const config = {
  // Allowed domains that can use the chat widget
  allowedDomains: [
    'https://yourwebsite.com',
    'https://www.yourwebsite.com',
    'https://demo.yourcompany.com',
    'https://leadgate-backend-production.up.railway.app',
    'http://localhost:3000',  // For development
    'file://'                 // For local demo.html testing
  ],
  
  // Rate limiting per client
  rateLimits: {
    'client-1': { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
    'client-2': { maxRequests: 200, windowMs: 60000 }, // 200 requests per minute
    'demo-client': { maxRequests: 50, windowMs: 60000 } // Demo gets lower limit
  }
};

// Middleware
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed domains
    const isAllowed = config.allowedDomains.some(domain => 
      origin.startsWith(domain) || domain === 'file://' && origin.startsWith('file://')
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS - Domain not authorized'));
    }
  }
}));

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map();

// Domain validation middleware
function validateDomain(req, res, next) {
  const origin = req.headers.origin || req.headers.referer;
  
  if (!origin) {
    return res.status(403).json({
      error: 'Missing origin header'
    });
  }
  
  const isAllowed = config.allowedDomains.some(domain => 
    origin.startsWith(domain)
  );
  
  if (!isAllowed) {
    return res.status(403).json({
      error: 'Domain not authorized',
      domain: origin
    });
  }
  
  next();
}

// Rate limiting middleware
function rateLimit(req, res, next) {
  const { clientId } = req.body;
  const clientConfig = config.rateLimits[clientId];
  
  if (!clientConfig) {
    // Default rate limit for unknown clients
    return res.status(429).json({
      error: 'Rate limit exceeded - unknown client'
    });
  }
  
  const now = Date.now();
  const windowStart = now - clientConfig.windowMs;
  const key = `${clientId}:${Math.floor(now / clientConfig.windowMs)}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 0, timestamp: now });
  }
  
  const bucket = rateLimitStore.get(key);
  
  if (bucket.count >= clientConfig.maxRequests) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((bucket.timestamp + clientConfig.windowMs - now) / 1000)
    });
  }
  
  bucket.count++;
  next();
}

// Input validation middleware
function validateChatRequest(req, res, next) {
  const { sessionId, clientId, content, type } = req.body;
  
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({
      error: 'Invalid or missing sessionId'
    });
  }
  
  if (!clientId || typeof clientId !== 'string') {
    return res.status(400).json({
      error: 'Invalid or missing clientId'
    });
  }
  
  if (!content || typeof content !== 'string' || content.length === 0) {
    return res.status(400).json({
      error: 'Invalid or missing message content'
    });
  }
  
  if (!type || type !== 'message') {
    return res.status(400).json({
      error: 'Invalid or missing message type'
    });
  }
  
  if (content.length > 2000) {
    return res.status(400).json({
      error: 'Message too long (max 2000 characters)'
    });
  }
  
  next();
}

// Main chat endpoint
app.post('/chat', validateDomain, validateChatRequest, rateLimit, async (req, res) => {
  try {
    const { sessionId, clientId, content, type } = req.body;
    
    console.log(`Chat request from ${clientId}, session: ${sessionId}`);
    console.log(`Message: ${content} (type: ${type})`);
    
    // Here you would integrate with your actual chat service
    // Examples: OpenAI API, DialogFlow, Rasa, custom ML model, etc.
    
    const response = await generateChatResponse({
      sessionId,
      clientId,
      message: content,
      type: type,
      origin: req.headers.origin
    });
    
    res.json({
      content: response.text,
      metadata: {
        sessionId,
        timestamp: new Date().toISOString(),
        clientId
      }
    });
    
  } catch (error) {
    console.error('Chat processing error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to process chat request'
    });
  }
});

// Mock chat response generator
async function generateChatResponse({ sessionId, clientId, message, type, origin }) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));
  
  const responses = [
    "Hello! How can I assist you today?",
    "I understand your question. Let me help you with that.",
    "Thanks for reaching out! What specific information are you looking for?",
    "I'm here to help. Could you provide more details about your inquiry?",
    "Great question! Based on what you've told me, here's what I can suggest...",
    `I see you're asking about "${message}". Let me provide some helpful information.`,
    "I appreciate your patience. Here's what I found that might help you.",
    "That's an interesting question! Let me break this down for you."
  ];
  
  // Simple keyword-based responses
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return {
      text: "I'm here to help! You can ask me about our products, services, or any general questions you might have. What would you like to know?"
    };
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return {
      text: "For pricing information, I'd be happy to connect you with our sales team. They can provide detailed quotes based on your specific needs. Would you like me to arrange that?"
    };
  }
  
  if (lowerMessage.includes('thank')) {
    return {
      text: "You're very welcome! Is there anything else I can help you with today?"
    };
  }
  
  // Default response
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  return {
    text: randomResponse
  };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Analytics endpoint (optional)
app.post('/analytics', validateDomain, (req, res) => {
  const { event, client_id, session_id, data } = req.body;
  
  console.log(`Analytics event: ${event} from ${client_id}`);
  
  // Store analytics data (database, metrics service, etc.)
  
  res.json({ received: true });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Chat backend running on port ${PORT}`);
  console.log(`Allowed domains: ${config.allowedDomains.join(', ')}`);
});

/**
 * Usage Instructions:
 * 
 * 1. Install dependencies:
 *    npm install express cors
 * 
 * 2. Run the server:
 *    node backend-reference.js
 * 
 * 3. Update your widget configuration:
 *    ChatbotWidget.init({
 *      clientId: "your-client-id",
 *      container: "#chat",
 *      apiEndpoint: "https://leadgate-backend-production.up.railway.app/chat"
 *    });
 * 
 * 4. Add your domain to the allowedDomains array
 * 
 * 5. Customize the generateChatResponse function for your use case
 */

module.exports = app;
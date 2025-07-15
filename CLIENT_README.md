# Chatbot Widget

A lightweight, embeddable chatbot widget that provides seamless chat functionality for any website. Built with vanilla JavaScript, featuring Shadow DOM isolation, responsive design, and comprehensive accessibility support.

## ✨ Features

- **Lightweight**: ≤25KB gzipped bundle size
- **Framework Agnostic**: Pure vanilla JavaScript, works with any tech stack
- **Shadow DOM Isolation**: Prevents CSS conflicts with host page
- **Responsive Design**: Mobile-first approach with touch-friendly interface
- **Accessibility**: WCAG AA compliant with ARIA support
- **Theme Support**: Light, dark, and custom color themes
- **Error Handling**: Robust error handling with exponential backoff
- **TypeScript Ready**: Built with modern JavaScript (ES2017+)

## 🚀 Quick Start

### 1. Include the Script

```html
<script src="https://retonai.com/chatbot-widget.js" site-key="your-site-key" async></script>
```

**Note:** The `async` attribute is supported and recommended for better page performance. The widget automatically handles timing to ensure the site key is properly extracted regardless of when the script loads.

### 2. Add a Container

```html
<div id="chat-container"></div>
```

### 3. Initialize the Widget

```html
<script>
  ChatbotWidget.init({
    clientId: "test-client-id",
    container: "#chat-container"
  });
</script>
```

**Important:** Make sure to replace `your-site-key` in the script tag with your actual site key provided by your service provider.

## 📋 Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `clientId` | string | ✅ | - | Unique client identifier (for analytics & routing) |
| `container` | string/Element | ✅ | - | CSS selector or DOM element |
| `sessionId` | string | ❌ | auto-generated | Chat session ID (UUID v4) |
| `theme` | string | ❌ | `"light"` | `"light"` \| `"dark"` \| hex color |
| `locale` | string | ❌ | `"en"` | ISO 639-1 language code |
| `apiEndpoint` | string | ❌ | `"https://leadgate-backend-production.up.railway.app/chat"` | Custom API endpoint |
| `greetingMessage` | string | ❌ | `"Hi, I how can I help you?"` | Initial bot greeting message |

**Note:** The `site-key` is required and must be provided as an attribute in the script tag, not in the configuration object.

### Example Configurations

#### Basic Setup
```javascript
ChatbotWidget.init({
  clientId: "my-website",
  container: "#chat-widget"
});
```

#### Dark Theme
```javascript
ChatbotWidget.init({
  clientId: "my-website", 
  container: "#chat-widget",
  theme: "dark"
});
```

#### Custom Theme Color
```javascript
ChatbotWidget.init({
  clientId: "my-website",
  container: "#chat-widget", 
  theme: "#9c27b0" // Purple theme
});
```

#### Custom API Endpoint
```javascript
ChatbotWidget.init({
  clientId: "my-website",
  container: "#chat-widget",
  apiEndpoint: "https://api.mycompany.com/chat",
  locale: "es" // Spanish
});
```

#### Custom Greeting Message
```javascript
ChatbotWidget.init({
  clientId: "my-website",
  container: "#chat-widget",
  greetingMessage: "Welcome to our support! How can we help you today?"
});
```

## 🔧 API Reference

### ChatbotWidget.init(config)

Initializes the chatbot widget with the provided configuration.

- **Parameters**: `config` (object) - Configuration options
- **Returns**: void
- **Throws**: Error if configuration is invalid or initialization fails

### ChatbotWidget.send(message)

Sends a message programmatically.

- **Parameters**: `message` (string) - Message text to send
- **Returns**: void
- **Throws**: Error if widget not initialized or message is invalid

### ChatbotWidget.unmount()

Destroys the widget instance and cleans up all resources.

- **Parameters**: None
- **Returns**: void

## 🎨 Styling and Themes

The widget supports three theme modes:

### Light Theme (Default)
```javascript
theme: "light"
```

### Dark Theme
```javascript
theme: "dark" 
```

### Custom Color Theme
```javascript
theme: "#your-brand-color" // Any valid hex color
```

### CSS Custom Properties

The widget exposes CSS custom properties for advanced theming:

```css
--primary-color: #0066cc;
--primary-hover: #0052a3;
--background-color: #ffffff;
--surface-color: #f8f9fa;
--text-primary: #1a1a1a;
--text-secondary: #6c757d;
--border-color: #dee2e6;
--border-radius: 8px;
--transition-fast: 150ms ease;
```

## 📱 Responsive Design

The widget is built with a mobile-first approach and includes:

- **Breakpoints**: 600px (mobile), 1024px (tablet), 1025px+ (desktop)
- **Touch Targets**: Minimum 44×44px touch areas
- **Virtual Keyboard**: Automatic adjustments for mobile keyboards
- **Flexible Layout**: Adapts to any container size

### Recommended Minimum Size
- **Desktop**: 320×400px
- **Mobile**: Full viewport or 320×400px minimum

## ♿ Accessibility

The widget follows WCAG AA guidelines and includes:

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **High Contrast**: Support for high contrast mode
- **Focus Management**: Proper focus handling
- **Live Regions**: Announces new messages
- **Color Contrast**: ≥4.5:1 contrast ratio

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift+Enter**: New line
- **Tab**: Navigate between elements

## 🔒 Security

- **Site Key Authentication**: Each widget must include a `site-key` attribute in the script tag, which is sent as `x-site-key` header with all API requests. The site key is extracted during widget initialization to ensure proper timing regardless of async script loading.
- **Domain-Based Authentication**: Backend validates request origin/referer headers
- **HTTPS Only**: All API requests use HTTPS
- **Content Sanitization**: DOMPurify sanitizes all message content
- **Shadow DOM**: Isolates widget from host page
- **Rate Limiting**: Backend can implement per-domain rate limiting
- **Input Validation**: Server-side validation required

### Backend Security Implementation

Your backend should validate both the site key and requesting domain:

```javascript
// Example Node.js/Express validation
const allowedDomains = [
  'https://yourwebsite.com',
  'https://www.yourwebsite.com',
  'https://demo.yourcompany.com'
];

const validSiteKeys = {
  'your-site-key-1': 'https://yourwebsite.com',
  'your-site-key-2': 'https://www.yourwebsite.com',
  'your-site-key-3': 'https://demo.yourcompany.com'
};

app.post('/chat', (req, res) => {
  const siteKey = req.headers['x-site-key'];
  const origin = req.headers.origin || req.headers.referer;
  
  // Validate site key
  if (!siteKey || !validSiteKeys[siteKey]) {
    return res.status(401).json({
      error: 'Invalid or missing site key'
    });
  }
  
  // Validate domain matches site key
  const expectedDomain = validSiteKeys[siteKey];
  if (!origin?.startsWith(expectedDomain)) {
    return res.status(403).json({
      error: 'Domain not authorized for this site key'
    });
  }
  
  // Process chat request...
  const { sessionId, clientId, content } = req.body;
  // Handle the chat logic
});
```

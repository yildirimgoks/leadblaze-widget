# Floating Chatbot Widget

The floating chatbot widget provides a modern, always-accessible chat experience with a collapsible floating button. This is perfect for websites that want to offer chat support without taking up permanent screen space.

## Features

- **Floating Button**: A persistent, collapsible button that stays visible as users scroll
- **Expandable Chat**: Click to expand the full chat interface
- **Persistent State**: Remembers user preferences (collapsed/expanded/closed) across sessions
- **Multiple Positions**: Choose where the button appears (bottom-right, bottom-left, top-right, top-left)
- **Mobile Optimized**: Responsive design that works seamlessly on all devices
- **Small Bundle**: Only 18.2 KB gzipped

## Quick Start

### 1. Include the Script

Add this script tag to your HTML, right before the closing `</body>` tag:

```html
<script src="https://cdn.yoursite.com/chatbot-widget-floating.js"
        site-key="your-site-key"
        async></script>
```

### 2. Initialize the Widget

Add initialization code after the script tag:

```html
<script>
  ChatbotWidget.init({
    clientId: "your-client-id",
    theme: "#eb4034",                  // Optional: custom theme color
    themeMode: "light",                // Optional: "light" or "dark"
    position: "bottom-right",          // Optional: button position
    floatingDefaultState: "expanded",  // Optional: initial state
    greetingMessage: "Hi! How can I help you?"  // Optional: custom greeting
  });
</script>
```

## Configuration Options

### Required

| Option | Type | Description |
|--------|------|-------------|
| `clientId` | string | Your unique client identifier |

### Optional - Appearance

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | string | `"light"` | Hex color (e.g., `"#eb4034"`) or `"light"`/`"dark"` |
| `themeMode` | string | `undefined` | Force `"light"` or `"dark"` mode for custom themes |
| `position` | string | `"bottom-right"` | Position of the floating button |

### Optional - Behavior

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `floatingDefaultState` | string | `"expanded"` | Initial state: `"expanded"`, `"collapsed"`, or `"closed"` |
| `greetingMessage` | string | `"Hi, how can I help you?"` | Custom greeting message |
| `sessionId` | string | auto-generated | Custom session ID (UUID v4 format) |
| `locale` | string | `"en"` | Language code (ISO 639-1) |
| `apiEndpoint` | string | default | Custom API endpoint URL |

## Position Options

The `position` option controls where the floating button appears:

- `"bottom-right"` - Bottom right corner (default)
- `"bottom-left"` - Bottom left corner
- `"top-right"` - Top right corner
- `"top-left"` - Top left corner

On mobile devices, the widget automatically positions itself optimally regardless of the desktop setting.

## Default State Options

The `floatingDefaultState` option controls the initial appearance:

- `"expanded"` - Chat widget is open and ready to use (default)
- `"collapsed"` - Shows only the floating button; user can click to expand
- `"closed"` - Completely hidden; user needs to interact to show

**Note**: User preferences override this setting. If a user collapses or closes the widget, it will remember that choice on their next visit.

## API Methods

### ChatbotWidget.init(config)

Initialize the floating widget with the provided configuration.

```javascript
ChatbotWidget.init({
  clientId: "your-client-id",
  theme: "#eb4034",
  position: "bottom-right"
});
```

### ChatbotWidget.send(message)

Send a message programmatically:

```javascript
ChatbotWidget.send("Hello, I need help!");
```

### ChatbotWidget.unmount()

Destroy the widget and remove it from the page:

```javascript
ChatbotWidget.unmount();
```

### ChatbotWidget.getInstance()

Get the floating widget instance for advanced usage:

```javascript
const instance = ChatbotWidget.getInstance();
```

### ChatbotWidget.getChatWidget()

Get the underlying chat widget instance:

```javascript
const chatWidget = ChatbotWidget.getChatWidget();
if (chatWidget) {
  chatWidget.send("Custom message");
}
```

## User Interactions

### Expand
- User clicks the floating button
- Chat widget expands to full size
- Floating button hides

### Minimize
- User clicks the minimize button (inside the chat)
- Chat widget collapses to floating button
- State saved as "collapsed"

### Close
- User clicks the X button (on the floating button)
- Everything hides completely
- State saved as "closed"

All user preferences are stored in `localStorage` and persist across sessions.

## Comparison with Embedded Widget

| Feature | Floating Widget | Embedded Widget |
|---------|----------------|-----------------|
| Bundle File | `chatbot-widget-floating.js` | `chatbot-widget.js` |
| Size (gzipped) | 18.2 KB | 17.5 KB |
| Position | Fixed, floating | Embedded in container |
| Collapsible | Yes | No |
| Auto-positioning | Yes | No |
| Use Case | Website-wide chat | Specific page sections |

## Examples

### Basic Implementation

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to my website</h1>

  <!-- Your content here -->

  <!-- Floating Chat Widget -->
  <script src="https://cdn.yoursite.com/chatbot-widget-floating.js"
          site-key="your-site-key"
          async></script>
  <script>
    ChatbotWidget.init({
      clientId: "my-website-123"
    });
  </script>
</body>
</html>
```

### Custom Styling

```html
<script>
  ChatbotWidget.init({
    clientId: "my-website-123",
    theme: "#9c27b0",              // Purple theme
    themeMode: "dark",             // Dark mode
    position: "bottom-left",       // Left side
    floatingDefaultState: "collapsed",  // Start collapsed
    greetingMessage: "Welcome! How can we assist you today?"
  });
</script>
```

### Programmatic Control

```html
<script>
  // Initialize
  ChatbotWidget.init({
    clientId: "my-website-123",
    floatingDefaultState: "collapsed"
  });

  // Send a message when user clicks a button
  document.getElementById('help-btn').addEventListener('click', () => {
    ChatbotWidget.send("I need help with my order");
  });

  // Destroy widget on certain conditions
  if (userIsOnCheckoutPage) {
    ChatbotWidget.unmount();
  }
</script>
```

## Browser Support

The floating widget supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 12+)
- Mobile Chrome (Android 5+)

## Accessibility

The floating widget is built with accessibility in mind:

- Keyboard navigation support
- ARIA labels and roles
- Screen reader compatible
- High contrast mode support
- Touch-friendly buttons (44x44px minimum)

## Troubleshooting

### Widget not appearing

1. Check that the script tag has the correct `src` URL
2. Verify the `site-key` attribute is set
3. Ensure `clientId` is provided in the init config
4. Check browser console for error messages

### Widget appears in wrong position on mobile

The widget automatically adapts to mobile screens. Desktop position settings are overridden on small screens to ensure optimal placement.

### State not persisting

State persistence uses `localStorage`. Check that:
- Cookies/localStorage are not blocked
- User is on the same domain
- Browser supports localStorage

### Custom theme not working

Make sure to use a valid hex color format:
```javascript
theme: "#eb4034"  // Correct
theme: "eb4034"   // Wrong (missing #)
theme: "red"      // Wrong (use hex)
```

## Migration from WordPress Plugin

If you're currently using the WordPress plugin's floating mode, the standalone floating widget works the same way. Configuration mapping:

| WordPress Option | Floating Widget Option |
|-----------------|------------------------|
| Theme Color | `theme` |
| Theme Mode | `themeMode` |
| Position | `position` |
| Default State | `floatingDefaultState` |
| Greeting Message | `greetingMessage` |

## Demo

See `demo-floating.html` for a complete working example with multiple configuration options.

## Support

For issues or questions:
- Check the main [README.md](./README.md)
- Review the [demo file](./demo-floating.html)
- Contact support with your site-key and client-id

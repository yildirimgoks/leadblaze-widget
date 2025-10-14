# Chatbot Widget - Deployment Options

This document outlines the two deployment options available for the chatbot widget.

## Script Placement

**IMPORTANT**: All widget scripts and initialization code should be placed **right before the closing `</body>` tag** of your HTML document.

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <!-- Your CSS and meta tags here -->
</head>
<body>
  <!-- Your page content here -->

  <!-- ✅ PLACE WIDGET SCRIPTS HERE (before closing </body>) -->
  <script src="chatbot-widget.js" site-key="..."></script>
  <script>
    ChatbotWidget.init({ ... });
  </script>
</body>
</html>
```

**Why before `</body>`?**
- Ensures the DOM is loaded before the widget initializes
- Doesn't block page rendering
- Works with the `async` attribute
- Standard practice for third-party scripts

---

## Overview

| Feature | Embedded Widget | Floating Widget |
|---------|----------------|-----------------|
| **Bundle File** | `chatbot-widget.js` | `chatbot-widget-floating.js` |
| **Size (gzipped)** | ~17.5 KB | ~18.2 KB |
| **Deployment** | Embedded in a container element | Floating button anywhere on page |
| **Position** | Fills specified container | Fixed position (customizable) |
| **Collapsible** | No | Yes (minimize/close buttons) |
| **Best For** | Dedicated chat sections | Always-accessible site-wide chat |

---

## Option 1: Embedded Widget

### Description
The embedded widget is placed inside a specific container element on your page. It fills the container and becomes part of your page layout.

### Use Cases
- Dedicated support pages
- Product detail pages with chat
- Checkout assistance sections
- Knowledge base pages
- Any page where chat is a primary feature

### Installation

**Step 1**: Add a container element where you want the chat to appear (in the `<body>` of your HTML):

```html
<div id="my-chat-container" style="width: 100%; height: 600px;"></div>
```

**Step 2**: Add the widget script right before the closing `</body>` tag:

```html
<script src="https://cdn.yoursite.com/chatbot-widget.js"
        site-key="your-site-key"
        async></script>
```

**Step 3**: Initialize the widget after the script tag (still before `</body>`):

```html
<script>
  ChatbotWidget.init({
    clientId: "your-client-id",
    container: "#my-chat-container",
    theme: "#eb4034",
    themeMode: "light"
  });
</script>
```

**Complete Example**:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to Support</h1>

  <!-- Step 1: Container element where chat appears -->
  <div id="my-chat-container" style="width: 100%; height: 600px;"></div>

  <!-- Step 2: Widget script (before closing </body>) -->
  <script src="https://cdn.yoursite.com/chatbot-widget.js"
          site-key="your-site-key"
          async></script>

  <!-- Step 3: Initialize widget -->
  <script>
    ChatbotWidget.init({
      clientId: "your-client-id",
      container: "#my-chat-container",
      theme: "#eb4034",
      themeMode: "light"
    });
  </script>
</body>
</html>
```

### Features
- Full control over size and position via CSS
- Integrates seamlessly with page layout
- Can have multiple instances on same page
- No floating elements
- Responsive to container size

### Limitations
- Requires dedicated page space
- Not visible when scrolling away
- Must specify container element
- Cannot be minimized/maximized

---

## Option 2: Floating Widget (NEW)

### Description
The floating widget appears as a collapsible button that can expand into a full chat interface. It stays visible as users scroll and can be positioned in any corner of the screen.

### Use Cases
- E-commerce sites
- Marketing websites
- SaaS applications
- Any site wanting always-accessible support
- Mobile-optimized chat experiences

### Installation

**No container element needed!** The floating widget creates its own elements.

**Step 1**: Add the widget script right before the closing `</body>` tag:

```html
<script src="https://cdn.yoursite.com/chatbot-widget-floating.js"
        site-key="your-site-key"
        async></script>
```

**Step 2**: Initialize the widget after the script tag (still before `</body>`):

```html
<script>
  ChatbotWidget.init({
    clientId: "your-client-id",
    theme: "#eb4034",
    position: "bottom-right",
    floatingDefaultState: "collapsed"
  });
</script>
```

**Complete Example**:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to my website</h1>
  <p>Your page content here...</p>

  <!-- No container element needed! -->

  <!-- Step 1: Widget script (before closing </body>) -->
  <script src="https://cdn.yoursite.com/chatbot-widget-floating.js"
          site-key="your-site-key"
          async></script>

  <!-- Step 2: Initialize widget -->
  <script>
    ChatbotWidget.init({
      clientId: "your-client-id",
      theme: "#eb4034",
      position: "bottom-right",
      floatingDefaultState: "collapsed"
    });
  </script>
</body>
</html>
```

### Features
- Always visible while scrolling
- Collapsible to save screen space
- Can be closed by user
- Remembers user preference (collapsed/expanded)
- Auto-positioning for mobile
- 4 corner position options
- Smooth expand/collapse animations

### Unique Options

```javascript
ChatbotWidget.init({
  clientId: "your-client-id",

  // Floating-specific options
  position: "bottom-right",          // "bottom-right", "bottom-left", "top-right", "top-left"
  floatingDefaultState: "expanded",  // "expanded", "collapsed", "closed"

  // Common options
  theme: "#eb4034",
  themeMode: "light",
  greetingMessage: "Hi! How can I help?"
});
```

### User Controls
- **Minimize Button**: Inside chat - collapses to floating button
- **Close Button**: On floating button - hides everything
- **Expand Button**: On collapsed button - opens chat

---

## Choosing the Right Option

### Choose Embedded Widget If:
- You have a dedicated support/contact page
- Chat is a primary feature of the page
- You want full control over positioning
- You need multiple chat instances
- You prefer traditional web layout

### Choose Floating Widget If:
- You want site-wide chat availability
- Screen space is limited
- Users should access chat from anywhere
- Mobile experience is a priority
- You want modern, app-like UX
- Similar to WordPress plugin behavior

---

## Configuration Comparison

### Common Configuration Options

Both widgets share these core options:

```javascript
{
  clientId: "string",           // Required
  sessionId: "uuid",            // Optional - auto-generated
  theme: "string",              // Hex color or "light"/"dark"
  themeMode: "string",          // "light" or "dark"
  locale: "string",             // Language code (default: "en")
  apiEndpoint: "string",        // Custom API URL
  greetingMessage: "string",    // Custom greeting
  skipGreeting: boolean         // Skip initial greeting
}
```

### Embedded-Only Options

```javascript
{
  container: "string|element",  // Required - CSS selector or DOM element
  history: Array                // Optional - message history to inject
}
```

### Floating-Only Options

```javascript
{
  position: "string",               // "bottom-right", "bottom-left", "top-right", "top-left"
  floatingDefaultState: "string"    // "expanded", "collapsed", "closed"
}
```

---

## API Methods Comparison

### Shared Methods

Both widgets support:

```javascript
ChatbotWidget.init(config)     // Initialize widget
ChatbotWidget.send(message)    // Send message programmatically
ChatbotWidget.unmount()        // Destroy widget
```

### Embedded-Specific Methods

```javascript
ChatbotWidget.getInstance(container)  // Get instance for specific container
```

### Floating-Specific Methods

```javascript
ChatbotWidget.getInstance()      // Get floating widget instance
ChatbotWidget.getChatWidget()    // Get underlying chat widget
```

---

## Migration Guide

### From Embedded to Floating

**Before** (Embedded Widget):
```html
<!DOCTYPE html>
<html>
<body>
  <!-- Container element -->
  <div id="chat-container" style="width: 100%; height: 600px;"></div>

  <!-- Script before </body> -->
  <script src="chatbot-widget.js" site-key="..."></script>
  <script>
    ChatbotWidget.init({
      clientId: "...",
      container: "#chat-container"
    });
  </script>
</body>
</html>
```

**After** (Floating Widget):
```html
<!DOCTYPE html>
<html>
<body>
  <!-- No container element needed - remove the div -->

  <!-- Script before </body> -->
  <script src="chatbot-widget-floating.js" site-key="..."></script>
  <script>
    ChatbotWidget.init({
      clientId: "...",
      position: "bottom-right",
      floatingDefaultState: "collapsed"
    });
  </script>
</body>
</html>
```

**Changes**:
1. Change script source from `chatbot-widget.js` to `chatbot-widget-floating.js`
2. Remove the container `<div>` element
3. Remove `container` option from init config
4. Add floating-specific options: `position` and `floatingDefaultState`

### From Floating to Embedded

**Before** (Floating Widget):
```html
<!DOCTYPE html>
<html>
<body>
  <!-- No container element -->

  <!-- Script before </body> -->
  <script src="chatbot-widget-floating.js" site-key="..."></script>
  <script>
    ChatbotWidget.init({
      clientId: "...",
      position: "bottom-right",
      floatingDefaultState: "collapsed"
    });
  </script>
</body>
</html>
```

**After** (Embedded Widget):
```html
<!DOCTYPE html>
<html>
<body>
  <!-- Add container element where you want chat -->
  <div id="chat-container" style="width: 100%; height: 600px;"></div>

  <!-- Script before </body> -->
  <script src="chatbot-widget.js" site-key="..."></script>
  <script>
    ChatbotWidget.init({
      clientId: "...",
      container: "#chat-container"
    });
  </script>
</body>
</html>
```

**Changes**:
1. Change script source from `chatbot-widget-floating.js` to `chatbot-widget.js`
2. Add a container `<div>` element where you want the chat to appear
3. Add `container` option to init config (CSS selector or DOM element)
4. Remove floating-specific options: `position` and `floatingDefaultState`

---

## WordPress Plugin Comparison

The WordPress plugin includes both deployment modes:

| WordPress Setting | Maps To |
|------------------|---------|
| Enable Floating = OFF | Embedded Widget |
| Enable Floating = ON | Floating Widget |
| Container Selector | Embedded: `container` option |
| Position | Floating: `position` option |
| Default State | Floating: `floatingDefaultState` |

The standalone floating widget (`chatbot-widget-floating.js`) provides the same functionality as the WordPress plugin's floating mode, but for any website.

---

## Examples

See the demo files for working examples:

- **Embedded Widget**: `demo.html`
- **Floating Widget**: `demo-floating.html`

---

## Quick Copy-Paste Templates

### Embedded Widget Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>
<body>
  <h1>Your Content</h1>

  <!-- 1. Add container where you want chat -->
  <div id="my-chat" style="width: 100%; height: 600px;"></div>

  <!-- 2. Add widget script before </body> -->
  <script src="https://cdn.yoursite.com/chatbot-widget.js"
          site-key="YOUR_SITE_KEY_HERE"
          async></script>

  <!-- 3. Initialize widget -->
  <script>
    ChatbotWidget.init({
      clientId: "YOUR_CLIENT_ID_HERE",
      container: "#my-chat",
      theme: "#eb4034",
      themeMode: "light"
    });
  </script>
</body>
</html>
```

### Floating Widget Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>
<body>
  <h1>Your Content</h1>

  <!-- No container needed! -->

  <!-- 1. Add widget script before </body> -->
  <script src="https://cdn.yoursite.com/chatbot-widget-floating.js"
          site-key="YOUR_SITE_KEY_HERE"
          async></script>

  <!-- 2. Initialize widget -->
  <script>
    ChatbotWidget.init({
      clientId: "YOUR_CLIENT_ID_HERE",
      theme: "#eb4034",
      position: "bottom-right",
      floatingDefaultState: "expanded"
    });
  </script>
</body>
</html>
```

---

## Using Both Widgets Together (Advanced)

Both the embedded and floating widgets can coexist on the same page without conflicts. This is useful when you want:
- A floating widget for site-wide availability
- An embedded widget on specific pages (e.g., support page, product pages)
- Different chat contexts for different purposes

### How It Works

The widgets use a unified API that automatically detects and preserves both instances:

1. **Load Order Independent**: Both scripts can load in any order without conflicts
2. **Separate Instances**: Each widget maintains its own state and chat history
3. **Unified Namespace**: Both widgets share `window.ChatbotWidget` with auto-detection
4. **Explicit Methods**: Use `initFloating()` for floating widget, `init({ container })` for embedded

### Installation

**Step 1**: Add both widget scripts before `</body>`:

```html
<!-- Load both scripts - order doesn't matter -->
<script src="https://cdn.yoursite.com/chatbot-widget.js"
        site-key="your-site-key"
        async></script>

<script src="https://cdn.yoursite.com/chatbot-widget-floating.js"
        site-key="your-site-key"
        async></script>
```

**Step 2**: Initialize both widgets after the scripts:

```html
<script>
  // Initialize embedded widget in container
  ChatbotWidget.init({
    clientId: "your-client-id",
    container: "#support-chat",
    theme: "#eb4034"
  });

  // Initialize floating widget (no container needed)
  ChatbotWidget.init({
    clientId: "your-client-id",
    position: "bottom-right",
    floatingDefaultState: "collapsed"
  });
</script>
```

### Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Page with Both Widgets</title>
</head>
<body>
  <h1>Customer Support</h1>

  <p>Chat with us below for immediate assistance:</p>

  <!-- Embedded widget container -->
  <div id="support-chat" style="width: 100%; height: 600px;"></div>

  <p>Or use the floating button to chat while browsing other sections.</p>

  <!-- Load both widget scripts before </body> -->
  <script src="https://cdn.yoursite.com/chatbot-widget.js"
          site-key="your-site-key"
          async></script>

  <script src="https://cdn.yoursite.com/chatbot-widget-floating.js"
          site-key="your-site-key"
          async></script>

  <!-- Initialize both widgets -->
  <script>
    // Embedded widget (auto-detects due to 'container' parameter)
    ChatbotWidget.init({
      clientId: "your-client-id",
      container: "#support-chat",
      theme: "#eb4034",
      themeMode: "light"
    });

    // Floating widget (auto-detects due to no 'container' parameter)
    ChatbotWidget.init({
      clientId: "your-client-id",
      theme: "#eb4034",
      position: "bottom-right",
      floatingDefaultState: "collapsed"
    });
  </script>
</body>
</html>
```

### API Methods with Both Widgets

When both widgets are present, the generic methods use this priority:

```javascript
// Generic send() - tries floating first, then embedded
ChatbotWidget.send("Hello");  // Sends to floating widget if available

// Send to specific widget
ChatbotWidget.send("Hello", "#support-chat");  // Sends to embedded widget

// Get specific instance
ChatbotWidget.getInstance();              // Returns floating widget instance
ChatbotWidget.getInstance("#support-chat");  // Returns embedded widget instance

// Unmount specific widget
ChatbotWidget.unmount();                  // Unmounts floating widget
ChatbotWidget.unmount("#support-chat");   // Unmounts embedded widget
```

### Explicit Methods

For clearer code when using both widgets, you can use explicit methods:

```javascript
// Floating-specific methods
ChatbotWidget.initFloating({
  clientId: "your-client-id",
  position: "bottom-right"
});

ChatbotWidget.sendFloating("Hello");
ChatbotWidget.getFloatingInstance();
ChatbotWidget.unmountFloating();

// Embedded methods still work normally
ChatbotWidget.init({
  clientId: "your-client-id",
  container: "#support-chat"
});
```

### Use Cases for Both Widgets

**1. Support Page with Site-wide Access**
- Embedded widget on `/support` page for focused help
- Floating widget on all pages for quick questions

**2. Product-Specific Chat + General Chat**
- Embedded widget on product pages with product-specific context
- Floating widget for general inquiries anywhere

**3. Mobile-Optimized Experience**
- Embedded widget shows on desktop for better UX
- Floating widget provides mobile-friendly access

**4. Progressive Enhancement**
- Start with floating widget site-wide
- Add embedded widget to high-value pages for prominence

### Technical Details

**Instance Isolation**
- Each widget has its own Shadow DOM
- Separate chat histories and sessions
- Independent state management
- No CSS or JavaScript conflicts

**API Namespace Management**
- Floating widget script preserves existing embedded widget methods
- Auto-detection based on `container` parameter presence
- Fallback chain: floating → embedded → error

**Load Order**
- Scripts can load in any order (async-safe)
- Each script checks for existing namespace before overwriting
- All methods preserved from whichever loads first

**Performance Considerations**
- Total size: ~35 KB gzipped (both bundles)
- Shadow DOM provides isolation without performance penalty
- Independent lazy-loading of chat widgets

---

## Additional Resources

- [Main README](./README.md) - Project overview
- [FLOATING-WIDGET.md](./FLOATING-WIDGET.md) - Detailed floating widget docs
- [CLAUDE.md](./CLAUDE.md) - Project brief and specifications

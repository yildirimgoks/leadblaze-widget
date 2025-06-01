# Project Brief – Embeddable Chatbot Widget (Vanilla JS)

---

## 1 · Objective

Build a **light‑weight, fully‑responsive JavaScript widget** that any 3rd‑party website can embed to provide chat functionality powered by our existing backend (`https://chatbotbackend.com/chat`). The widget must work seamlessly on **desktop and mobile browsers**, offer a polished, accessible UX, and expose a simple global API for clients to initialise and control the chat.

---

## 2 · High‑Level Scope

| Component                           | Responsibility                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `chatbot-widget.js` (≈ ≤25 KB gzip) | Injects UI, handles state, communicates with backend.                        |
| CDN Hosting                         | Serves the minified bundle at `https://cdn.ourdomain.com/chatbot-widget.js`. |
| Build Pipeline                      | Rollup (IIFE output) + Babel (ES2017 target) + Terser + PostCSS.             |

---

## 3 · Embed Snippet (for client sites)

```html
<!-- Host decides where the chat appears -->
<div id="myChatArea"></div>

<script src="https://cdn.ourdomain.com/chatbot-widget.js"></script>
<script>
  ChatbotWidget.init({
    apiKey: "<client‑public‑key>",
    clientId: "<string>",        // forwarded to backend
    sessionId: "<uuid-v4>",      // auto‑generate if blank
    container: "#myChatArea",     // CSS selector or DOM element
    theme: "light",              // 'light' | 'dark' | custom hex
    locale: "en"                 // ISO 639‑1
  });
</script>
```

---

## 4 · Functional Requirements

1. **Global namespace** `window.ChatbotWidget` with:
   • `init(config)` — boots the widget (idempotent).
   • `unmount()` – destroys the widget and detaches event listeners.
   • `send(message: string)` – programmatic send.
2. **Message Flow**
   a. POST `session_id`, `client_id`, `body` to `https://chatbotbackend.com/chat`.
   b. Parse `{ body: string }` response and render.
   c. Display **typing indicator** while awaiting response.
3. **Error Handling**
   • Exponential back‑off for network errors.
   • Graceful UI fallback (toast + retry button).
4. **Security**
   • All requests via HTTPS.
   • Escape / sanitise user and bot text (DOMPurify).
   • CORS pre‑flight handled by backend.

---

## 5 · UI / UX Requirements

| Area                 | Best‑practice Details                                                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout**           | Widget fills 100 % of its host container element. Integrators control placement by inserting that container anywhere in their DOM. Recommended minimum: 320 × 400 px.      |
| **Animations**       | • Fade‑in or slide‑in animation on **initial mount** (100–150 ms).  • Message bubble scale‑in (≈ 60 ms, `requestAnimationFrame`).                                          |
| **Auto‑scroll**      | Auto‑scroll to bottom **only if** user is already at (or near) bottom; preserve scroll position when user is reading older messages. Use `IntersectionObserver` to detect. |
| **Typing indicator** | Three‑dot pulsating SVG, starts on request, ends on first token of response.                                                                                               |
| **Input UX**         | Multi‑line textarea, `Enter` sends, `Shift+Enter` line‑break. Disable while awaiting response.                                                                             |
| **Accessibility**    | ARIA roles (`role="dialog"`, `aria-live="polite"`), tab order, high‑contrast friendly colours (WCAG AA contrast ≥ 4.5).                                                    |
| **Touch Targets**    | Min 44 × 44 px.                                                                                                                                                            |
| **Keyboard**         | Automatically focus input on open, ensure iOS viewport doesn’t jump (use `viewport-fit=cover`).                                                                            |
| **Theme**            | Light & dark presets, CSS vars for easy re‑theme.                                                                                                                          |

---

## 6 · Responsiveness

* **Mobile first** — flexbox column layout; widget naturally scales to the full width/height of its container without relying on overlays.<br>
* Breakpoints: `max-width: 600px` (mobile), `601–1024px` (tablet), `>1024px` (desktop).<br>
* Use `rem` + `%` units; avoid fixed px except for min‑sizes.<br>
* Detect virtual keyboard height on iOS/Android and adjust scroll container padding accordingly.

---

## 7 · Technical Implementation Notes

1. **Shadow DOM**: Wrap widget in closed Shadow DOM to avoid host‑page CSS collisions. <br>
2. **Styling**: Author in SCSS or PostCSS → inline critical CSS; rest in a single shadow root `<style>` tag. <br>
3. **Bundling**: Rollup config targets modern browsers (ES2017) + automatic backwards‑compat (core‑js polyfills if needed). <br>
4. **Size Budget**: ≤ 25 KB gzip (excludes polyfills loaded conditionally). <br>
5. **Dependencies**: Only tiny utilities; avoid large frameworks. Consider `htm` (+ `preact` optional) **only if** bundle stays within budget. <br>
6. **Testing**: Unit (Jest), E2E (Playwright) across Chrome, Safari, Firefox, Edge, mobile Safari/Chrome. <br>
7. **CI/CD**: GitHub Actions – lint, test, bundle size check → CDN deploy on `main` branch.

---

## 8 · Deliverables

1. `dist/chatbot-widget.js` & sourcemap
2. Source code repo with README & integration guide
3. Design tokens / theme file
4. Test suite & CI config
5. Brief integration demo (HTML page)

---

## 9 · Milestone & Timeline (suggested)

| Week | Milestone                                            |
| ---- | ---------------------------------------------------- |
|  1   | Project setup, Rollup pipeline, Shadow DOM PoC       |
|  2   | Core message flow, backend integration, error states |
|  3   | UI polish, animations, mobile responsiveness         |
|  4   | Accessibility, theme system, size optimisation       |
|  5   | Testing matrix, docs, demo page, CDN deploy          |

---

## 10 · Acceptance Criteria

* Widget embeds via 2‑line snippet and runs without console errors on latest Chrome, Safari, Firefox, Edge.
* Correct POST requests hit backend and render responses with typing indicator.
* Widget adapts fluidly to different container sizes on both mobile and desktop browsers.
* Bundle ≤ 25 KB gzip, no external runtime dependencies.
* All tests pass in CI; manual QA checklist signed‑off.

---

# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` (entry `src/index.js` → builds to `dist/chatbot-widget.js`).
- Modules: `src/components/` (UI), `src/utils/` (API, UUID, Shadow DOM, styles), `src/styles/` (SCSS).
- Demos/fixtures: `demo.html`, `test-*.html` in repo root.
- Build output: `dist/` (bundle + sourcemap).
- Packaging: `scripts/package-wordpress.js` and `wordpress/` for WP plugin zip.

## Build, Test, and Development Commands
- `npm run dev`: Rollup watch build for local development.
- `npm run build`: Production bundle to `dist/` (IIFE, minified, sourcemap).
- `npm run lint`: ESLint over `src/**/*.js`.
- `npm run test`: Jest unit tests (configure/author tests under `src/`).
- `npm run test:e2e`: Playwright end-to-end tests (optional if present).
- `npm run size-check`: Enforces ≤25KB gzipped bundle (`dist/chatbot-widget.js`).
- `npm run build:wp`: Build + package WordPress plugin zip in `dist/`.

## Coding Style & Naming Conventions
- JavaScript modules (ES2021). Indent 2 spaces; semicolons required; single quotes.
- ESLint rules: `no-unused-vars:error`, `no-console:warn` (console is dropped in prod build).
- Files: kebab-case (e.g., `chat-ui.js`); classes PascalCase; functions camelCase.
- Keep components presentational in `components/`; put logic/helpers in `utils/`.

## Testing Guidelines
- Unit: place `*.test.js` alongside modules in `src/` (e.g., `src/utils/uuid.test.js`).
- Focus coverage on `utils/` (UUID, API, history/session) and component behaviors.
- E2E: use `npm run test:e2e` for integration flows; demos in `demo.html` and `test-*.html` assist manual checks.

## Commit & Pull Request Guidelines
- Do not ever interact with git

## Security & Configuration Tips
- The `site-key` is required via the script tag and is sent as `x-site-key` to the backend; ensure CORS and origin checks server-side.
- All message content is sanitized (DOMPurify); avoid introducing unsafe HTML.
- For debugging, you may enable logging via `localStorage.setItem('chatbot-debug', 'true')` locally.


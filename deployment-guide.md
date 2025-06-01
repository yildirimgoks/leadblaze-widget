# Deployment Guide

This guide covers how to deploy the Leadgate Widget using Docker and static hosting.

## 🚀 Quick Deployment Options

### 1. Docker Deployment

```bash
# First, build the widget
npm run build

# Build the Docker image (serves pre-built files)
docker build -t leadgate-widget .

# Run the container
docker run -p 3000:80 leadgate-widget

# Widget available at: http://localhost:3000/chatbot-widget.js
```

### 2. Static Hosting Deployment

#### Build the Widget
```bash
npm install
npm run build
```

#### Deploy to Static Host
Upload the `dist/chatbot-widget.js` file to:
- AWS S3 + CloudFront
- Vercel
- Netlify
- GitHub Pages
- Any CDN or static hosting service

## 📋 Environment Setup

### GitHub Repository Setup

1. **Initialize Git Repository**
```bash
cd /path/to/chatbot-widget
git init
git add .
git commit -m "Initial commit"
```

2. **Add Remote and Push**
```bash
git remote add origin https://github.com/yildirimgoks/leadgate-widget.git
git branch -M main
git push -u origin main
```

### GitHub Actions Setup

The repository includes automatic CI/CD via GitHub Actions:

- **Triggers**: Push to `main` or `master` branch
- **Actions**:
  - Install dependencies
  - Run linting (optional)
  - Build widget (`npm run build`)
  - Check bundle size
  - Upload build artifacts to GitHub

## 🔧 Configuration Options

### Environment Variables

For Docker deployment, you can set these environment variables:

```bash
# Production environment
NODE_ENV=production

# Health check endpoint
HEALTH_CHECK_PATH=/health
```

### Custom Domain Setup

#### Docker with Reverse Proxy
Run Docker behind a reverse proxy:
```bash
# Run with custom domain via reverse proxy
docker run -d --name leadgate-widget -p 3000:80 leadgate-widget
```

## 📊 Monitoring and Logs

### Health Checks
The Docker deployment includes health check endpoints:
- **Endpoint**: `/health`
- **Response**: `200 OK` with "healthy" text
- **Docker**: Built-in health check every 30s

### Accessing Logs

#### Docker
```bash
# Real-time logs
docker logs -f leadgate-widget

# Container status
docker ps
```

### Performance Monitoring
Monitor these metrics:
- Response time for `/chatbot-widget.js`
- Bundle size (should stay under 25KB gzipped)
- Error rates
- Usage analytics

## 🛡️ Security Considerations

### CORS Configuration
The nginx configuration allows embedding from any domain:
```nginx
add_header Access-Control-Allow-Origin "*" always;
```

For production, consider restricting to specific domains:
```nginx
add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
```

### Content Security Policy
Add CSP headers for additional security:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline';" always;
```

## 🔄 Continuous Integration Workflow

1. **Developer pushes code** → GitHub repository
2. **GitHub Actions triggers** → Automatic build process
3. **Widget gets built** → `npm run build` creates production bundle
4. **Artifacts stored** → Built files available for download

### Manual Build Process
```bash
# Build locally
npm run build

# Files will be in dist/ folder
ls dist/
```

## 📱 Testing Deployment

### Local Testing
```bash
# Test built widget locally
cd dist
python -m http.server 8000
# Access: http://localhost:8000/chatbot-widget.js
```

### Production Testing
```javascript
// Test widget loading
const script = document.createElement('script');
script.src = 'https://your-widget-domain.com/chatbot-widget.js';
script.onload = () => {
  ChatbotWidget.init({
    clientId: 'test-client',
    container: '#test-container'
  });
};
document.head.appendChild(script);
```

## 🆘 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (requires 16+)
   - Run `npm install` to update dependencies
   - Check for TypeScript/linting errors

2. **CORS Errors**
   - Verify nginx CORS configuration
   - Check if domain restrictions are too strict

3. **Widget Not Loading**
   - Verify file exists at `/chatbot-widget.js`
   - Check browser console for errors
   - Verify MIME type is `application/javascript`

4. **Docker Build Issues**
   - Verify Dockerfile builds locally
   - Check nginx configuration syntax
   - Review container logs

### Getting Help
- GitHub Issues: https://github.com/yildirimgoks/leadgate-widget/issues
- Docker documentation: https://docs.docker.com
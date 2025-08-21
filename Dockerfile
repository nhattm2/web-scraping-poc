# Use official Playwright image that already contains browsers and dependencies
# Match the Playwright version from package.json (1.46.0)
FROM mcr.microsoft.com/playwright:v1.46.0-jammy

# Set working directory
WORKDIR /app

# Environment optimizations
ENV NODE_ENV=production \
    # Playwright base image already has browsers; skip re-download on npm install
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Install dependencies only (leverage Docker layer caching)
COPY package*.json ./
# Use npm install because a lockfile may not be present in the repo
RUN npm install --omit=dev

# Copy application source
COPY src ./src
COPY README.md ./README.md

# Expose API port
EXPOSE 3000

# Default command runs the API server
CMD ["node", "src/server.js"]

FROM node:22.14.0-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install pnpm and dependencies
RUN npm install

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 8080

# Wrap stdio MCP server with mcp-proxy (streamable HTTP + SSE on port 8080)
CMD ["npx", "mcp-proxy", "--port", "8080", "--", "node", "dist/index.js"] 
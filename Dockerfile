# Use ECR Public mirror to avoid Docker Hub anonymous rate limit (429) on shared CI/build IPs
FROM public.ecr.aws/docker/library/node:22.14.0-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies only (--ignore-scripts: avoid "prepare" running build+test before source is copied)
RUN npm install --ignore-scripts

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 8080

# Wrap stdio MCP server with mcp-proxy (streamable HTTP + SSE on port 8080)
CMD ["npx", "mcp-proxy", "--port", "8080", "--", "node", "dist/index.js"] 
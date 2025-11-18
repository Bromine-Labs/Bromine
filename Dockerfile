# Use Bun image for both build and runtime
FROM docker.io/oven/bun:alpine AS build

WORKDIR /app

# Copy dependencies
COPY package.json bun.lock tsconfig.json ./
RUN bun install --production

# Copy source code
COPY . .

# Optional: build step if you have a build script
RUN bun run build

# Use same Bun image for runtime
FROM docker.io/oven/bun:alpine

WORKDIR /app

# Copy built files (or just copy everything if needed)
COPY --from=build /app .

EXPOSE 8080  # default Bun server port

# Run your Bun server
CMD ["bun", "run", "server.js"]

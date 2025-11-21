# Use Bun image for both build and runtime
FROM docker.io/oven/bun:alpine AS build

WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
RUN bun install --production

COPY . .

RUN bun run build

FROM docker.io/oven/bun:alpine

WORKDIR /app

COPY --from=build /app .
ENV PUBLIC_HOST_WISP="true"

EXPOSE 8080

# Run your Bun server
CMD ["bun", "run", "server.js"]

# ---------- Stage 1: install dependencies ----------
# Start from an official image that already has Node 24 on Alpine Linux (a very small distro).
FROM node:24-alpine AS deps

# All following commands run inside /app in the image.
WORKDIR /app

# Copy ONLY the dependency manifests first, so this layer stays cached until dependencies change.
COPY package.json package-lock.json ./

# npm ci installs exactly what the lockfile says (reproducible builds).
# --omit=dev skips jest, eslint etc., which the running app never needs.
RUN npm ci --omit=dev

# ---------- Stage 2: the image that actually ships ----------
FROM node:24-alpine AS runtime

# Apply the latest OS security patches, then delete npm itself:
# the app only needs "node" at runtime, and npm is a common source of scanner findings.
RUN apk upgrade --no-cache \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

WORKDIR /app

# Take the installed packages from stage 1; everything else in stage 1 is discarded.
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY public ./public

# Build-time inputs. The pipeline passes the real commit SHA and version here.
ARG GIT_SHA=local
ARG APP_VERSION=dev

# Environment variables baked into the image; the app reads these in /api/info.
ENV NODE_ENV=production PORT=3000 GIT_SHA=$GIT_SHA APP_VERSION=$APP_VERSION

# Drop root. A numeric UID lets Kubernetes verify the container is non-root.
USER 1000:1000

# Documents which port the app listens on.
EXPOSE 3000

# The process to start. The array form makes node PID 1, so it receives
# Kubernetes' SIGTERM directly and can shut down gracefully.
CMD ["node", "src/server.js"]
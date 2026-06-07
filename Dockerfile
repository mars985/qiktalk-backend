# syntax=docker/dockerfile:1

# ---------- Build stage ----------
# Full image has the toolchain needed to install native addons (e.g. bcrypt).
# This stage is discarded, so its size doesn't affect the final image.
FROM node:20-bookworm AS build

WORKDIR /app

# Compilers/python in case no prebuilt bcrypt binary matches the build platform.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies against the lockfile first for better layer caching.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the application source.
COPY . .

# ---------- Runtime stage ----------
# Slim image keeps the deployed container small.
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=4501

WORKDIR /app

# Bring over the installed deps + source, owned by the unprivileged node user.
COPY --from=build --chown=node:node /app ./

# Run as a non-root user (shipped with the official image).
USER node

EXPOSE 4501

# Uses Node's built-in fetch (Node 18+) so no extra tools are needed.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4501)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "app.js"]

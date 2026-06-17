# Build context is the repo root: docker build -f apps/web/Dockerfile .
FROM node:22-slim

RUN corepack enable
WORKDIR /repo

# NEXT_PUBLIC_* is inlined at build time, so the client API base must be set before `next build`.
# Default to the same-origin proxy path so the httpOnly auth cookie stays first-party.
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# The /api → API rewrite destination is baked into the route manifest at build time, so the
# proxy target must also be set before `next build` (runtime env alone is ignored by the rewrite).
ARG API_PROXY_TARGET=http://localhost:4000
ENV API_PROXY_TARGET=$API_PROXY_TARGET

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter @rag/web...

COPY tsconfig.base.json ./
COPY apps/web ./apps/web
RUN pnpm --filter @rag/web build

WORKDIR /repo/apps/web
ENV NODE_ENV=production
EXPOSE 3001
CMD ["pnpm", "start"]

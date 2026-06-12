# Build context is the repo root: docker build -f apps/api/Dockerfile .
FROM node:22-slim

# Prisma needs OpenSSL at runtime; corepack provides pnpm.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

WORKDIR /repo

# Install api deps first (better layer caching). Both workspace manifests are needed
# so pnpm can resolve the lockfile under --frozen-lockfile.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
# Schema must exist before install: the api postinstall runs `prisma generate`.
COPY apps/api/prisma apps/api/prisma
RUN pnpm install --frozen-lockfile --filter @rag/api...

COPY tsconfig.base.json ./
COPY apps/api ./apps/api
RUN pnpm --filter @rag/api build

WORKDIR /repo/apps/api
ENV NODE_ENV=production
EXPOSE 4000

# Apply migrations, then start. The embedding model downloads on first request.
# nest build nests its output under dist/src because tsconfig also compiles test/.
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/src/main.js"]

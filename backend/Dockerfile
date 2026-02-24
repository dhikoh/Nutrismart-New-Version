FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# CRITICAL: Force development mode so npm ci installs ALL deps
# including @nestjs/cli (devDependency). This overrides Coolify's
# injected ARG NODE_ENV=production which would skip devDeps.
ENV NODE_ENV=development
RUN npm ci

COPY . .

# Generate Prisma client then compile NestJS TypeScript
RUN npx prisma generate && ./node_modules/.bin/nest build

# Verify dist/main.js exists — fail loudly if not
RUN test -f dist/main.js || (echo "ERROR: dist/main.js not found. Build failed." && exit 1)

# ─── Runner Stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production deps (no devDeps needed at runtime)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts and Prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main"]

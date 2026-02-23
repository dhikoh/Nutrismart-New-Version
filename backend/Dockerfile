FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (all, including devDeps for nest build)
COPY package*.json ./
COPY prisma ./prisma/

# Always install ALL deps in builder (including @nestjs/cli in devDeps)
RUN npm ci

COPY . .

# Generate Prisma client then build NestJS
RUN npx prisma generate && npm run build

# Verify dist/main.js exists — fail loudly if not
RUN test -f dist/main.js || (echo "ERROR: dist/main.js not found. Build failed." && exit 1)

# ─── Runner Stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Only copy production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts and prisma from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main"]

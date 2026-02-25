FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install ALL deps (nest/cli is in dependencies now)
RUN npm ci --include=dev

COPY src ./src

# Generate Prisma client
RUN npx prisma generate

# Build with tsc directly — reliable across all environments
RUN ./node_modules/.bin/tsc -p tsconfig.build.json

# Verify output
RUN ls -la dist/ && echo "dist/main.js exists: $(ls dist/main.js)"

# ─── Runner Stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

EXPOSE 3000

CMD ["node", "dist/main"]

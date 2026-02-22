FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
# FORCE DEVELOPMENT MODE FOR INSTALLING DEV DEPENDENCIES (like @nestjs/cli)
ENV NODE_ENV=development
RUN npm ci

COPY . .
RUN npx prisma generate
ENV NODE_ENV=production
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "run", "start:prod"]

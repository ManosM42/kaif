# Στάδιο 1: Χτίσιμο της εφαρμογής (TanStack Start SSR)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --progress=false
COPY . .
RUN npm run build

# Στάδιο 2: Runtime — τρέχει ο Node server του Nitro (όχι Nginx static)
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
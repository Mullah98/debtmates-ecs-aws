# Stage 1: Build stage

FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# Stage 2: Production stage

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist 
COPY --from=builder /app/server.js ./

RUN adduser -D appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]
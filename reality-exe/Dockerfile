FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# Bundle server into single clean JavaScript file
RUN npx esbuild server/index.ts --bundle --platform=node --target=node20 --format=esm --packages=external --outfile=server-dist/index.mjs

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server-dist ./server-dist

EXPOSE 8080
CMD ["node", "server-dist/index.mjs"]

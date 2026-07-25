FROM node:22-alpine AS client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
COPY .env.example /app/.env
RUN npm run build

FROM node:22-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY api ./api
COPY database ./database
COPY scripts ./scripts
COPY utils ./utils
COPY index.js ./
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 3000
CMD ["node", "index.js"]

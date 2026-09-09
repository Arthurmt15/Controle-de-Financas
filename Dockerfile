FROM node:20-slim

WORKDIR /app

# Invalidate cache by adding ARG
ARG BUILD_TIME=now

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/tsconfig.json ./server/
COPY server/src ./server/src/
RUN cd server && npx tsc

EXPOSE 3001

CMD ["node", "server/dist/index.js"]

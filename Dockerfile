FROM node:20-slim

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Force rebuild: source code changes
ARG SOURCE_VERSION=1
COPY server/tsconfig.json ./server/
COPY server/src ./server/src/
RUN cd server && npx tsc

EXPOSE 3001

CMD ["node", "server/dist/index.js"]

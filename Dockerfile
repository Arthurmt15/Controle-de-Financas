FROM node:20-slim

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/tsconfig.json ./server/
COPY server/src ./server/src/
RUN cd server && npx tsc

EXPOSE 5000

CMD ["node", "server/dist/index.js"]

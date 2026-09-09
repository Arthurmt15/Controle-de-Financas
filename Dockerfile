FROM node:20-slim

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install

COPY server/src ./server/src/
COPY server/tsconfig.json ./server/
RUN cd server && npm run build

EXPOSE 3001

CMD ["node", "server/dist/index.js"]

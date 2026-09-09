FROM node:20-slim

WORKDIR /app

# Force full rebuild - v2
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/dist ./server/dist/

EXPOSE 3001

CMD ["node", "server/dist/index.js"]

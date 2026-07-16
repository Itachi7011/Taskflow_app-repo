# /backend/DockerFile
# ---- deps stage ----
# separate stage just for installing deps so docker can cache this layer
# and not reinstall node_modules every single time we change a route file
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# ---- final stage ----
FROM node:20-alpine
WORKDIR /app

# alpine already ships a "node" user (uid 1000), just reuse it instead
# of making a new one
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# drop root before the app ever starts
USER node

EXPOSE 5000

CMD ["node", "server.js"]

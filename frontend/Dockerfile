# Frontend Dockerfile
# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- final stage, just static files behind nginx ----
FROM nginxinc/nginx-unprivileged:1.27-alpine
WORKDIR /usr/share/nginx/html

# nginxinc's "unprivileged" image already runs as a non-root "nginx"
# user and listens on 8080 instead of 80, which is exactly what we want
# for k8s (no root, no privileged low ports)
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

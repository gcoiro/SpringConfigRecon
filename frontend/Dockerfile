# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend .
RUN npm run build -- --configuration=production

# Runtime stage
FROM nginx:1.27-alpine

# Replace default server block
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Static assets
COPY --from=build /app/dist/spring-config-recon-ui/ /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
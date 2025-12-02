FROM nginx:1.27-alpine

WORKDIR /usr/share/nginx/html

# Configuración de nginx para servir el sitio estático y proxy /api al backend.
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Sitio estático sin necesidad de build de Node/Angular.
COPY frontend/static/ /usr/share/nginx/html/

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

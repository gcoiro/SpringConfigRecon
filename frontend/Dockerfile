FROM nginx:1.29.3-trixie-perl

WORKDIR /usr/share/nginx/html

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend/static/ /usr/share/nginx/html/

# OpenShift runs the container with a random UID; make nginx paths group-writable.
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx \
    && chgrp -R 0 /var/cache/nginx /var/run /var/log/nginx /etc/nginx /usr/share/nginx/html \
    && chmod -R g+rwX /var/cache/nginx /var/run /var/log/nginx /etc/nginx /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

FROM joshix/caddy

COPY build /var/www/html
COPY etc/Caddyfile /etc/caddy/Caddyfile

CMD ["-conf", "/etc/caddy/Caddyfile"]

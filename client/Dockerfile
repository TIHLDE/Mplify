FROM node:11-alpine AS builder
# ENV NPM_CONFIG_LOGLEVEL info
COPY . .
RUN npm install && npm run build

FROM caddy:alpine
COPY etc/Caddyfile /etc/caddy/Caddyfile
# COPY --from BUILDER build /var/www/html
COPY --from=builder build /srv

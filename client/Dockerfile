FROM node:16-alpine AS builder

ENV NPM_CONFIG_LOGLEVEL info

COPY ./package.json ./package.json
COPY ./public ./public
COPY ./src ./src

RUN npm install && npm run build

FROM caddy:alpine
COPY etc/Caddyfile /etc/caddy/Caddyfile
# COPY --from BUILDER build /var/www/html
COPY --from=builder build /srv

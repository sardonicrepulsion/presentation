FROM caddy:2-alpine

WORKDIR /srv

COPY Caddyfile /etc/caddy/Caddyfile
COPY index.html 404.html version.json manifest.webmanifest robots.txt sitemap.xml /srv/
COPY css/ /srv/css/
COPY js/ /srv/js/
COPY data/ /srv/data/
COPY assets/ /srv/assets/

EXPOSE 80

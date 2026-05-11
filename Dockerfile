FROM caddy:2-alpine

WORKDIR /srv

COPY Caddyfile /etc/caddy/Caddyfile
COPY index.html 404.html version.json manifest.webmanifest robots.txt sitemap.xml /srv/
COPY css/ /srv/css/
COPY js/ /srv/js/
COPY data/ /srv/data/
COPY assets/ /srv/assets/

# Self-contained snapshot of the current deck under /old/ so the root slot can be
# replaced by the next presentation without breaking the historical copy.
RUN mkdir -p /srv/old && \
    cp /srv/index.html /srv/manifest.webmanifest /srv/old/ && \
    cp -r /srv/css /srv/js /srv/data /srv/assets /srv/old/ && \
    sed -i \
        -e 's|"/assets/|"/old/assets/|g' \
        -e 's|"/css/|"/old/css/|g' \
        -e 's|"/js/|"/old/js/|g' \
        -e 's|"/data/|"/old/data/|g' \
        -e 's|"/manifest.webmanifest|"/old/manifest.webmanifest|g' \
        /srv/old/index.html /srv/old/data/slides.json && \
    sed -i "s|'/data/slides.json'|'/old/data/slides.json'|g" /srv/old/js/app.js && \
    sed -i 's|<meta charset="utf-8">|<meta charset="utf-8">\n  <meta name="robots" content="noindex,nofollow">|' /srv/old/index.html

EXPOSE 80

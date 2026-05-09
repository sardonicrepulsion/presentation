# Presentation

Slide deck viewer — image-left + bullets-right layout, keyboard + touch nav, fullscreen, progress bar.

## Stack

- **Runtime:** Static Caddy 2 alpine
- **Memory:** 64MB
- **No framework, no build step** — vanilla HTML/CSS/JS

## Endpoints

| Path | Description |
|------|-------------|
| `/` | Slide deck |
| `/health`, `/healthz` | Health JSON |
| `/version` | Version JSON |
| `/data/slides.json` | Deck content (editable) |

## Editing slides

Edit `data/slides.json`:

```json
{
  "title": "Deck title",
  "slides": [
    {
      "title": "Slide heading",
      "image": "/assets/img/slide-01.svg",
      "bullets": ["Point 1", "Point 2"]
    }
  ]
}
```

Each slide needs `title` (string), `image` (path), `bullets` (string array). Add as many slides as you need.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `←` / `PageUp` | Previous slide |
| `→` / `PageDown` / `Space` | Next slide |
| `Home` | First slide |
| `End` | Last slide |
| `F` | Toggle fullscreen |
| `Esc` | Exit fullscreen |

Touch: swipe left/right on mobile.

## Security headers

Strict CSP from start: `default-src 'self'`, `script-src 'self'`, `style-src 'self'`, `img-src 'self' data:`, Trusted Types policy `presentation-template`.

HSTS preload + COOP/CORP via host Caddy proxy (`dokku caddy:labels:add`).

## Local preview

```bash
docker build -t presentation .
docker run --rm -p 8080:80 presentation
# or python -m http.server (CSP/headers won't be set)
```

## Deploy

Push to `main` → GitHub webhook → deployer → Dokku rebuild → live at https://presentation.sardonicrepulsion.com

## Versioning

`VERSION` + `version.json` + Caddyfile `/version` handler must stay in sync — CI version-consistency gate enforces this.

# SithKit Frontend Design

## Architecture
- FastAPI serves both the API and static frontend from a single process
- Single-page HTML/CSS/JS — no framework, vanilla JS with fetch polling
- `python run.py` starts the server and opens the browser

## Layout
- Top bar: SithKit title (magenta), version, status indicator
- Left panel: Device cards (Faultier status, port info). Future tool cards go here.
- Right panel: Terminal/log panel with timestamped scan results, blinking cursor
- Full-page CRT overlay: scanlines + vignette

## Visual Style
- Background: near-black (#0a0a0f) with subtle grid lines
- Colors: neon green (#00ff41) status/text, cyan (#00d4ff) borders/accents, magenta (#ff00ff) highlights/title
- Effects: CSS scanlines overlay, CRT vignette corners, text-shadow glow, blinking cursor
- Font: monospace (Fira Code / Courier New fallback)

## File Structure
- `sithkit/app.py` — FastAPI server + API endpoints
- `sithkit/static/css/style.css` — synthwave styling + effects
- `sithkit/static/js/app.js` — polling logic + DOM updates
- `sithkit/templates/index.html` — single page layout

## API Endpoints
- `GET /` — serves the HTML page
- `GET /api/status` — returns device detection result (polled every 3s)

## Behavior
- Page loads, starts polling `/api/status` every 3 seconds
- Device card shows connected (green glow) or disconnected (dim/red)
- Terminal panel logs each scan result with timestamps
- Status indicator in top bar pulses when connected

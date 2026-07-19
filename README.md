# RoValra Firefox Port

**Auto-synced Firefox port of [RoValra](https://github.com/NotValra/RoValra)**

This repository automatically tracks upstream RoValra releases and produces a Firefox-compatible build. Every 6 hours it checks for new upstream releases, patches for Firefox compatibility, and creates a GitHub release.

## Features

- **100% upstream code** — no manual fork lag, no missing features
- **CSP bypass** — uses `declarativeNetRequest` + `webRequest` fallback to strip Content-Security-Policy headers from Roblox, fixing GIFs, images, and external resource loading
- **Firefox compat layer** — shims Chrome APIs that Firefox doesn't support

## How Auto-Update Works

```
Upstream Release → GitHub Action (every 6h) → Patch for Firefox → Build → GitHub Release → You Download
```

The workflow in `.github/workflows/sync-upstream.yml`:
1. Checks upstream `NotValra/RoValra` for new releases every 6 hours
2. Clones upstream source
3. Applies Firefox patches (manifest, CSP bypass, compat)
4. Builds the extension
5. Creates a GitHub release with the `.zip`

## Installation

### From GitHub Releases
1. Go to [Releases](https://github.com/YOUR_USER/rovalra-firefox/releases)
2. Download the latest `.zip`
3. Open `about:debugging#/runtime/this-firefox` in Firefox/Zen
4. Click "Load Temporary Add-on" → select the `.zip`

### Build Locally
```bash
git clone https://github.com/NotValra/RoValra.git upstream
npm install
node build.js
# Output in dist/
```

## CSP Bypass

This port strips CSP headers from Roblox pages using two layers:
1. **declarativeNetRequest** — static rules in `rules/csp-bypass.json`
2. **webRequest** — fallback in `src/background/background.js`

This allows features like GIF status images, external content loading, and font injection to work in Firefox.

## License

GPL-3.0 (same as upstream RoValra)

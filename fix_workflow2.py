import os

path = r'C:\Users\denni\AppData\Local\Temp\opencode\rovalra-firefox\.github\workflows\sync-upstream.yml'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Switch order - build Firefox content BEFORE copying upstream dist
old_order = """      - name: Setup dist
        run: |
          mkdir -p dist
          cp -r upstream/dist/* dist/ 2>/dev/null || true
          cp -r rules dist/ 2>/dev/null || true

      - name: Build Firefox content script
        run: |
          cd upstream && npx esbuild src/content/index.js --bundle --outfile=../dist/content.js --keep-names --minify-syntax 2>/dev/null || true"""

new_order = """      - name: Build Firefox content script
        run: |
          cd upstream && npx esbuild src/content/index.js --bundle --outfile=../dist/content.js --keep-names --minify-syntax 2>&1

      - name: Setup dist
        run: |
          mkdir -p dist
          cp -r upstream/dist/* dist/ 2>/dev/null || true
          cp -r rules dist/ 2>/dev/null || true"""

content = content.replace(old_order, new_order)

# Fix 2: Add bare domain match for roblox.com
old_cs = """              {matches:['*://*.roblox.com/*'],js:['src/content/core/firefox/compat.js','content.js'],css:['css/sitewide.css','css/rovalra.css'],run_at:'document_start'}"""
new_cs = """              {matches:['*://*.roblox.com/*','*://roblox.com/*'],js:['src/content/core/firefox/compat.js','content.js'],css:['css/sitewide.css','css/rovalra.css'],run_at:'document_start'}"""
content = content.replace(old_cs, new_cs)

with open(path, 'w', newline='\n') as f:
    f.write(content)

print('Workflow updated')

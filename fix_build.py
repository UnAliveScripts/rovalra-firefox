import os

path = r'C:\Users\denni\AppData\Local\Temp\opencode\rovalra-firefox\.github\workflows\sync-upstream.yml'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add intercept.js patching step after Setup dist
old = """      - name: Setup dist
        run: |
          mkdir -p dist
          cp -r upstream/dist/* dist/ 2>/dev/null || true
          cp -r rules dist/ 2>/dev/null || true"""

new = """      - name: Setup dist
        run: |
          mkdir -p dist
          cp -r upstream/dist/* dist/ 2>/dev/null || true
          cp -r rules dist/ 2>/dev/null || true

      - name: Patch intercept.js for Firefox
        run: |
          node -e "
            const fs = require('fs');
            let code = fs.readFileSync('dist/intercept.js', 'utf8');
            code = code.replace(/originalFetch\(\.\.\.args\)/g, 'originalFetch.apply(window,args)');
            code = code.replace(/originalFetch\(\.\.\.arguments\)/g, 'originalFetch.apply(window,arguments)');
            fs.writeFileSync('dist/intercept.js', code);
            console.log('Patched intercept.js for Firefox fetch compatibility');
          "
          """

content = content.replace(old, new)

with open(path, 'w', newline='\n') as f:
    f.write(content)

print('Build workflow updated')

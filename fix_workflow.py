import os

path = r'C:\Users\denni\AppData\Local\Temp\opencode\rovalra-firefox\.github\workflows\sync-upstream.yml'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old = """            ff.content_scripts = [
              {matches:['*://*.roblox.com/*'],js:['intercept.js'],run_at:'document_start'},
              {matches:['*://*.roblox.com/*'],js:['src/content/core/firefox/compat.js','content.js'],css:['css/sitewide.css','css/rovalra.css'],run_at:'document_start'}
            ];"""

new = """            ff.content_scripts = [
              {matches:['*://*.roblox.com/*'],js:['src/content/core/firefox/compat.js','content.js'],css:['css/sitewide.css','css/rovalra.css'],run_at:'document_start'}
            ];"""

content = content.replace(old, new)

with open(path, 'w', newline='\n') as f:
    f.write(content)

print('Workflow updated')

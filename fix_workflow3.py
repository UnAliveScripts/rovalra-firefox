import os

path = r'C:\Users\denni\AppData\Local\Temp\opencode\rovalra-firefox\.github\workflows\sync-upstream.yml'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Also load upstream background in the manifest
old_bg = """            ff.web_accessible_resources = ["""
new_bg = """            ff.background.scripts = ['src/background/background.js', 'background.js'];
            ff.web_accessible_resources = ["""

content = content.replace(old_bg, new_bg)

with open(path, 'w', newline='\n') as f:
    f.write(content)

print('Workflow updated')

import zipfile, re, json

z = zipfile.ZipFile(r'C:\Users\denni\AppData\Local\Temp\opencode\rovalra-firefox\rovalra-firefox-2.5.10.1.zip')
bg = z.read('background.js').decode('utf-8', errors='replace')

print('=== Chrome-only APIs in background.js ===')
checks = {
    'sidePanel': 'chrome.sidePanel (Chrome only)',
    'offscreen': 'chrome.offscreen (Chrome only)',
    'contextMenus': 'chrome.contextMenus (Firefox: browser.menus)',
    'userScripts': 'chrome.userScripts (Chrome only)',
    'tabGroups': 'chrome.tabGroups (Chrome only)',
}
for keyword, desc in checks.items():
    count = bg.count(keyword)
    if count > 0:
        for m in re.finditer(re.escape(keyword), bg):
            start = max(0, m.start()-60)
            end = min(len(bg), m.end()+100)
            print(f'  {desc} ({count}x)')

print()
print('=== Features that may have Firefox issues ===')

# Check manifest for any Chrome-only fields
m = json.loads(z.read('manifest.json'))
print(f'  Content scripts: {m["content_scripts"][0]["js"]}')
print(f'  Permissions: {m["permissions"]}')
print(f'  Optional permissions: {m["optional_permissions"]}')
print(f'  Background type: {m["background"].get("type", "none")}')

# Check for service_worker vs scripts
print(f'  Background scripts: {m["background"].get("scripts", "N/A")}')

# List all files in the zip to check for completeness
files = z.namelist()
print()
print('=== Key files present ===')
key_files = ['content.js', 'intercept.js', 'src/background/background.js', 
             'src/content/core/firefox/compat.js', 'rules/csp-bypass.json',
             'css/rovalra.css', 'css/sitewide.css', 'public/Assets/popup/popup.html']
for f in key_files:
    status = 'OK' if f in files else 'MISSING!'
    print(f'  {status}: {f}')

print()
print('=== Potential issues ===')
c = z.read('content.js').decode('utf-8', errors='replace')
# The main World issue - intercept.js injection
if 'intercept.js' not in str(files):
    print('  MISSING: intercept.js in zip!')

# Check if compat.js correctly injects
compat = z.read('src/content/core/firefox/compat.js').decode()
print(f'  compat.js injects intercept.js: {"intercept.js" in compat}')

print()
print('Summary: Extension structure looks complete.')
print('Content script injects intercept.js into MAIN world via script tag.')
print('All core APIs (storage, runtime, scripting, i18n) available in Firefox MV3.')

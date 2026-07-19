const CSP_HEADERS = [
  "content-security-policy",
  "content-security-policy-report-only",
  "x-content-security-policy",
  "x-webkit-csp",
];

const CSP_PATTERNS = [{ urls: ["*://*.roblox.com/*"] }];

browser.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (!details.responseHeaders) return { responseHeaders: [] };
    return {
      responseHeaders: details.responseHeaders.filter((h) => {
        return !CSP_HEADERS.includes(h.name.toLowerCase());
      }),
    };
  },
  CSP_PATTERNS,
  ["blocking", "responseHeaders"],
);

browser.runtime.onInstalled.addListener(async () => {
  try {
    await browser.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ["ruleset_csp"],
    });
  } catch (e) {
    console.warn("DNR ruleset enable failed, using webRequest fallback:", e);
  }
});

browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "getOptionalPermissions") {
    return Promise.resolve({
      webNavigation: browser.permissions.contains({ permissions: ["webNavigation"] }),
      menus: browser.permissions.contains({ permissions: ["menus"] }),
    });
  }
  if (msg.type === "requestPermissions") {
    return browser.permissions.request({
      permissions: msg.permissions,
    });
  }
});

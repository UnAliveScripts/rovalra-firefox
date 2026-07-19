(function () {
  "use strict";

  window.browser = window.browser || window.chrome;

  if (typeof browser === "undefined") {
    console.warn("RoValra-Firefox: No browser API found");
    return;
  }

  const isChrome = !!(
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.getManifest &&
    chrome.runtime.getManifest().manifest_version
  );

  if (isChrome && !window.browser) {
    window.browser = chrome;
  }

  if (typeof browser.declarativeNetRequest === "undefined" && chrome?.declarativeNetRequest) {
    browser.declarativeNetRequest = chrome.declarativeNetRequest;
  }

  if (typeof browser.runtime.getURL === "undefined") {
    browser.runtime.getURL = (path) => {
      return chrome.runtime.getURL(path);
    };
  }

  const useChromeStorage =
    isChrome &&
    typeof browser.storage === "undefined" &&
    typeof chrome?.storage !== "undefined";

  if (useChromeStorage) {
    browser.storage = chrome.storage;
  }

  window.chrome.runtime?.onMessage?.addListener?.((msg, sender, sendResponse) => {
    if (msg?.type?.startsWith?.("__firefox_compat_")) return;
  });

  console.log("[RoValra-Firefox] Compat layer loaded");
})();

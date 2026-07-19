(function () {
  "use strict";

  var browserApi = typeof browser !== "undefined" ? browser : chrome;

  function injectPageScript(url) {
    fetch(browserApi.runtime.getURL(url))
      .then(function (r) {
        return r.text();
      })
      .then(function (code) {
        code = code.replace(
          "originalFetch(...args)",
          "originalFetch.apply(window,args)",
        );
        var s = document.createElement("script");
        s.textContent = code;
        document.documentElement.appendChild(s);
        s.remove();
      })
      ["catch"](function (e) {
        console.warn("[RoValra-Firefox] Inject failed", e);
      });
  }

  injectPageScript("intercept.js");

  console.log("[RoValra-Firefox] Compat layer loaded");
})();

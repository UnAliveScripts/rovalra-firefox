(function () {
  "use strict";

  var browserApi = typeof browser !== "undefined" ? browser : chrome;

  function injectPageScript(url) {
    try {
      var scriptUrl = browserApi.runtime.getURL(url);
      var script = document.createElement("script");
      script.src = scriptUrl;
      script.onload = function () {
        this.remove();
      };
      document.documentElement.appendChild(script);
    } catch (e) {
      console.warn("[RoValra-Firefox] Failed to inject " + url, e);
    }
  }

  function injectFixScript() {
    var script = document.createElement("script");
    script.textContent = "(function(){var r=window.fetch;window.fetch=function(){return r.apply(window,arguments);};})();";
    document.documentElement.appendChild(script);
    script.remove();
  }

  injectPageScript("intercept.js");
  injectFixScript();

  console.log("[RoValra-Firefox] Compat layer loaded");
})();

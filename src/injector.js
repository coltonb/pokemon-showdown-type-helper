var browser = require("webextension-polyfill");

/**
 * Injects the main script into the document body so that it can access
 * Pokemon Showdown classes.
 */
function injectScript() {
  const script = document.createElement("script");
  script.src = browser.runtime.getURL("pokemonShowdownTypeHelper.js");
  document.body.appendChild(script);
}

injectScript();

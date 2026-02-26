(() => {
  // Prevent double-injection
  if (window.__VPL_CONTENT_SCRIPT_HAS_RUN__) return;
  window.__VPL_CONTENT_SCRIPT_HAS_RUN__ = true;

  try {
    // Step 1: Inject injected.js into the page context (for ACE access)
    const domScript = document.createElement("script");
    domScript.src = chrome.runtime.getURL("injected.js");

    domScript.onload = () => {
      try {
        window.postMessage({ type: "REQUEST_EDITOR_IDS" }, "*");
        domScript.remove(); // Clean up after injecting
      } catch (e) {
        // console.error("Error during injected.js onload execution:", e);
      }
    };

    (document.head || document.documentElement).appendChild(domScript);
  } catch (err) {
    // console.error("Failed to inject injected.js:", err);
  }

  // Step 2: Listen for messages from the popup and forward to injected.js
  try {
    chrome.runtime.onMessage.addListener((message) => {
      try {
        if (message.type === "INJECT_TO_ACE") {
          window.postMessage({ type: "INJECT_TO_ACE", payload: message.payload }, "*");
        }

        if (message.type === "REQUEST_EDITOR_IDS") {
          window.postMessage({ type: "REQUEST_EDITOR_IDS" }, "*");
        }
      } catch (err) {
        // console.error("Failed to forward message to injected.js:", err);
      }
    });
  } catch (err) {
    // console.error("chrome.runtime.onMessage listener setup failed:", err);
  }

  // Step 3: Receive editor IDs from injected.js and store via background/popup
  try {
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;

      if (event.data.type === "EDITOR_IDS_FOUND") {
      chrome.runtime.sendMessage({
        type: "STORE_EDITOR_IDS",
        payload: event.data.payload
      }, () => {
        if (chrome.runtime.lastError) {
          // console.warn("Failed to send editor IDs:", chrome.runtime.lastError.message);
        }
      });
    }

    });
  } catch (err) {
    // console.error("Failed to set up message listener from injected.js:", err);
  }
})();

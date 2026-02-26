chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "STORE_EDITOR_IDS") {
    const tabId = sender?.tab?.id;
    if (!tabId) return;

    chrome.storage.local.set({
      [`editorIds_${tabId}`]: message.payload
    });
  }
});
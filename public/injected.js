function detectAndStoreEditors() {
  try {
    const editors = Array.from(document.querySelectorAll(".ace_editor")).filter(e => e.id);
    const aceReady = typeof window.ace !== "undefined";

    if (!aceReady || editors.length === 0) {
      setTimeout(detectAndStoreEditors, 500);
      return;
    }

    const editorIds = editors.map(e => e.id);
    window.postMessage({
      type: "EDITOR_IDS_FOUND",
      payload: editorIds
    }, "*");
  } catch (err) {
    // console.error("Error in detectAndStoreEditors:", err);
  }
}

function injectCode(fileId, code,replaceAll = true) {
  try {
    const editor = ace.edit(fileId);
    if (!editor) {
      alert(`Editor not found for ID: ${fileId}`);
      return;
    }
    // const st = editor.getValue();
    // editor.setValue(st+"\n"+code, -1); // -1 = move cursor to top
    if (replaceAll) {
      editor.setValue(code, -1); // replace + move cursor to top
    } else {
      const session = editor.getSession();
      const existingCode = session.getValue();
      editor.setValue(existingCode + '\n' + code, -1);
    }
  } catch (e) {
    // console.error("ACE injection failed:", e);
  }
}

window.addEventListener("message", (event) => {
  try {
    if (event.source !== window) return;

    if (event.data.type === "REQUEST_EDITOR_IDS") {
      detectAndStoreEditors();
    }

    if (event.data.type === "INJECT_TO_ACE") {
      const { code, fileId, replaceAll } = event.data.payload || {};

      if (!fileId || typeof code !== "string") {
        // console.warn("⚠️ Invalid INJECT_TO_ACE payload:", event.data.payload);
        return;
      }

      let retryCount = 0;
      const MAX_RETRIES = 10;

      const tryInject = () => {
        const aceReady = typeof window.ace !== "undefined";
        const editorElement = document.getElementById(fileId);

        if (aceReady && editorElement) {
          injectCode(fileId, code, replaceAll);
        } else if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(tryInject, 300);
        } else {
          // console.error(`Failed to inject code after ${MAX_RETRIES} attempts`);
        }
      };

      tryInject();
    }
  } catch (err) {
    // console.error("Error in message event handler:", err);
  }
});



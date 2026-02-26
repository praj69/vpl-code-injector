import React, { useEffect, useState } from "react";

const Popup = () => {
  const [editorIds, setEditorIds] = useState([]);
  const [selectedEditor, setSelectedEditor] = useState("");
  const [code, setCode] = useState("");
  const [isSiteEnabled, setIsSiteEnabled] = useState(false);
  const [currentHost, setCurrentHost] = useState("");
  const [replaceAll, setReplaceAll] = useState(false); // default: replace
  const [isLoading, setIsLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);


  // Get current tab hostname and check if enabled
  useEffect(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const tabId = tab.id;
    const url = new URL(tab.url);
    const host = url.hostname;
    setCurrentHost(host);

    chrome.storage.sync.get("enabledSites", (data) => {
      const enabledSites = data.enabledSites || [];
      const isEnabled = enabledSites.includes(host);
      setIsSiteEnabled(isEnabled);

      if (isEnabled) {
        // ✅ Inject content.js
        injectScript(tabId);

        // ✅ Trigger detection
        // chrome.tabs.sendMessage(tabId, { type: "REQUEST_EDITOR_IDS" });

        // ✅ Load editor IDs after slight delay (give time to detect/store)
        setTimeout(() => {
          loadEditorIds();
        }, 300);
      }
      setIsLoading(false);
    });
  });
}, []);


const loadEditorIds = () => {
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      chrome.storage.local.get(`editorIds_${tabId}`, (result) => {
        const ids = result[`editorIds_${tabId}`] || [];
        setEditorIds(ids);
        if (ids.length === 1) {
          setSelectedEditor(ids[0]);
        } else if (ids.length >= 2) {
          setSelectedEditor(ids[1]); // second editor
        } else {
          setSelectedEditor(""); // fallback: nothing to select
        }
      });
    });
  } catch (err) {
    // console.error("Load editor IDs error:", err);
  }
};


useEffect(() => {
  loadEditorIds();
}, []);
useEffect(() => {
  const timer = setTimeout(() => {
    setShowHelp(!isSiteEnabled);
  }, 300);

  return () => clearTimeout(timer); // cleanup
}, [isSiteEnabled]);


useEffect(() => {
  const handleStorageChange = (changes) => {
    try {
      if (changes.editorIds?.newValue) {
        const ids = changes.editorIds.newValue;
        setEditorIds(ids);
        setSelectedEditor(ids[0] || "");
      }
    } catch (err) {
      // console.error("Storage change handler error:", err);
    }
  };

  chrome.storage.onChanged.addListener(handleStorageChange);
  return () => chrome.storage.onChanged.removeListener(handleStorageChange);
}, []);


const handleInject = () => {
  if (!selectedEditor || !code.trim()) {
    alert("Please select an editor and enter code.");
    return;
  }

  try {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) {
        alert("❌ No active tab found.");
        return;
      }

      chrome.tabs.sendMessage(
        tab.id,
        {
          type: "INJECT_TO_ACE",
          payload: { fileId: selectedEditor, code, replaceAll },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            // console.warn("⚠️ Injection failed:", chrome.runtime.lastError.message);
          }
        }
      );
    });
  } catch (err) {
    // console.error("Injection error:", err);
  }
};



const toggleSiteAccess = () => {
  try {
    chrome.storage.sync.get("enabledSites", (data) => {
      let enabledSites = data.enabledSites || [];
      const index = enabledSites.indexOf(currentHost);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;

        if (index === -1) {
          enabledSites.push(currentHost);
          chrome.storage.sync.set({ enabledSites }, () => {
            setIsSiteEnabled(true);
            injectScript(tabId);
            chrome.tabs.sendMessage(tabId, { type: "REQUEST_EDITOR_IDS" }, () => {
            if (chrome.runtime.lastError) {
              // console.warn("Message failed (no content.js yet?):", chrome.runtime.lastError.message);
              }
            });
            });
          setTimeout(() => {
            loadEditorIds();
          }, 300);
        } else {
          enabledSites.splice(index, 1);
          chrome.storage.sync.set({ enabledSites }, () => {
            setIsSiteEnabled(false);
          });
          chrome.storage.local.remove(`editorIds_${tabId}`, () => {
            setEditorIds([]);
            setSelectedEditor("");
          });
        }
      });
    });
  } catch (err) {
    // console.error("Toggle site access error:", err);
  }
};


const injectScript = (tabId) => {
  try {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    }, () => {
      if (chrome.runtime.lastError) {
        // console.error("Injection error:", chrome.runtime.lastError.message);
      }
    });
  } catch (err) {
    // console.error("Unexpected injection error:", err);
  }
};
const pasteCppTemplate = () => {
  setCode(`#include <bits/stdc++.h>
using namespace std;

int main() {
    
    return 0;
}`);
};

const pasteJavaTemplate = () => {
  setCode(`import java.util.*;

public class test {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

    }
}`);
};

const toggleHelp = () => {
  setShowHelp(false);
};
if (isLoading) {
  return (
    <div
      style={{
        padding: "1rem",
        width: "360px",
        fontFamily: "'Courier New', monospace",
        backgroundColor: "#000",
        color: "#38fffe",
        borderRadius: "6px",
        textAlign: "center",
      }}
    >
      Loading...
    </div>
  );
}

return (
  <>
    {showHelp && (
      <div className="overlay" >
        <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <h4> Instructions </h4>
          <ul>
            <li>Click "Enable Site!".</li>
            <li>Make sure every editor is saved then RELOAD the URL.</li>
            <li>Choose editor from dropdown. Ex. vpl_file1,etc..</li>
            <li>Paste or insert java/cpp template code.</li>
            <li>"Inject Code"!!</li>
          </ul>
          <div style={{display: "flex",justifyContent: "center",width: "100%",marginTop: "1rem",}}>
            <button className="close-button" onClick={toggleHelp}>
            CLOSE
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="popup-container">
      <img src="warp.png" alt="Logo" className="popup-logo"/>
      {/* <div style={{ textAlign: "right", marginBottom: "0.5rem" }}>
        <button className="help-btn" onClick={toggleHelp}>Help?</button>
      </div> */}
      {/* Enable + Dropdown */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          gap: "0.5rem",
        }}
      >
        <select
          value={selectedEditor}
          onChange={(e) => setSelectedEditor(e.target.value)}
          className="custom-select"
        >
          {editorIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>

        <button onClick={toggleSiteAccess} 
          className={`site-toggle-btn ${isSiteEnabled ? "site-enabled" : "site-disabled"}`}>
            {isSiteEnabled ? "Disable ?" : " Enable Site !"}
        </button>

      </div>

      <textarea
        rows="8"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter text/code here..."
        className="code-textarea"
      />

      {/* Template Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <button className="template-btn cpp-btn" onClick={pasteCppTemplate}>
          C++
        </button>

        <button className="template-btn java-btn" onClick={pasteJavaTemplate}>
          Java
        </button>
      </div>

      {/* Inject Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "1rem",
        }}
      >
        <button className="inject-btn" onClick={handleInject}>
          ⚡ Inject Code
        </button>
        <div className="toggle-container">
          <label htmlFor="replaceAllToggle" className="toggle-label">
            <input
              type="checkbox"
              id="replaceAllToggle"
              checked={replaceAll}
              onChange={(e) => setReplaceAll(e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-slider" />
          </label>
          <span className="toggle-label-text">Replace All</span>
        </div>
      </div>

      {/* Footer */}
      <p className="footer">
        - developed by{" "}
        <a
          href="https://www.linkedin.com/in/prajyoth-m-abb97a266"
          target="_blank"
          rel="noopener noreferrer"  
        >
          Prajyoth M
        </a>
      </p>
    </div>
  </>
);


};

export default Popup;





# VPL Code Injector Chrome Extension

A Chrome extension that injects code templates directly into the **VPL ACE Editor**, allowing fast insertion of C++ / Java boilerplate and multi-file code handling.

## Features

- Inject code into ACE editor instances
- Supports multiple VPL files (vpl_file_0, vpl_file_1, etc.)
- One-click C++ and Java templates
- Clean popup UI
- Works directly inside VPL pages

## Working

- Uses a **content script** to access the ACE editor on the page
- Popup UI sends commands to inject selected templates
- No external servers or APIs required

## Installation (Developer Mode)

1. Clone the repository:
   ```bash
   git clone https://github.com/praj69/vpl-code-injector.git
   and 
   build the dist file using - npm run build

2. Open Chrome and go to:chrome://extensions

3. Enable Developer Mode (top right)

4. Click Load unpacked

5. Select the dist folder

## Tech Stack

- React + vite
- JavaScript
- Chrome Extensions API (Manifest V3)
- ACE Editor API
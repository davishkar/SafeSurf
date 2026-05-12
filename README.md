# 🛡️ SafeSurf AI

**SafeSurf AI** is a lightweight, extremely fast, and privacy-first browser extension designed to help users browse the internet safely by detecting and blocking adult or unsafe content in real-time.

Built entirely as a local browser tool, SafeSurf AI requires **no cloud processing**, **no user tracking**, and **no external servers**. All protection happens instantly right inside your browser.

---

## ✨ Key Features (V1)

1. **⛔ Website Blocking Engine**
   - Automatically checks the current URL against a robust list of blocked domains.
   - Powered by the blazing-fast Manifest V3 `Declarative Net Request API`.
   - Instantly prevents access and redirects you to a beautiful, full-screen Warning Page.

2. **👁️ Real-Time Keyword Detection**
   - Injects a fast content script that scans webpage text as soon as it loads (`document_end`).
   - Uses a dynamic Mutation Observer to scan for unsafe keywords (e.g., *adult*, *explicit*) even on heavily dynamic or infinite-scrolling pages (like Reddit or Twitter).

3. **🖼️ Strict Mode Image Blurring**
   - When unsafe content is detected, Strict Mode activates instantly.
   - Automatically injects CSS filters to apply a heavy blur and grayscale effect to all images, videos, and iframes to prevent accidental visual exposure.

4. **🎨 Premium UI / UX**
   - Beautiful, modern Glassmorphism-style popup interface.
   - Smooth CSS animations, custom SVG icons, and a highly polished status indicator.
   - Built entirely with Vanilla CSS/HTML for zero external dependencies and maximum performance.

---

## 🚀 How to Install and Run Locally

Since this extension is in development and not yet on the Chrome Web Store, you can install it manually:

1. Open Google Chrome or any Chromium-based browser (Edge, Brave, Arc).
2. Type `chrome://extensions/` into the URL bar and hit enter.
3. In the top right corner, toggle **Developer mode** to **ON**.
4. Click the **Load unpacked** button in the top left.
5. Select the folder containing these project files (e.g., `SafeSurf AI`).
6. The extension is now installed! 
7. *(Optional)* Click the puzzle piece icon next to your profile picture in Chrome and "Pin" SafeSurf AI to your toolbar for easy access.

---

## 🛠️ Technical Architecture

SafeSurf AI utilizes the latest Chrome Extension capabilities:
- **Manifest V3:** Ensuring the extension meets the latest security and performance standards set by Google.
- **Service Workers (`background.js`):** Efficient background processing that handles Declarative Net Request rules.
- **Declarative Net Request:** Native, browser-level network blocking that doesn't slow down page loads.
- **Chrome Storage API:** Local state management to save toggle preferences across browser sessions.

---

## 🔒 Privacy & Security

SafeSurf AI V1 is designed from the ground up to respect user privacy:
- **Zero Cloud Uploads:** Your browsing history is never sent to a server.
- **Zero Tracking:** There is no telemetry, analytics, or data collection.
- **100% Local:** Every single block, scan, and blur happens entirely on your local machine.

---

*Powered by SafeSurf AI - Making the internet a safer place for everyone.*

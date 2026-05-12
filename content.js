const UNSAFE_KEYWORDS = ['adult', 'xxx', 'porn', 'explicit', 'nsfw', 'sex'];
let isEnabled = true;
let strictMode = true;
let scanInterval;

chrome.storage.local.get(['isEnabled', 'strictMode'], (result) => {
    isEnabled = result.isEnabled ?? true;
    strictMode = result.strictMode ?? true;
    
    if (isEnabled) {
        runScanner();
    }
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.isEnabled) {
        isEnabled = changes.isEnabled.newValue;
        if (!isEnabled) {
            removeProtection();
        } else {
            runScanner();
        }
    }
    if (changes.strictMode) {
        strictMode = changes.strictMode.newValue;
        if (isEnabled) runScanner();
    }
});

function runScanner() {
    if (!document.body) return; // In case script runs before body is ready
    
    // Scan immediately
    scanAndProtect();
    
    // Also observe DOM changes for single-page apps
    const observer = new MutationObserver(() => {
        // Debounce scan
        clearTimeout(scanInterval);
        scanInterval = setTimeout(() => scanAndProtect(), 150);
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

function scanAndProtect() {
    if (!isEnabled || !document.body) return;

    // Fast text scanning
    const bodyText = document.body.innerText.toLowerCase();
    let matchCount = 0;
    
    for (const keyword of UNSAFE_KEYWORDS) {
        // Use word boundary to prevent matching substrings
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = bodyText.match(regex);
        if (matches) {
            matchCount += matches.length;
        }
    }

    if (matchCount >= 2) { // Threshold for unsafe content
        console.log("SafeSurf AI: Unsafe content detected!");
        if (strictMode) {
            blurImages();
        }
        showWarningBanner();
    }
}

function blurImages() {
    if (document.getElementById('safesurf-blur-style')) return;
    
    const style = document.createElement('style');
    style.id = 'safesurf-blur-style';
    style.innerHTML = `
        img, video, iframe, canvas {
            filter: blur(25px) grayscale(100%) !important;
            transition: filter 0.3s ease-in-out !important;
        }
        img:hover, video:hover {
            filter: blur(5px) grayscale(50%) !important;
        }
    `;
    document.head.appendChild(style);
}

function removeProtection() {
    const style = document.getElementById('safesurf-blur-style');
    if (style) style.remove();
    const banner = document.getElementById('safesurf-warning-banner');
    if (banner) banner.remove();
}

function showWarningBanner() {
    if (document.getElementById('safesurf-warning-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'safesurf-warning-banner';
    banner.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 16px 20px;
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 14px;
        font-weight: 600;
        z-index: 2147483647; /* Max z-index */
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    
    banner.innerHTML = `
        <style>
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        <div>
            <div style="font-weight: 700; margin-bottom: 2px;">SafeSurf AI Alert</div>
            <div style="font-size: 12px; opacity: 0.9;">Unsafe keywords detected on this page.</div>
        </div>
        <button id="safesurf-dismiss" style="
            margin-left: 10px;
            background: rgba(0,0,0,0.2);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.2s;
        " onmouseover="this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.background='rgba(0,0,0,0.2)'">Dismiss</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('safesurf-dismiss').addEventListener('click', () => {
        banner.style.transform = 'translateX(120%)';
        banner.style.opacity = '0';
        banner.style.transition = 'all 0.3s ease';
        setTimeout(() => banner.remove(), 300);
    });
}

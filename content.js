const UNSAFE_KEYWORDS = ['adult', 'xxx', 'porn', 'explicit', 'nsfw', 'sex'];
let isEnabled = true;
let strictMode = true;
let scanInterval;
let bodyObserver = null;

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
    
    if (bodyObserver) {
        bodyObserver.disconnect();
    }
    
    // Also observe DOM changes for single-page apps
    bodyObserver = new MutationObserver(() => {
        // Debounce scan
        clearTimeout(scanInterval);
        scanInterval = setTimeout(() => scanAndProtect(), 150);
    });
    
    bodyObserver.observe(document.body, { childList: true, subtree: true });
}

function scanAndProtect() {
    if (!isEnabled || !document.body) return;

    // Fast text scanning
    const bodyText = document.body.textContent.toLowerCase();
    let matchCount = 0;
    
    for (const keyword of UNSAFE_KEYWORDS) {
        // Use word boundary to prevent matching substrings
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = bodyText.match(regex);
        if (matches) {
            matchCount += matches.length;
        }
    }

    if (strictMode && matchCount > 0) {
        blurKeywordsInDOM();
    }

    if (matchCount >= 5) { // Threshold for unsafe content
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
    const keywordStyle = document.getElementById('safesurf-keyword-style');
    if (keywordStyle) keywordStyle.remove();
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

function blurKeywordsInDOM() {
    if (!document.getElementById('safesurf-keyword-style')) {
        const style = document.createElement('style');
        style.id = 'safesurf-keyword-style';
        style.innerHTML = `
            .safesurf-blurred-word {
                filter: blur(5px) !important;
                background-color: rgba(0,0,0,0.8) !important;
                color: transparent !important;
                border-radius: 4px !important;
                display: inline-block !important;
                user-select: none !important;
                transition: all 0.3s ease !important;
                padding: 0 2px !important;
                margin: 0 1px !important;
            }
            .safesurf-blurred-word:hover {
                filter: blur(0px) !important;
                background-color: transparent !important;
                color: inherit !important;
            }
        `;
        document.head.appendChild(style);
    }

    const regex = new RegExp(`\\b(${UNSAFE_KEYWORDS.join('|')})\\b`, 'gi');

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                const parent = node.parentNode;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const parentName = parent.nodeName.toLowerCase();
                if (parentName === 'script' || parentName === 'style' || parentName === 'noscript' || parent.classList.contains('safesurf-blurred-word')) {
                    return NodeFilter.FILTER_REJECT;
                }
                regex.lastIndex = 0;
                if (regex.test(node.nodeValue)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            }
        }
    );

    const nodesToReplace = [];
    let node;
    while (node = walker.nextNode()) {
        nodesToReplace.push(node);
    }

    if (nodesToReplace.length === 0) return;

    nodesToReplace.forEach(textNode => {
        const text = textNode.nodeValue;
        const parent = textNode.parentNode;
        let lastIndex = 0;
        const fragment = document.createDocumentFragment();
        let match;
        let hasMatches = false;
        
        regex.lastIndex = 0;
        while ((match = regex.exec(text)) !== null) {
            hasMatches = true;
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }
            const span = document.createElement('span');
            span.className = 'safesurf-blurred-word';
            span.textContent = match[0];
            fragment.appendChild(span);
            lastIndex = regex.lastIndex;
        }
        
        if (hasMatches) {
            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
            }
            parent.replaceChild(fragment, textNode);
        }
    });
}

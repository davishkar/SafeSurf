document.addEventListener('DOMContentLoaded', () => {
    const mainToggle = document.getElementById('main-toggle');
    const strictToggle = document.getElementById('strict-toggle');
    const statusCard = document.getElementById('status-card');
    const statusTitle = document.getElementById('status-title');
    const statusDesc = document.getElementById('status-desc');

    // Load initial state
    chrome.storage.local.get(['isEnabled', 'strictMode'], (result) => {
        mainToggle.checked = result.isEnabled ?? true;
        strictToggle.checked = result.strictMode ?? true;
        updateUI(mainToggle.checked);
    });

    // Event listeners
    mainToggle.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        chrome.storage.local.set({ isEnabled }, reloadActiveTabs);
        updateUI(isEnabled);
    });

    strictToggle.addEventListener('change', (e) => {
        chrome.storage.local.set({ strictMode: e.target.checked }, reloadActiveTabs);
    });

    function reloadActiveTabs() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    }

    function updateUI(isEnabled) {
        if (isEnabled) {
            statusCard.classList.remove('inactive');
            statusCard.classList.add('active');
            statusTitle.textContent = "Protection Active";
            statusDesc.textContent = "You are safe from harmful content.";
            strictToggle.disabled = false;
            strictToggle.parentElement.style.opacity = '1';
        } else {
            statusCard.classList.remove('active');
            statusCard.classList.add('inactive');
            statusTitle.textContent = "Protection Disabled";
            statusDesc.textContent = "Browser is vulnerable.";
            strictToggle.disabled = true;
            strictToggle.parentElement.style.opacity = '0.5';
        }
    }
});

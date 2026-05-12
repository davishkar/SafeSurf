const BLOCKED_DOMAINS = [
    "pornhub.com",
    "xvideos.com",
    "xnxx.com",
    "redtube.com",
    "youporn.com",
    "xhamster.com",
    "chaturbate.com",
    "stripchat.com"
];

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['isEnabled', 'strictMode'], (result) => {
        if (result.isEnabled === undefined) {
            chrome.storage.local.set({ isEnabled: true, strictMode: true });
        } else {
            updateRules(result.isEnabled);
        }
    });
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.isEnabled) {
        updateRules(changes.isEnabled.newValue);
    }
});

async function updateRules(isEnabled) {
    try {
        const ruleIdsToRemove = BLOCKED_DOMAINS.map((_, index) => index + 1);

        if (!isEnabled) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: ruleIdsToRemove
            });
            console.log("SafeSurf AI: Protection disabled. Rules removed.");
            return;
        }

        const newRules = BLOCKED_DOMAINS.map((domain, index) => {
            return {
                id: index + 1,
                priority: 1,
                action: {
                    type: "redirect",
                    redirect: { extensionPath: "/blocked.html" }
                },
                condition: {
                    urlFilter: "||" + domain,
                    resourceTypes: ["main_frame"]
                }
            };
        });

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: ruleIdsToRemove,
            addRules: newRules
        });
        console.log("SafeSurf AI: Protection enabled. Rules updated.");
    } catch (e) {
        console.error("SafeSurf AI: Error updating rules", e);
    }
}

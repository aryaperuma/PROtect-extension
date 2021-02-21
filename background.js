chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {hostEquals: "twitter.com"},
                    }),
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()],
            },
        ]);
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "injectAlert") {
        chrome.storage.local.get(["detoxifierOn"], function (data) {
            isTurnedOn = data["detoxifierOn"];

            if (isTurnedOn) {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.insertCSS(tabs[0].id, {file: "tailwind.min.css"});

                    chrome.tabs.executeScript(tabs[0].id, {
                        // code: 'document.body.style.backgroundColor = "' + color + '";',
                        file: "injectAlert.js",
                    });
                });

                sendResponse({message: "OK"});
            }
        });
    }
});

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.storage.local.set({detoxifierOn: true}, function () {
            console.log("The detoxifier set to on on first install.");
        });
    }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(
    () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            console.log("Try injection due to history change result; ");
            chrome.tabs.sendMessage(tabs[0].id, {message: "inject-script"});
        });
    },
    {pageUrl: {hostEquals: "twitter.com"}}
);
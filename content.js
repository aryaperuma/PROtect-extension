// content.js
function injectAlertIfRootAvailable() {
    var root = document.querySelector('[aria-labelledby^="accessible-list"]')
    if (!root) {
        // The node we need does not exist yet.
        // Wait 500ms and try again
        window.setTimeout(injectAlertIfRootAvailable, 300);
        return;
    }
    console.log("Found candidate");
    chrome.runtime.sendMessage({message: "injectAlert"});
}

console.log("Trying initial injection: ");
injectAlertIfRootAvailable();

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "inject-script")
            console.log("Trying injection: ");
        injectAlertIfRootAvailable();
    }
);

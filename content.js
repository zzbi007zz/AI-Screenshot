chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureScreenshot") {
    chrome.runtime.sendMessage({action: "captureScreenshot"});
  }
});
document.getElementById("group-tabs").addEventListener("click", () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    chrome.runtime.sendMessage({ action: "group-tabs", tabs });
  });
});

document.getElementById("ungroup-tabs").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "ungroup-tabs" });
});

const groupMap = new Map(); // To track groups by domain

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "group-tabs") {
    groupTabs(message.tabs);
  } else if (message.action === "ungroup-tabs") {
    ungroupTabs();
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    const url = new URL(tab.url);
    const domain = getSecondLevelDomain(url.hostname);
    if (groupMap.has(domain)) {
      const groupId = groupMap.get(domain);
      chrome.tabs.group({ tabIds: [tab.id], groupId }, () => {
        // Optionally collapse the group again
        chrome.tabGroups.update(groupId, { collapsed: true });
      });
    }
  }
});

function getSecondLevelDomain(hostname) {
  const parts = hostname.split(".");
  const domain = parts.length > 2 ? parts.slice(-2, -1)[0] : parts[0];
  return capitalizeFirstLetter(domain);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRandomColor() {
  const colors = [
    "grey",
    "blue",
    "red",
    "yellow",
    "green",
    "pink",
    "purple",
    "cyan",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function groupTabs(tabs) {
  const groups = {};
  for (const tab of tabs) {
    const url = new URL(tab.url);
    const domain = getSecondLevelDomain(url.hostname);
    if (!groups[domain]) {
      groups[domain] = [];
    }
    groups[domain].push(tab.id);
  }

  for (const [domain, tabIds] of Object.entries(groups)) {
    const groupName = capitalizeFirstLetter(domain);
    const groupColor = getRandomColor();

    chrome.tabs.group({ tabIds }, (groupId) => {
      chrome.tabGroups.update(groupId, {
        title: groupName,
        color: groupColor,
        collapsed: true,
      });
      groupMap.set(domain, groupId); // Track the group ID by domain
    });
  }
}

function ungroupTabs() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const tabIds = tabs.map((tab) => tab.id);
    chrome.tabs.ungroup(tabIds);
    groupMap.clear(); // Clear the group map
  });
}

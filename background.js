// Description: background script for chrome extension

// start interval
async function handleStart(interval) {
	let queryOptions = { active: true, currentWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);

	await chrome.tabs.reload(tab.id);
	const intervalId = setInterval(async () => {
		console.log('Reloading tab');
		await chrome.tabs.reload(tab.id);
	}, interval);

	chrome.storage.local.get(null, function ({ tabs, intervals }) {
		chrome.storage.local.set({
			tabs: [...(tabs || []), tab],
			intervals: { ...(intervals || {}), [tab.id]: intervalId },
		});
		chrome.runtime.sendMessage({ action: 'showActiveTabs' });
	});
}

// reset state when tab is closed or stop button is clicked
function handleResetState(tabId, remove = false) {
	chrome.storage.local.get(null, function ({ tabs: localTabs, intervals }) {
		const tabIndex = localTabs.findIndex((tab) => tab.id === tabId);
		const intervalId = intervals[tabId];

		localTabs.splice(tabIndex, 1);
		clearInterval(intervalId);
		delete intervals[tabId];

		chrome.storage.local.set({ tabs: localTabs, intervals });
		if (!remove) {
			console.log('Tab closed');
			chrome.runtime.sendMessage({ action: 'showActiveTabs' });
		}
	});
}

// stop interval
function handleStop() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		const currentTab = tabs[0];
		handleResetState(currentTab.id);
	});
}

// get state from storage
function getState() {
	chrome.storage.local.get(null, function (result) {
		console.log(result);
	});
}

// listen messages from content script
chrome.runtime.onMessage.addListener(function ({ action, interval }) {
	if (action === 'handleStart') {
		handleStart(interval);
	} else if (action === 'getState') {
		getState();
	} else if (action === 'handleStop') {
		handleStop();
	}
});

// reset state when tab is closed
chrome.tabs.onRemoved.addListener(function (tabId) {
	handleResetState(tabId, true);
});

// set timer badge
function updateBadge(text) {
	chrome.action.setBadgeText({ text: text });
}

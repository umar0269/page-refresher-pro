// Description: This file is responsible for the popup window that appears when the extension icon is clicked.

document.addEventListener('DOMContentLoaded', function () {
	const startBtn = document.getElementById('start');
	const timeInterval = document.getElementById('time-interval-btn');
	const activeTabs = document.getElementById('active-tabs-btn');
	const noActiveTabs = document.getElementById('no-active-tabs');

	// function to check if current tab is active
	function activeTabCheck(localTabs) {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			const currentTab = tabs[0];
			if (localTabs.find((tab) => tab.id === currentTab.id)) {
				startBtn.textContent = 'Stop';
				startBtn.classList.remove('start-btn');
				startBtn.classList.add('stop-btn');
			}
		});
	}

	// get tabs state from storage
	chrome.storage.local.get('tabs', function (result) {
		activeTabCheck(result?.tabs || []);
	});

	// start/stop button click event listener
	startBtn.addEventListener('click', () => {
		if (startBtn.textContent === 'Start') {
			const hours = document.getElementById('hours').value;
			const minutes = document.getElementById('minutes').value;
			const seconds = document.getElementById('seconds').value;
			const interval = hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
			console.log(interval);
			startBtn.textContent = 'Stop';
			startBtn.classList.remove('start-btn');
			startBtn.classList.add('stop-btn');
			noActiveTabs.style.display = 'none';

			chrome.runtime.sendMessage({ action: 'handleStart', interval });
		} else {
			chrome.runtime.sendMessage({ action: 'handleStop' });
			startBtn.textContent = 'Start';
			startBtn.classList.remove('stop-btn');
			startBtn.classList.add('start-btn');
		}
	});

	// for time interval btn click event listener
	timeInterval.addEventListener('click', (event) => {
		handleTabs(event, 'time-interval');
	});

	// for active tabs btn click event listener
	activeTabs.addEventListener('click', (event) => {
		handleTabs(event, 'active-tabs');
	});

	// function to handle tabs
	function handleTabs(event, tabId) {
		const tabContent = document.getElementsByClassName('tab-content');
		for (let i = 0; i < tabContent.length; i++) {
			tabContent[i].style.display = 'none';
		}
		const tabLinks = document.getElementsByClassName('tab-links');
		for (let i = 0; i < tabLinks.length; i++) {
			tabLinks[i].className = tabLinks[i].className.replace(' active', '');
		}

		if (tabId === 'active-tabs') {
			showActiveTabs();
		}

		document.getElementById(tabId).style.display = 'block';
		event.currentTarget.className += ' active';
	}

	// for active default tab
	timeInterval.click();

	// function to show active tabs
	function showActiveTabs() {
		chrome.storage.local.get('tabs', function (result) {
			const tabs = result?.tabs || [];
			if (tabs.length === 0) {
				noActiveTabs.style.display = 'block';
			} else {
				noActiveTabs.style.display = 'none';
			}
			const list = document.getElementById('list');
			list.innerHTML = '';
			for (i = 0; i < tabs.length; ++i) {
				const li = document.createElement('li');
				li.innerText = tabs[i].title;
				li.classList.add('list-item');
				list.appendChild(li);
			}
		});
	}

	// listen message from background.js
	chrome.runtime.onMessage.addListener(function ({ action }) {
		if (action === 'showActiveTabs') {
			showActiveTabs();
		}
	});
});

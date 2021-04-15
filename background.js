chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ hide: true }, function () {
    console.log("TimO Enhancer is on");
  });
});

chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { hostSuffix: 'timo24.de' },
    })
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);
});


chrome.tabs.onUpdated.addListener(
  function (tabId, changeInfo, tab) {
    console.log('tabId', tabId);
    console.log('changeInfo', changeInfo);
    console.log('tab', tab);
    if (changeInfo.status && changeInfo.status === "complete") {
      chrome.cookies.getAll({}, function(cookies) {
        for (var i in cookies) {
          if (cookies[i].name === 'JSESSIONID') {
            chrome.tabs.sendMessage(tabId, {
              command: 'timo_cookie',
              cookie: cookies[i]
            })
          }
        }
      });

    }
  }
);

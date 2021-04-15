

var enhanceBookingUi = document.getElementById('enhanceBookingUi');

//on init update the UI checkbox based on storage
chrome.storage.sync.get('timo_enhanceUi', function (data) {
  enhanceBookingUi.checked = data.timo_enhanceUi;
});

enhanceBookingUi.onchange = function (element) {
  let value = this.checked;

  //update the extension storage value
  chrome.storage.sync.set({ 'timo_enhanceUi': value }, function () {
    console.log('The value is ' + value);
  });

  //Pass init or remove message to content script 
  if (value) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { command: "timo_enhanceUi_changed", timo_enhanceUi: value }, function (response) {
        console.log(response.result);
      });
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { command: "timo_enhanceUi_changed", timo_enhanceUi: value }, function (response) {
        console.log(response.result);
      });
    });
  }

};


chrome.storage.local.get('redirectEnabled', (result) => {
  if (result.redirectEnabled !== false) {
    window.location.replace("https://www.pinterest.com/homefeed/");
  }
});
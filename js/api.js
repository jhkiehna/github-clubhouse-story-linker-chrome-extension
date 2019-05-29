var $CLUBHOUSE_API_TOKEN = "";

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.contentScriptQuery == "fetchStories") {
    var url = `https://api.clubhouse.io/api/v2/search/stories?token=${$CLUBHOUSE_API_TOKEN}&query=${
      request.queryString
    }`;
    fetch(url)
      .then(response => response.text())
      .then(text => parsePrice(text))
      .then(price => sendResponse(price));

    fetch(url)
      .then(res => res.json())
      .then(json => {
        console.log(JSON.stringify(json));
      })
      .then(json => sendResponse(json))
      .catch(error => console.log(error));
    return true; // Will respond asynchronously.
  }
});

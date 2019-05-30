chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.contentScriptQuery == "fetchStories") {
    chrome.storage.sync.get(["clubhouseToken"], item => {
      $CLUBHOUSE_API_TOKEN = item.clubhouseToken;

      var url = `https://api.clubhouse.io/api/v2/search/stories?token=${$CLUBHOUSE_API_TOKEN}&query=${
        request.queryString
      }`;

      fetch(url)
        .then(res => res.json())
        .then(json => {
          sendResponse(json);
        })
        .then(json => sendResponse(json))
        .catch(error => {
          console.log(error);
          sendResponse(error);
        });
    });

    return true;
  }

  if (request.contentScriptQuery == "setToken") {
    chrome.storage.sync.set({ clubhouseToken: request.token }, () => {
      console.log(request.token + " saved");

      sendResponse("Token Saved!");
    });

    return true;
  }

  if (request.contentScriptQuery == "checkToken") {
    chrome.storage.sync.get(["clubhouseToken"], item => {
      if (item.clubhouseToken) {
        sendResponse("There is a token Saved! You can replace it anytime.");
      }
      sendResponse("No token saved");
    });

    return true;
  }
});

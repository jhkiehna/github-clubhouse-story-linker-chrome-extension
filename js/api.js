chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  $CLUBHOUSE_API = "https://api.clubhouse.io/api/v2";

  if (request.contentScriptQuery == "fetchStories") {
    chrome.storage.sync.get(["clubhouseToken"], item => {
      $CLUBHOUSE_API_TOKEN = item.clubhouseToken;

      fetch(
        `${$CLUBHOUSE_API}/search/stories?token=${$CLUBHOUSE_API_TOKEN}&query=${
          request.searchTerm
        }`
      )
        .then(res => res.json())
        .then(json => {
          sendResponse(json);
        })
        .catch(error => {
          console.log(error);
          sendResponse(error);
        });
    });

    return true;
  }

  if (request.contentScriptQuery == "fetchProject") {
    chrome.storage.sync.get(["clubhouseToken"], item => {
      $CLUBHOUSE_API_TOKEN = item.clubhouseToken;

      fetch(
        `${$CLUBHOUSE_API}/projects/${
          request.projectId
        }?token=${$CLUBHOUSE_API_TOKEN}`
      )
        .then(res => res.json())
        .then(json => {
          sendResponse(json);
        })
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
        sendResponse("There is a token Saved!\nYou can replace it anytime.");
      }
      sendResponse("No token saved");
    });

    return true;
  }
});

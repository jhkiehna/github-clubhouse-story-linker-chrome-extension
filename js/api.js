chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  let CLUBHOUSE_API = "https://api.clubhouse.io/api/v2";

  if (request.contentScriptQuery == "fetchProjects") {
    chrome.storage.sync.get(["clubhouseToken", "filterProjectId"], item => {
      let CLUBHOUSE_API_TOKEN = item.clubhouseToken;

      fetch(`${CLUBHOUSE_API}/projects?token=${CLUBHOUSE_API_TOKEN}`)
        .then(res => res.json())
        .then(json => {
          let newJson = {};
          newJson.data = json;
          newJson.filterProjectId = item.filterProjectId
            ? item.filterProjectId
            : 0;

          sendResponse(newJson);
        })
        .catch(error => {
          console.error(error);
          sendResponse(error);
        });
    });

    return true;
  }

  if (request.contentScriptQuery == "searchStories") {
    chrome.storage.sync.get(["clubhouseToken", "filterProjectId"], item => {
      let CLUBHOUSE_API_TOKEN = item.clubhouseToken;
      let queryString = request.searchTerm;

      if (item.filterProjectId && item.filterProjectId != 0) {
        queryString += ` project:${item.filterProjectId}`;
      }

      fetch(
        `${CLUBHOUSE_API}/search/stories?token=${CLUBHOUSE_API_TOKEN}&query=${queryString}&page_size=25`
      )
        .then(res => res.json())
        .then(json => {
          sendResponse(json);
        })
        .catch(error => {
          console.error(error);
          sendResponse(error);
        });
    });

    return true;
  }

  if (request.contentScriptQuery == "fetchStory") {
    chrome.storage.sync.get(["clubhouseToken"], item => {
      let CLUBHOUSE_API_TOKEN = item.clubhouseToken;

      fetch(
        `${CLUBHOUSE_API}/stories/${request.storyId}?token=${CLUBHOUSE_API_TOKEN}`
      )
        .then(res => res.json())
        .then(json => {
          sendResponse(json);
        })
        .catch(error => {
          console.error(error);
        });
    });

    return true;
  }

  if (request.contentScriptQuery == "fetchProject") {
    chrome.storage.sync.get(["clubhouseToken"], item => {
      let CLUBHOUSE_API_TOKEN = item.clubhouseToken;

      fetch(
        `${CLUBHOUSE_API}/projects/${request.projectId}?token=${CLUBHOUSE_API_TOKEN}`
      )
        .then(res => res.json())
        .then(json => {
          sendResponse(json);
        })
        .catch(error => {
          console.error(error);
          sendResponse(error);
        });
    });

    return true;
  }

  if (request.contentScriptQuery == "setProjectFilter") {
    chrome.storage.sync.set({ filterProjectId: request.projectId }, () => {
      sendResponse("Filter Project Id Saved");
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

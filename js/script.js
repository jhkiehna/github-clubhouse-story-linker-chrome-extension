let buttonContainer = document.createElement("div");
buttonContainer.setAttribute("id", "clubhouse-button-container");

let searchInput = document.createElement("input");
searchInput.setAttribute("id", "search-input-box");
searchInput.setAttribute("type", "text");
searchInput.setAttribute("placeholder", "Search for clubhouse story");
buttonContainer.appendChild(searchInput);

$RESULTS_CACHE = [];
$PREVIOUS_SEARCH = null;

var pasteResult = event => {
  let targetTextArea =
    document.querySelector("#new_comment_field") ||
    document.querySelector("#pull_request_body");

  if (targetTextArea) {
    targetTextArea.value = "[" + event.target.getAttribute("id") + "]";
    document
      .querySelector("#partial-new-comment-form-actions button")
      .removeAttribute("disabled");
  } else {
    console.log("Can't find text area");
  }
};

function clearResults() {
  while (document.querySelector("#search-results-container")) {
    document
      .querySelector("#search-results-container")
      .parentNode.removeChild(
        document.querySelector("#search-results-container")
      );
  }
}

var clearSearch = () => {
  setTimeout(clearResults, 300);
};

var search = event => {
  if (event.keyCode != 13) {
    return;
  }

  clearResults();
  let searchTerm = searchInput.value;

  if ($RESULTS_CACHE.length && $PREVIOUS_SEARCH === searchInput.value) {
    let resultsContainer = document.createElement("div");
    resultsContainer.setAttribute("id", "search-results-container");

    $RESULTS_CACHE.forEach(element => {
      let divider = document.createElement("hr");
      resultsContainer.appendChild(element);
      resultsContainer.appendChild(divider);
    });

    searchInput.parentNode.appendChild(resultsContainer);
  } else if (searchTerm) {
    let resultsContainer = document.createElement("div");
    resultsContainer.setAttribute("id", "search-results-container");

    chrome.runtime.sendMessage(
      { contentScriptQuery: "fetchStories", searchTerm: searchTerm },
      response => {
        $PREVIOUS_SEARCH = searchTerm;
        $RESULTS_CACHE = [];

        response.data.forEach(story => {
          chrome.runtime.sendMessage(
            {
              contentScriptQuery: "fetchProject",
              projectId: story.project_id
            },
            response => {
              let element = document.createElement("a");
              let divider = document.createElement("hr");
              element.setAttribute("style", "cursor: pointer");
              element.setAttribute("id", `ch${story.id}`);
              element.addEventListener("click", pasteResult, false);

              element.innerText = story.name + " - " + response.name;
              $RESULTS_CACHE.push(element);

              resultsContainer.appendChild(element);
              resultsContainer.appendChild(divider);

              searchInput.parentNode.appendChild(resultsContainer);
            }
          );
        });

        searchInput.parentNode.appendChild(resultsContainer);
      }
    );
  }
};

var injectSearchField = () => {
  let targetTextArea =
    document.querySelector("#new_comment_field") ||
    document.querySelector("#pull_request_body");

  if (
    targetTextArea &&
    !document.querySelector("#clubhouse-button-container")
  ) {
    targetTextArea.parentNode.insertBefore(buttonContainer, targetTextArea);
    searchInput.addEventListener("blur", clearSearch, false);
    searchInput.addEventListener("keypress", search, false);
  }
};

/*
 * When navigating back and forth in history, GitHub will preserve the DOM changes;
 * This means that the old features will still be on the page and don't need to re-run.
 * For this reason `onAjaxedPages` will only call its callback when a *new* page is loaded.
 *
 * Alternatively, use `onAjaxedPagesRaw` if your callback needs to be called at every page
 * change (e.g. to "unmount" a feature / listener) regardless of of *newness* of the page.
 */
document.addEventListener("pjax:end", injectSearchField, false);

injectSearchField();

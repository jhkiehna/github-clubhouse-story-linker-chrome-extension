console.log("script running");

let buttonContainer = document.createElement("div");
buttonContainer.setAttribute("id", "clubhouse-button-container");
buttonContainer.setAttribute(
  "style",
  "position: relative; width: 100%; padding-bottom: 0.5em;"
);

let searchButton = document.createElement("button");
searchButton.setAttribute("type", "button");
searchButton.setAttribute("id", "clubhouse-search-button");
searchButton.setAttribute(
  "style",
  `display: block;
  padding: 1em 2em;
  border-radius: 5px;
  margin-left: auto;
  margin-right: auto;
  color: #fff;
  background-color: #463460;`
);
searchButton.innerText = "Search for Clubhouse Issues";
buttonContainer.appendChild(searchButton);

let searchInput = document.createElement("input");
searchInput.setAttribute("id", "search-input-box");
searchInput.setAttribute("type", "text");
searchInput.setAttribute(
  "style",
  "border-radius: 5px; width: 100%; margin-top: 0.5em; margin-bottom: 0.5em; padding: 0.25em 1em;"
);

var pasteResult = event => {
  let textArea = document.querySelector("#new_comment_field");
  textArea.value = "[" + event.target.getAttribute("id") + "]";

  document
    .querySelector("#partial-new-comment-form-actions button")
    .removeAttribute("disabled");
};

var clearSearch = () => {
  setTimeout(() => {
    while (document.querySelector("#search-results-container")) {
      document
        .querySelector("#search-results-container")
        .parentNode.removeChild(
          document.querySelector("#search-results-container")
        );
    }
  }, 300);
};

var search = event => {
  if (event.keyCode != 13) {
    return;
  }

  while (document.querySelector("#search-results-container")) {
    document
      .querySelector("#search-results-container")
      .parentNode.removeChild(
        document.querySelector("#search-results-container")
      );
  }

  let resultsContainer = document.createElement("div");
  resultsContainer.setAttribute("id", "search-results-container");
  resultsContainer.setAttribute(
    "style",
    `
    position: absolute;
    bottom: 3em;
    z-index: 9999;
    width: 500px;
    min-height: 20px;
    background-color: #fff;
    border: 1px solid #333;
    border-radius: 5px;
    box-shadow: 2px 2px rgba(0,0,0,0.3);
    padding: 0.5em;
    `
  );

  let searchTerm = searchInput.value;

  if (searchTerm) {
    chrome.runtime.sendMessage(
      { contentScriptQuery: "fetchStories", searchTerm: searchTerm },
      response => {
        response.data.forEach((story, index) => {
          if (index <= 10) {
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

                resultsContainer.appendChild(element);
                resultsContainer.appendChild(divider);

                searchInput.parentNode.appendChild(resultsContainer);
              }
            );
          }
        });

        searchInput.parentNode.appendChild(resultsContainer);
      }
    );
  }
};

var displaySearchField = () => {
  buttonContainer.appendChild(searchInput);
  searchInput.focus();

  searchInput.addEventListener("blur", clearSearch, false);
  searchInput.addEventListener("keypress", search, false);

  searchButton.parentNode.removeChild(searchButton);
};

var injectButton = () => {
  let commentTextArea = document.querySelector("#new_comment_field");

  if (commentTextArea) {
    commentTextArea.parentNode.insertBefore(buttonContainer, commentTextArea);
    searchButton.addEventListener("click", displaySearchField, false);
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
document.addEventListener(
  "pjax:end",
  () => {
    injectButton();
  },
  false
);

injectButton();

const $CACHE = {
  results: [],
  search_term: null,
  selector_position: 0,
  selected_element: null
};

let buttonContainer = document.createElement("div");
buttonContainer.setAttribute("id", "clubhouse-button-container");

let searchInput = document.createElement("input");
searchInput.setAttribute("id", "search-input-box");
searchInput.setAttribute("type", "text");
searchInput.setAttribute("placeholder", "Search for clubhouse story");
buttonContainer.appendChild(searchInput);

function clearResults() {
  $CACHE.selector_position = 0;
  $CACHE.selected_element &&
    $CACHE.selected_element.setAttribute("class", "search-result");
  $CACHE.selected_element = null;
  while (document.querySelector("#search-results-container")) {
    document
      .querySelector("#search-results-container")
      .parentNode.removeChild(
        document.querySelector("#search-results-container")
      );
  }
}

var clearSearch = () => {
  setTimeout(clearResults, 100);
};

var pasteResult = event => {
  let targetTextArea =
    document.querySelector("#new_comment_field") ||
    document.querySelector("#pull_request_body");

  while (document.querySelector("#story-link")) {
    searchInput.parentNode.removeChild(document.querySelector("#story-link"));
  }

  let storyLink = document.createElement("a");
  storyLink.setAttribute("id", "story-link");
  storyLink.setAttribute("target", "_blank");
  storyLink.setAttribute("rel", "noopener noreferrer");

  if (targetTextArea) {
    if (event) {
      targetTextArea.value = "[" + event.target.getAttribute("id") + "]";

      storyLink.setAttribute("href", event.target.getAttribute("data-app-url"));
      storyLink.innerText = `Link to Story ${event.target.getAttribute(
        "id"
      )} - ${event.target.getAttribute("data-story-name")}`;
    } else {
      targetTextArea.value =
        "[" + $CACHE.selected_element.getAttribute("id") + "]";

      storyLink.setAttribute(
        "href",
        $CACHE.selected_element.getAttribute("data-app-url")
      );
      storyLink.innerText = `Link to Story ${$CACHE.selected_element.getAttribute(
        "id"
      )} - ${$CACHE.selected_element.getAttribute("data-story-name")}`;
    }

    searchInput.parentNode.appendChild(storyLink);

    document.querySelector("#partial-new-comment-form-actions button") &&
      document
        .querySelector("#partial-new-comment-form-actions button")
        .removeAttribute("disabled");

    clearResults();
  } else {
    console.log("Can't find text area");
  }
};

function select(keyCode) {
  let resultsContainer = document.querySelector("#search-results-container");
  let totalElements = resultsContainer.children.length;

  let previousSelectedElement =
    resultsContainer.children[$CACHE.selector_position];
  previousSelectedElement.setAttribute("class", "search-result");

  if (keyCode == 38) {
    if ($CACHE.selected_element) {
      $CACHE.selector_position--;
    }
    if ($CACHE.selector_position < 0) {
      $CACHE.selector_position = totalElements - 1;
    }
  }

  if (keyCode == 40) {
    if ($CACHE.selected_element) {
      $CACHE.selector_position++;
    }
    if ($CACHE.selector_position > totalElements - 1) {
      $CACHE.selector_position = 0;
    }
  }

  $CACHE.selected_element = resultsContainer.children[$CACHE.selector_position];
  $CACHE.selected_element.setAttribute("class", "search-result-selected");
  $CACHE.selected_element.parentNode.scrollTop =
    $CACHE.selected_element.offsetTop;
}

function displayCachedResults() {
  if ($CACHE.results.length && $CACHE.search_term === searchInput.value) {
    let resultsContainer = document.createElement("div");
    resultsContainer.setAttribute("id", "search-results-container");

    $CACHE.results.forEach(element => {
      resultsContainer.appendChild(element);
    });

    searchInput.parentNode.appendChild(resultsContainer);
  }
}

var search = () => {
  clearResults();
  let searchTerm = searchInput.value;

  if ($CACHE.results.length && $CACHE.search_term === searchInput.value) {
    displayCachedResults();
  } else if (searchTerm) {
    let resultsContainer = document.createElement("div");
    resultsContainer.setAttribute("id", "search-results-container");

    chrome.runtime.sendMessage(
      { contentScriptQuery: "fetchStories", searchTerm: searchTerm },
      response => {
        $CACHE.search_term = searchTerm;
        $CACHE.results = [];

        if (response.data) {
          if (response.data.length) {
            response.data.forEach(story => {
              chrome.runtime.sendMessage(
                {
                  contentScriptQuery: "fetchProject",
                  projectId: story.project_id
                },
                projectResponse => {
                  let element = document.createElement("a");
                  element.setAttribute("style", "cursor: pointer");
                  element.setAttribute("id", `ch${story.id}`);
                  element.setAttribute("data-app-url", `${story.app_url}`);
                  element.setAttribute("data-story-name", `${story.name}`);
                  element.setAttribute("class", "search-result");
                  element.addEventListener("click", pasteResult, false);

                  element.innerText = story.name + " - " + projectResponse.name;
                  $CACHE.results.push(element);

                  resultsContainer.appendChild(element);
                }
              );
            });
          } else {
            let element = document.createElement("p");
            element.innerText = "Search returned no results";

            resultsContainer.appendChild(element);
          }
        } else {
          let element = document.createElement("p");
          element.innerText = response.message
            ? response.message
            : "An error occurred";

          resultsContainer.appendChild(element);
        }

        searchInput.parentNode.appendChild(resultsContainer);
        resultsContainer.scrollIntoView({ block: "center" });
      }
    );
  }
};

var keyHandler = event => {
  if (document.querySelector("#search-results-container")) {
    if (event.keyCode == 38 || event.keyCode == 40) {
      event.preventDefault();
      select(event.keyCode);
    }
  }

  if (event.keyCode == 13) {
    event.preventDefault();
    if ($CACHE.selected_element) {
      pasteResult();
    } else {
      search();
    }
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
    searchInput.addEventListener("focus", displayCachedResults, false);
    searchInput.addEventListener("keydown", keyHandler, false);
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

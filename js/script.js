let buttonContainer = document.createElement("div");
buttonContainer.setAttribute("id", "clubhouse-button-container");
buttonContainer.setAttribute(
  "style",
  "position: relative; width: 100%; padding-bottom: 0.5em;"
);

var clearSearch = () => {
  let previousResults = document.querySelector("#search-results-container");
  if (previousResults) {
    previousResults.parentNode.removeChild(previousResults);
  }
};

var search = () => {
  let previousResults = document.querySelector("#search-results-container");
  if (previousResults) {
    previousResults.parentNode.removeChild(previousResults);
  }

  let searchInput = document.querySelector("#search-input-box");
  let inputValue = searchInput.value;

  let resultsContainer = document.createElement("div");
  resultsContainer.setAttribute("id", "search-results-container");
  resultsContainer.setAttribute(
    "style",
    `
      position: absolute;
      bottom: 3em;
      z-index: 9999;
      width: 300px;
      min-height: 20px;
      background-color: #fff;
      border: 1px solid #333;
      border-radius: 5px;
      box-shadow: 2px 2px rgba(0,0,0,0.3);
      padding: 0.5em;
    `
  );

  if (inputValue) {
    chrome.runtime.sendMessage(
      { contentScriptQuery: "fetchStories", queryString: inputValue },
      response => console.log(response)
    );

    resultsContainer.innerHTML = inputValue;
    searchInput.parentNode.appendChild(resultsContainer);
  }
};

var displaySearch = () => {
  console.log("button clicked");

  let searchInput = document.createElement("input");
  searchInput.setAttribute("id", "search-input-box");
  searchInput.setAttribute("type", "text");
  searchInput.setAttribute(
    "style",
    "border-radius: 5px; width: 100%; margin-top: 0.5em; margin-bottom: 0.5em; padding: 0.25em 1em;"
  );

  document
    .querySelector("#clubhouse-button-container")
    .appendChild(searchInput);

  searchInput.focus();

  searchInput.addEventListener("blur", clearSearch, false);
  searchInput.addEventListener("keyup", search, false);

  let button = document.querySelector("#clubhouse-search-button");
  button.parentNode.removeChild(button);
};

function injectButton(prTextArea, buttonContainer, interval) {
  buttonContainer.innerHTML = `
    <button
      type="button"
      id="clubhouse-search-button"
      style="
        display: block;
        padding: 1em 2em;
        border-radius: 5px;
        margin-left: auto;
        margin-right: auto;
        color: #fff;
        background-color: #463460;"
    >
      Search for Clubhouse Issues
    </button>
  `;

  prTextArea.parentNode.insertBefore(buttonContainer, prTextArea);

  document
    .querySelector("#clubhouse-search-button")
    .addEventListener("click", displaySearch);

  clearInterval(interval);
}

var interval = setInterval(() => {
  let prTextArea = document.querySelector("#pull_request_body");

  if (prTextArea) {
    injectButton(prTextArea, buttonContainer, interval);
  }
}, 1000);

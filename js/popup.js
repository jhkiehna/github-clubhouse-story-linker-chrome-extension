let apiTokenField = document.querySelector("#api-token-field");

apiTokenField.addEventListener(
  "keypress",
  event => {
    if (event.keyCode != 13) {
      return;
    }

    chrome.runtime.sendMessage(
      { contentScriptQuery: "setToken", token: event.target.value },
      response => {
        document.querySelector("#api-message").innerText = response;
      }
    );
  },
  false
);

chrome.runtime.sendMessage({ contentScriptQuery: "checkToken" }, response => {
  document.querySelector("#api-message").innerText = response;
});

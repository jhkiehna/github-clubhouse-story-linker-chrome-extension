let apiTokenField = document.querySelector("#api-token-field");

apiTokenField.addEventListener(
  "keypress",
  event => {
    if (event.keyCode != 13) {
      return;
    }

    let existingMessage = document.querySelector("#message");
    if (existingMessage) {
      existingMessage.parentNode.removeChild(existingMessage);
    }

    chrome.runtime.sendMessage(
      { contentScriptQuery: "setToken", token: event.target.value },
      response => {
        let message = document.createElement("p");
        message.setAttribute("id", "message");
        message.innerText = response;

        apiTokenField.parentNode.appendChild(message);
      }
    );
  },
  false
);

chrome.runtime.sendMessage({ contentScriptQuery: "checkToken" }, response => {
  let existingMessage = document.querySelector("#message");
  if (existingMessage) {
    existingMessage.parentNode.removeChild(existingMessage);
  }

  let message = document.createElement("p");
  message.setAttribute("id", "message");
  message.innerText = response;

  apiTokenField.parentNode.appendChild(message);
});

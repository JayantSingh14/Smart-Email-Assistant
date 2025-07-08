function createAIButton() {
  const button = document.createElement("div");
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3";
  button.style.marginRight = "8px";
  
 // button.style.transition = "transform 0.2s, box-shadow 0.2s";
  button.textContent = "AI Reply";

//   button.setAttribute("role", "button");
//   button.setAttribute("tabindex", "1");
//   button.setAttribute("arial-label", "Generate AI Reply");

  // Hover effect using mouse events
  button.addEventListener("mouseover", () => {
    button.style.transform = "scale(1.05)";
    button.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  });
  button.addEventListener("mouseout", () => {
    button.style.transform = "scale(1)";
    button.style.boxShadow = "none";
  });
  return button;
}
function getEmailContent() {
  const selectors = [
    ".h7",
    ".a3s.aiL",
    ".gmail_quote",
    '[role="presentation"]',
  ];
  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content) {
      return content.innerText.trim();
    }
    return "";
  }
}

function findComposeToolbar() {
  const selectors = [".aDh", ".btC", '[role="toolbar"]'];

  //  const selectors =[
  //     '.btc',
  //     '.aDh',
  //     '[role="toolbar"]',
  //     '.gU.Up'
  //];
  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) {
      return toolbar;
    }
  }
  return null;
}

function injectButton() {
  const existingButton = document.querySelector(".ai-reply-button");
  if (existingButton) existingButton.remove();
  // Find the actual Send button
  const sendButton = document.querySelector('div[role="button"][data-tooltip^="Send"]');
  if (!sendButton) {
    console.log("Send button not found yet.");
    return;
  }

  //  Now get its flex container (usually a div that holds Send + formatting tools)
  const sendButtonContainer = sendButton.parentElement;
  if (!sendButtonContainer) {
    console.log("Send button container not found.");
    return;
  }

  console.log("Found Send button. Injecting AI Reply beside it.");

  //  Create the AI Reply button
  const button = createAIButton();
  button.classList.add("ai-reply-button");

  //  Insert right beside the Send button
  sendButton.insertAdjacentElement("afterend", button);



//   const toolbar = findComposeToolbar();

//   if (!toolbar) {
//     console.log("Toolbar not found");
//     return;
//   }
//   console.log("Toolbar found, creating AI button");
//   const button = createAIButton();
//   button.classList.add("ai-reply-button");

  
  button.addEventListener("click", async () => {
    try {
      // button.innerHTML='Generating...';
      // button.disabled=true;
      button.textContent = "⏳ Generating...";
      button.style.pointerEvents = "none";
      button.style.opacity = "0.7";

      const emailContent = getEmailContent();
      const response = await fetch("http://localhost:8080/api/email/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailContent: emailContent,
          tone: "professional",
        }),
      });
      if (!response.ok) {
        throw new Error("API Request Failed");
      }

      const generatedReply = await response.text();
      const composeBox = document.querySelector(
        '[role="textbox"][g_editable="true"]'
      );

      if (composeBox) {
        composeBox.focus();
        document.execCommand("insertText", false, generatedReply);
      } else {
        console.log("Compose box was not found");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate reply");
    } finally {
      button.innerHTML = "AI Reply";
      //button.disabled= false;
      button.style.pointerEvents = "auto";
      button.style.opacity = "1";
    }
  });

  //toolbar.insertBefore(button, toolbar.firstChild);
  //toolbar.appendChild(button);
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const hasCompose = addedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches('.aDh, .btC, [role="dialog"]') ||
          node.querySelector('.aDh, .btC, [role="dialog"]'))
    );

    if (hasCompose) {
      console.log("Compose window Detected");
      setTimeout(injectButton, 500);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

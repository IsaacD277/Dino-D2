//#region INITIALIZE
// Initial values set
let trixInitialized = false;
let newsletterData = null;
let newsletter = null;
let authRetried = false;
let form;
let stageDiv;
let sendDiv;

// Allows for production and development switching
const version = getAPIMode();

// Pulls newsletterId from the url
const newsletterId = getNewsletterId();

//#endregion

//#region FUNCTIONS
function getAPIMode() {
    const version = localStorage.getItem("version");
    return version;
}

function getNewsletterId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('newsletterId');
}

function retry() {
    if (!authRetried) {
        authRetried = true;
        const retryAuth = new CustomEvent("retryAuth", {
            detail: {
                retried: true,
            },
        });

        window.dispatchEvent(retryAuth);
    };
}

function getStats() {
    const version = getAPIMode();
    token = localStorage.getItem("id_token");
    fetch(`https://api.dinod2.com/${version}/stats/${encodeURIComponent(newsletterId)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: token
        }
    })
    .then(res => {
        if (res.status === 401) {
            console.log("401 Error");
            retry();
        }
        if (!res.ok) throw new Error("Failed to load stats");
        return res.json();
    })
    .then(data => {
        // Handle stats data here
        document.getElementById('sendCount').textContent = data.sent || "0";
        document.getElementById('openRate').textContent = data.openRate ? (data.openRate) + "%" : "0%";
    })
    .catch(err => {
        console.error("Error fetching stats:", err);
    });
}

async function loadNewsletterData(newsletterId) {
  token = localStorage.getItem("id_token");
  try {
    const response = await fetch(`https://api.dinod2.com/${version}/newsletters/${encodeURIComponent(newsletterId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      }
    });

    if (response.status === 401) {
      console.log("401 Error");
      retry();
    } if (!response.ok) {
      throw new Error(`Failed to load newsletter: ${response.status}`);
    }

    const newsletter = await response.json();

  setNewsletterDetails(newsletter);

  return newsletter
  } catch (err) {
    console.error("Error loading newsletter:", err);
    return null;
  }
}

function setNewsletterDetails(newsletter) {
  document.getElementById('subject').value = newsletter.subject || "";
  document.getElementById('preview').value = newsletter.preview || "";
  newsletterData = newsletter.content || "";
  document.getElementById('stageDropdown').value = newsletter.stage || "Draft";
  document.getElementById('sendDate').value = newsletter.sendDate || "";
  document.getElementById('pageTitle').textContent = "Edit Newsletter";

  if (trixInitialized) {
    loadTrixContent(newsletterData);
  }
}

async function loadNewsletter() {
  // If Trix already ready, load immediately
  if (trixInitialized) {
    loadTrixContent(data.content);
  }
}

function loadTrixContent(data) {
  const editor = document.querySelector("trix-editor");
  if (editor) editor.editor.loadHTML(data || "");
}

function handleTrixInitialize(event) {
    trixInitialized = true;
    // If data already fetched, load it now
    if (newsletterData) {
      loadTrixContent(newsletterData);
    }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  stageDiv.textContent = "";

  subject = document.getElementById('subject').value || "";
  preview = document.getElementById('preview').value || "";
  content = document.getElementById('content').value || "";
  stage = document.getElementById('stageDropdown').value || "";
  sendDate = document.getElementById('sendDate').value || ""

  const payload = {
    subject: subject,
    preview: preview,
    content: content,
    stage: stage,
    sendDate: sendDate
  };

  try {
    const version = getAPIMode();
    token = localStorage.getItem("id_token");
    const response = await fetch(
      `https://api.dinod2.com/${version}/newsletters/${encodeURIComponent(newsletterId)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify(payload)
      }
    );

    if (response.status === 401) {
      console.log("401 Error");
      retry();
    } if (!response.ok) {
      throw new Error("Failed to save newsletter");
    }

    stageDiv.textContent = "Newsletter saved!";

    // Update local variable
    Object.assign(newsletter, payload);
  } catch (err) {
    stageDiv.textContent = err.message;
  }
}

async function populateSubscriberDropdown() {
    const userDropdown = document.getElementById("userDropdown");
    token = localStorage.getItem("id_token");
    // Populate users
    try {
        const subRes = await fetch(`https://api.dinod2.com/${version}/subscribers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            }
        });

        if (subRes.status === 401) {
            console.log("401 Error");
            retry();
        }

        const subscribers = subRes.ok ? await subRes.json() : [];
        userDropdown.innerHTML = "";
        let foundActive = false;
        subscribers.forEach(sub => {
            if (sub.condition == "Subscribed") {
                foundActive = true;
                const opt = document.createElement("option");
                opt.value = JSON.stringify({ id: sub.id, email: sub.emailAddress });
                opt.textContent = `${sub.firstName} (${sub.emailAddress})`;
                userDropdown.appendChild(opt);
            }
        });
        if (!foundActive) {
            userDropdown.innerHTML = '<option value="">No active users</option>';
        }
    } catch (e) {
        userDropdown.innerHTML = '<option value="">Error loading users</option>';
    }
}

//#endregion

//#region EVENT LISTENERS
addEventListener("trix-initialize", handleTrixInitialize);

window.addEventListener("authReady", async (e) => {
    const loggedIn = e.detail.valid;
    if (loggedIn) {
        document.getElementById("loggedOutView").style.display = loggedIn ? "none" : "block";
        document.getElementById("loggedInView").style.display = loggedIn ? "block" : "none";
        token = localStorage.getItem("id_token");
        if (!token) {
            console.warn("No id_token found after auth ready.");
            return null;
        }

        form = document.getElementById('newsletterForm');
        stageDiv = document.getElementById('stage');
        sendDiv = document.getElementById('send');

        newsletter = await loadNewsletterData(newsletterId);

        getStats();
        populateSubscriberDropdown();

        if (form) {
          form.addEventListener("submit", handleFormSubmit);
        }

        const existingEditor = document.querySelector("trix-editor");
        if (existingEditor && existingEditor.editor) {
            // simulate event.target if your handler needs it
            handleTrixInitialize({ target: existingEditor });
        }
    }
});

//#endregion

//#region BUTTONS
document.getElementById('backBtn').onclick = () => {
  window.location.href = "index.html";
};

document.getElementById("testNewsletterBtn").addEventListener("click", async () => {
    const userDropdown = document.getElementById("userDropdown");
    const statusSpan = document.getElementById("testNewsletterStatus");
    statusSpan.textContent = "";

    if (!userDropdown.value || !newsletterId) {
        statusSpan.textContent = "Please select both a user and a newsletter.";
        return;
    }

    // parse the JSON payload we stored on the option value
    let selected;
    try {
        selected = JSON.parse(userDropdown.value);
    } catch (e) {
        statusSpan.textContent = "Invalid user selected.";
        return;
    }

    const userId = selected.id;
    const recipient = selected.email;
    token = localStorage.getItem("id_token");

    try {
        const response = await fetch(`https://api.dinod2.com/${version}/email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify({
                userId: userId,
                emailAddress: recipient,
                newsletterId: newsletterId
            })
        });

        if (response.status === 401) {
            console.log("401 Error");
            retry();
        } if (response.ok) {
            statusSpan.textContent = "Email sent successfully!";
        } else {
            const error = await response.text();
            statusSpan.textContent = "Failed: " + error;
        }
    } catch (err) {
        statusSpan.textContent = "Error: " + err.message;
    }
});

document.getElementById('sendAllBtn').onclick = async () => {
  const payload = {
    newsletterId: newsletterId
  };

  try {
    if (newsletter.stage !== "Ready") {
      throw new Error("Please make sure newsletter is in \"Ready\" status");
    }

    const version = getAPIMode();
    token = localStorage.getItem("id_token");
    const response = await fetch(
      `https://api.dinod2.com/${version}/emailAll`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify(payload)
      }
    );

    if (response.status === 401) {
      console.log("401 Error");
      retry();
    } if (!response.ok) {
      throw new Error("Failed to send newsletter to all subscribers");
    }
    sendDiv.textContent = "Newsletter sent to all subscribers!";
  } catch (err) {
    sendDiv.textContent = err.message;
  }
}

//#endregion

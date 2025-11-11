//#region INITIALIZE
let token = null;
let authRetried = false;

//#endregion

//#region FUNCTIONS
function getAPIMode() {
    const version = localStorage.getItem("version");
    if (!version) {
        localStorage.setItem("version", "v0"); // "v0"
        const version = localStorage.getItem("version");
    }
    return version;
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

function compare( a, b ) {
  if ( a.sendDate < b.sendDate ){
    return 1;
  }
  if ( a.sendDate > b.sendDate ){
    return -1;
  }
  return 0;
}

async function getNewsletters() {
    const version = getAPIMode();
    token = localStorage.getItem("id_token");
    try {
        const response = await fetch(`https://api.dinod2.com/${version}/newsletters`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            }
        });

        if (response.status === 401) {
            console.log("401 error")
            retry();
        } if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        };

        const newsletters = await response.json();
        newsletters.sort( compare );
        renderNewsletters(newsletters);
    } catch (error) {
        console.error("Error fetching newsletters:", error);
        return null;
    }
}

function renderNewsletters(newsletters) {
    const table = document.getElementById("newslettersTable");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    if (!newsletters || newsletters.length === 0) {
        tbody.innerHTML = "<tr><td colspan ='5'>No newsletters yet.</td></tr>";
        return;
    }

    newsletters.forEach(newsletter => {
        const tr = document.createElement("tr");

        const subjectTd = document.createElement("td");
        subjectTd.textContent = newsletter.subject || "";

        const previewTd = document.createElement("td");
        previewTd.textContent = newsletter.preview || "";

        const stageTd = document.createElement("td");
        stageTd.textContent = newsletter.stage;

        const sendDateTd = document.createElement("td");
        sendDateTd.textContent = newsletter.sendDate;

        const editTd = document.createElement("td");
        const button = document.createElement("button");
        button.textContent = "Edit";

        button.addEventListener("click", () => {
            window.location.href = `newsletter.html?newsletterId=${newsletter.id}`;
        });

        editTd.appendChild(button);

        tr.appendChild(subjectTd);
        tr.appendChild(previewTd);
        tr.appendChild(stageTd);
        tr.appendChild(sendDateTd);
        tr.appendChild(editTd);

        tbody.appendChild(tr);
    });
}

//#endregion

//#region EVENT LISTENERS
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
        getAPIMode();
        getNewsletters();
        populateDropdowns();
    }
});

//#endregion

//#region BUTTONS
document.getElementById("addNewsletter").addEventListener("click", async () => {
    const version = getAPIMode();
    token = localStorage.getItem("id_token");
    try {
        const response = await fetch(`https://api.dinod2.com/${version}/newsletters`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify({})
        });

        if (response.status === 401) {
            console.log("401 Error");
            retry();
        } if (!response.ok) {
            throw new Error(`HTTP error! Stage: ${response.stage}`);
        };

        data = await response.json();
        const newsletterId = data.id;
        
        window.location.href = `newsletter.html?newsletterId=${newsletterId}`;

    } catch (error) {
        console.error(error);
        return null
    }
});

document.getElementById("goToSubscribers").addEventListener("click", () => {
    window.location.href = 'subscribers.html';
});

//#endregion
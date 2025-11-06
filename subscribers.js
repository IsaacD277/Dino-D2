const token = localStorage.getItem("id_token");

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        return null
    }
    getAPIMode();

    const subscribers = getSubscribers();
});

window.addEventListener("authReady", async (e) => {
    const loggedIn = e.detail.valid;
    console.log("The custom event was received.");
    if (loggedIn) {
        document.getElementById("loggedOutView").style.display = loggedIn ? "none" : "block";
        document.getElementById("loggedInView").style.display = loggedIn ? "block" : "none";
        const token = localStorage.getItem("id_token");
        if (!token) {
            console.warn("No id_token found after auth ready.");
            return null;
        }
        console.log("Token: " + token);
        getAPIMode();
        getSubscribers();
    }
});

function getAPIMode() {
    const version = localStorage.getItem("version");
    if (!version) {
        localStorage.setItem("version", "v0");
        const version = localStorage.getItem("version");
    }
    return version;
}

async function getSubscribers() {
    const version = getAPIMode();
    try {
        const response = await fetch(`https://api.dinod2.com/${version}/subscribers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const subscribers = await response.json();
        console.log(subscribers);
        totalSubscribers(subscribers);
        renderSubscribers(subscribers);
    } catch (error) {
        console.error("Error fetching subscribers:", error);
        return null;
    }
}

// Render list in the <ul>
function renderSubscribers(subscribers) {
    const table = document.getElementById("subscribersTable");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    if (!subscribers || subscribers.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5'>No subscribers yet.</td></tr>";
        return;
    }

    const options = {
        timeZone: "America/New_York",
        year: "numeric",
        month: "short",
        day: "numeric"
    };

    subscribers.forEach(sub => {
        const subscribeDate = sub.created ? new Date(sub.created) : null;
        const tr = document.createElement("tr");

        const nameTd = document.createElement("td");
        nameTd.textContent = sub.firstName || "";

        const emailTd = document.createElement("td");
        emailTd.textContent = sub.emailAddress || "";

        const joinedTd = document.createElement("td");
        joinedTd.textContent = subscribeDate && !isNaN(subscribeDate)
            ? subscribeDate.toLocaleString("en-US", options)
            : "unknown";

        const statusTd = document.createElement("td");
        statusTd.textContent = sub.condition || "";

        const actionTd = document.createElement("td");
        const button = document.createElement("button");
        button.textContent = "Edit";

        button.addEventListener("click", () => {
            window.location.href = `subscriber.html?subscriberId=${sub.id}`;
        });

            actionTd.appendChild(button);

            tr.appendChild(nameTd);
            tr.appendChild(emailTd);
            tr.appendChild(joinedTd);
            tr.appendChild(statusTd);
            tr.appendChild(actionTd);

            tbody.appendChild(tr);
        });
}

document.getElementById("addSubscriber").addEventListener("click", async () => {
    try {
        const payload = {
            emailAddress: document.getElementById('emailAddress').value || "",
            firstName: document.getElementById('firstName').value || ""
        };

        const response = await fetch(`https://api.dinod2.com/${version}/subscribers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Stage: ${response.stage}`);
        }

        data = await response.json();
        // alert(`Successfully added ${emailAddress.value} as a subscriber`);
        document.getElementById('emailAddress').value = "";
        document.getElementById('firstName').value = "";
        getSubscribers();

    } catch (error) {
        console.error(error);
        return null
    }
});

document.getElementById("profileBtn").addEventListener("click", () => {
    window.location.href = `profile.html`;
});

function totalSubscribers(subscribers) {
    if (!subscribers) return 0;
    if (Array.isArray(subscribers)) {
        const total = subscribers.length;
        const heading = document.getElementById("subscribersHeading");
        heading.textContent = `${total} Subscriber${total === 1 ? "" : "s"}`;
    }
    
}

document.getElementById('backBtn').onclick = () => {
  window.location.href = "index.html";
};
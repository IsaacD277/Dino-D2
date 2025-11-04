const token = localStorage.getItem("id_token");

function getAPIMode() {
    const version = localStorage.getItem("version");
    if (!version) {
        localStorage.setItem("version", "v0");
        const version = localStorage.getItem("version");
    }
    return version;
}

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        return null
    }
    getAPIMode();
    getNewsletters();
    populateDropdowns();
});
// --- Dropdown population and send logic ---
async function populateDropdowns() {
    const userDropdown = document.getElementById("userDropdown");
    const newsletterDropdown = document.getElementById("newsletterDropdown");
    const version = getAPIMode();
    // Populate users
    try {
        const subRes = await fetch(`https://api.dinod2.com/${version}/subscribers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            }
        });
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
    // Populate newsletters
    try {
        const nlRes = await fetch(`https://api.dinod2.com/${version}/newsletters`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            }
        });
        const newsletters = nlRes.ok ? await nlRes.json() : [];
        newsletterDropdown.innerHTML = "";
        if (newsletters.length === 0) {
            newsletterDropdown.innerHTML = '<option value="">No newsletters</option>';
        } else {
            newsletters.forEach(nl => {
                const opt = document.createElement("option");
                const id = nl.id || nl.newsletterId || "";
                opt.value = id;
                opt.textContent = `${nl.subject} (${nl.sendDate || 'No date'})`;
                newsletterDropdown.appendChild(opt);
            });
        }
    } catch (e) {
        newsletterDropdown.innerHTML = '<option value="">Error loading newsletters</option>';
    }
}

document.getElementById("sendNewsletterBtn").addEventListener("click", async () => {
    const userDropdown = document.getElementById("userDropdown");
    const newsletterDropdown = document.getElementById("newsletterDropdown");
    const statusSpan = document.getElementById("sendNewsletterStatus");
    const newsletterId = newsletterDropdown.value;
    const version = getAPIMode();
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
    console.log(userId, recipient);

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
        if (response.ok) {
            statusSpan.textContent = "✅ Email sent successfully!";
        } else {
            const error = await response.text();
            statusSpan.textContent = "❌ Failed: " + error;
        }
    } catch (err) {
        statusSpan.textContent = "❌ Error: " + err.message;
    }
});

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
        renderSubscribers(subscribers)
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

async function getNewsletters() {
    const version = getAPIMode();
    try {
        const response = await fetch(`https://api.dinod2.com/${version}/newsletters`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const newsletters = await response.json();
        renderNewsletters(newsletters)
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

document.getElementById("addNewsletter").addEventListener("click", async () => {
    const version = getAPIMode();
    try {
        const response = await fetch(`https://api.dinod2.com/${version}/newsletters`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Stage: ${response.stage}`);
        }

        data = await response.json();
        const newsletterId = data.id;
        
        window.location.href = `newsletter.html?newsletterId=${newsletterId}`;

    } catch (error) {
        console.error(error);
        return null
    }
});

document.getElementById("profileBtn").addEventListener("click", () => {
    window.location.href = `profile.html`;
});

document.getElementById("goToSubscribers").addEventListener("click", () => {
    window.location.href = 'subscribers.html';
});
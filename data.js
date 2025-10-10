const token = localStorage.getItem("id_token");

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        return null
    }

    getSubscribers();
    getNewsletters();
    populateDropdowns();
});
// --- Dropdown population and send logic ---
async function populateDropdowns() {
    const userDropdown = document.getElementById("userDropdown");
    const newsletterDropdown = document.getElementById("newsletterDropdown");
    // Populate users
    try {
        const subRes = await fetch("https://beacon.isaacd2.com/subscribers", {
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
            if (sub.condition == "subscribed") {
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
        const nlRes = await fetch("https://beacon.isaacd2.com/newsletters", {
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
                opt.value = nl.newsletterId;
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

    const userId = selected.secondary;
    const recipient = selected.email;
    console.log(userId, recipient);

    try {
        const response = await fetch("https://beacon.isaacd2.com/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify({
                userId: userId,
                recipient: recipient,
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
    try {
        const response = await fetch("https://beacon.isaacd2.com/subscribers", {
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
        console.log(subscribers)
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

    subscribers.forEach(sub => {
        const tr = document.createElement("tr");

        const nameTd = document.createElement("td");
        nameTd.textContent = sub.firstName || "";

        const emailTd = document.createElement("td");
        emailTd.textContent = sub.emailAddress || "";

        const joinedTd = document.createElement("td");
        joinedTd.textContent = sub.subscriptionDate || "unknown";

        const statusTd = document.createElement("td");
        statusTd.textContent = sub.condition == "subscribed" ? "Active" : "Unsubscribed";

        const actionTd = document.createElement("td");
        const button = document.createElement("button");
        button.textContent = sub.condition == "subscribed" ? "Unsubscribe" : "Resubscribe";

        button.addEventListener("click", async () => {
            try {
                if (sub.condition == "subscribed") {
                    const response = await fetch("https://beacon.isaacd2.com/unsubscribe", {
                        method: "PATCH",
                        headers: {
                        "Content-Type": "application/json",
                        Authorization: token
                        },
                        body: JSON.stringify({ userId: sub.id })
                    });

                    if (response.ok) {
                        sub.condition = "unsubscribed";
                        statusTd.textContent = "Unsubscribed";
                        button.textContent = "Resubscribe";
                        alert(`${sub.emailAddress} unsubscribed successfully`);
                    } else {
                        const error = await response.text();
                        alert("Failed to unsubscribe: " + error);
                    }
                } else {
                    const response = await fetch(`https://beacon.isaacd2.com/subscribers/${encodeURIComponent(sub.id)}`, {
                        method: "PATCH",
                        headers: {
                        "Content-Type": "application/json",
                        Authorization: token
                        },
                        body: JSON.stringify({ "condition": "subscribed" })
                    });

                    if (response.ok) {
                        sub.condition = "subscribed";
                        statusTd.textContent = "Active";
                        button.textContent = "Unsubscribe";
                        alert(`${sub.emailAddress} resubscribed successfully`);
                    } else {
                        const error = await response.text();
                        alert("Failed to resubscribe: " + error);
                    }
                }
            } catch (err) {
                console.error(err);
                alert("Something went wrong.");
            }
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
    try {
        const response = await fetch("https://beacon.isaacd2.com/newsletters", {
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
        console.log(newsletters)
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
    try {
        const response = await fetch("https://beacon.isaacd2.com/newsletters", {
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

document.getElementById("addSubscriber").addEventListener("click", async () => {
    try {
        const payload = {
            emailAddress: document.getElementById('emailAddress').value || "",
            firstName: document.getElementById('firstName').value || ""
        };

        const response = await fetch("https://beacon.isaacd2.com/subscribers", {
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
        alert(`Successfully added ${emailAddress.value} as a subscriber`);
        getSubscribers();

    } catch (error) {
        console.error(error);
        return null
    }
});
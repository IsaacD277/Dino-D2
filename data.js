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
    const statusSpan = document.getElementById("sendNewsletterStatus");
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
            if (sub.active) {
                foundActive = true;
                const opt = document.createElement("option");
                opt.value = sub.emailAddress;
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
    const recipient = userDropdown.value;
    const newsletterId = newsletterDropdown.value;
    statusSpan.textContent = "";
    if (!recipient || !newsletterId) {
        statusSpan.textContent = "Please select both a user and a newsletter.";
        return;
    }
    try {
        const response = await fetch("https://beacon.isaacd2.com/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify({
                recipient: recipient,
                newsletter: newsletterId,
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
  const list = document.getElementById("subscribersList");
  list.innerHTML = ""; // clear old content

  if (subscribers.length === 0) {
    list.innerHTML = "<li>No subscribers yet.</li>";
    return;
  }

  subscribers.forEach(sub => {
    const li = document.createElement("li");
    // Adjust field names to whatever your API returns
    li.textContent = `${sub.firstName} | ${sub.emailAddress} (joined: ${sub.subscriptionDate || "unknown"}) ${sub.active ? "Still Active" : "No longer active"}`;

    const button = document.createElement("button");
    button.textContent = sub.active ? "Unsubscribe" : "Resubscribe";
    button.style.marginLeft = "10px";

    button.addEventListener("click", async () => {
        if (sub.active) {
            try {
                const response = await fetch("https://beacon.isaacd2.com/unsubscribe", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token
                    },
                    body: JSON.stringify({
                        emailAddress: sub.emailAddress
                    })
                });

                if (response.ok) {
                    alert(`${sub.emailAddress} unsubscribed successfully`);
                    li.textContent = `${sub.firstName} | ${sub.emailAddress} (joined: ${sub.subscriptionDate || "unknown"}) No longer active`;
                } else {
                    const error = await response.text();
                    alert("Failed to unsubscribe: " + error);
                }
            } catch (err) {
                console.error(err);
                alert("Something went wrong.");
            }
        } else {
            try {
                const response = await fetch("https://beacon.isaacd2.com/subscribe", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token
                    },
                    body: JSON.stringify({
                        emailAddress: sub.emailAddress
                    })
                });

                if (response.ok) {
                    alert(`${sub.emailAddress} resubscribed successfully`);
                    li.textContent = `${sub.firstName} | ${sub.emailAddress} (joined: ${sub.subscriptionDate || "unknown"}) Now active`;
                    button.textContent = "Unsubscribe";
                    li.appendChild(button);
                } else {
                    const error = await response.text();
                    alert("Failed to resubscribe: " + error);
                }
            } catch (err) {
                console.error(err);
                alert("Something went wrong.");
            }
        }
        
        
    });

    li.appendChild(button);

    const sendButton = document.createElement("button");
    sendButton.textContent = "Send Test Email";
    sendButton.style.marginLeft = "10px";

    sendButton.addEventListener("click", async () => {
        if (sub.active) {
            try {
                const response = await fetch("https://beacon.isaacd2.com/email", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token
                    },
                    body: JSON.stringify({
                        recipient: sub.emailAddress,
                        newsletter: "5d43041b-e3dd-4b2c-b4ec-5f376651bb2d",
                    })
                });

                if (response.ok) {
                    alert(`Email sent to ${sub.emailAddress} successfully`);
                    li.textContent = `${sub.firstName} | ${sub.emailAddress} (joined: ${sub.subscriptionDate || "unknown"}) No longer active`;
                } else {
                    const error = await response.text();
                    alert("Failed to send email: " + error);
                }
            } catch (err) {
                console.error(err);
                alert("Something went wrong.");
            }
        } else {
            alert("Cannot send email to inactive subscriber.");
        }
    });

    li.appendChild(sendButton);

    list.appendChild(li);
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
        console.error("Error fetching subscribers:", error);
        return null;
    }
}

function renderNewsletters(newsletters) {
    const list = document.getElementById("newslettersList");
    list.innerHTML = ""; // clear old content
    
    if (newsletters.length === 0) {
        list.innerHTML = "<li>No newsletters yet.</li>";
        return;
    }

    newsletters.forEach(newsletter => {

        const button = document.createElement("button");
        button.textContent = "Edit";
        button.style.marginLeft = "10px";

        const li = document.createElement("li");
        li.textContent = `Sent : ${newsletter.sendDate} : Stage: ${newsletter.stage} : ${newsletter.subject} -> ${newsletter.preview}`;
        
        button.addEventListener("click", () => {
            console.log(newsletter)
            console.log("Editing newsletter:", newsletter.newsletterId);
            window.location.href = `newsletter.html?newsletterId=${newsletter.newsletterId}`;
        });

        li.appendChild(button);
               
        list.appendChild(li);
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
        const newsletterId = data.newsletterId;
        
        window.location.href = `newsletter.html?newsletterId=${newsletterId}`;

    } catch (error) {
        console.error(error);
        return null
    }
});
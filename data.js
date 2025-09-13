const token = localStorage.getItem("id_token");

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        return null
    }

    getSubscribers();
    getCampaigns();
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

    list.appendChild(li);
  });
}

async function getCampaigns() {
    try {
        const response = await fetch("https://beacon.isaacd2.com/campaigns", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const campaigns = await response.json();
        console.log(campaigns)
        renderCampaigns(campaigns)
    } catch (error) {
        console.error("Error fetching subscribers:", error);
        return null;
    }
}

function renderCampaigns(campaigns) {
    const list = document.getElementById("campaignsList");
    list.innerHTML = ""; // clear old content
    
    if (campaigns.length === 0) {
        list.innerHTML = "<li>No subscribers yet.</li>";
        return;
    }

    campaigns.forEach(campaign => {
        const li = document.createElement("li");
        li.textContent = `Sent : ${campaign.sendDate} : ${campaign.subject} -> ${campaign.preview}`;
        list.appendChild(li);
    });
}

document.getElementById("getToken").addEventListener("click", async () => {
    try {
            const response = await fetch("https://beacon.isaacd2.com/userUnsubscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                    body: JSON.stringify({
                        testing: "supposed to be the tenantId",
                        emailAddress: "idarr@gmail.com",
                        newsletterId: "the newsletter ID"
                    })
            });

            const specialToken = await response.text();
            console.log(specialToken); // See what the server actually returned
        } catch (error) {
            console.error(error);
            return null;
        }
});

document.getElementById("unsubber").addEventListener("click", async () => {
    const token = "qwerty"
    try {
            const response = await fetch(`https://beacon.isaacd2.com/unsubscribe?token=${token}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const specialToken = await response.json();
            console.log(specialToken);
        } catch (error) {
            console.error(error);
            return null;
        }
});
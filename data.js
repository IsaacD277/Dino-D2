const token = localStorage.getItem("id_token");

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        return null
    }

    getSubscribers();
    getNewsletters();
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
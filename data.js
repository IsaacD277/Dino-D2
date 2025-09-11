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
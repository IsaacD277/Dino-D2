// Get newsletterId from URL
let pendingContent = null;

function getSubscriberId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('subscriberId');
}

const token = localStorage.getItem("id_token");
const subscriberId = getSubscriberId();
const form = document.getElementById('subscriberForm');
const stageDiv = document.getElementById('stage');

// Load subscriber data if editing
if (subscriberId) {
    fetch(`https://beacon.isaacd2.com/subscribers/${encodeURIComponent(subscriberId)}`, {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        Authorization: token
        }
    })
  .then(res => {
    if (!res.ok) throw new Error("Failed to load subscriber");
    return res.json();
  })
  .then(data => {
    document.getElementById('firstName').value = data.firstName || "";
    document.getElementById('emailAddress').value = data.emailAddress || "";
    document.getElementById('conditionDropdown').value = data.condition || "subscribed";
    document.getElementById('pageTitle').textContent = "Edit Subscriber";
  })
  .catch(err => {
    stageDiv.textContent = "Could not load subscriber: " + err.message;
  });
}

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        return null
    }
});

// Save subscriber (update)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  stageDiv.textContent = "";
  const condition = document.getElementById('conditionDropdown').value;
    console.log("Condition:", condition);
  const payload = {
    emailAddress: document.getElementById('emailAddress').value || "",
    firstName: document.getElementById('firstName').value || "",
    condition: condition || "Subscribed"
  };

  try {
    if (condition === 'Deleted') {

        const response = await fetch(`https://beacon.isaacd2.com/subscribers/${encodeURIComponent(subscriberId)}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            }
        });
        if (!response.ok) throw new Error("Failed to delete subscriber");
        stageDiv.textContent = "✅ Subscriber deleted!";
    } else {
        const response = await fetch(
            `https://beacon.isaacd2.com/subscribers/${encodeURIComponent(subscriberId)}`,
            {
            method: "PATCH",
            headers: {
            "Content-Type": "application/json",
            Authorization: token
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Failed to save subscriber");
        stageDiv.textContent = "✅ Subscriber saved!";
    }
  } catch (err) {
    stageDiv.textContent = "❌ " + err.message;
  }
});

document.getElementById('backBtn').onclick = () => {
  window.location.href = "index.html";
};
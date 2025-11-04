let pendingContent = null;

const token = localStorage.getItem("id_token");
const form = document.getElementById('profileForm');
const stageDiv = document.getElementById('stage');

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        window.location.href = "";
        return;
    }

    initAPIMode();

    const options = {
        timeZone: "America/New_York",
        year: "numeric",
        month: "short",
        day: "numeric"
    };

    // Load profile data
    const version = getAPIMode();
    fetch(`https://api.dinod2.com/${version}/profile`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: token
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
    })
    .then(data => {
        // Editable fields
        document.getElementById('newsletterName').value = data.newsletterName || "";
        document.getElementById('businessAddress').value = data.businessAddress || "";
        document.getElementById('domain').value = data.domain || "";
        document.getElementById('owner').value = data.owner || "";
        document.getElementById('replyToEmail').value = data.replyToEmail || "";
        document.getElementById('senderName').value = data.senderName || "";
        document.getElementById('senderEmail').value = data.senderEmail || "";

        // Read-only fields
        document.getElementById('ownerEmail').value = data.ownerEmail || "";
        const joinedDate = data.createdAt ? new Date(data.createdAt) : null;
        document.getElementById('createdAt').value = joinedDate.toLocaleString("en-US", options) || "";
        document.getElementById('maxSubscribers').value = data.maxSubscribers || "";
        document.getElementById('plan').value = data.plan || "";
    })
    .catch(err => {
        stageDiv.textContent = "Could not load profile: " + err.message;
    });
});

// Save profile (update)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    stageDiv.textContent = "";
    
    const payload = {
        newsletterName: document.getElementById('newsletterName').value || "",
        businessAddress: document.getElementById('businessAddress').value || "",
        domain: document.getElementById('domain').value || "",
        owner: document.getElementById('owner').value || "",
        ownerEmail: document.getElementById('ownerEmail').value || "",
        replyToEmail: document.getElementById('replyToEmail').value || "",
        senderName: document.getElementById('senderName').value || "",
        senderEmail: document.getElementById('senderEmail').value || ""
    };

    try {
        const version = getAPIMode();
        const response = await fetch(`https://api.dinod2.com/${version}/profile`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error("Failed to save profile");
        
        stageDiv.textContent = "✅ Profile saved!";
    } catch (err) {
        stageDiv.textContent = "❌ " + err.message;
    }
});

document.getElementById('backBtn').onclick = () => {
    window.location.href = "index.html";
};

document.getElementById('getSubscribeToken').onclick = () => {
    getSubscriberLink();
}

async function getSubscriberLink() {
    const version = getAPIMode();
    try {
        const subRes = await fetch(`https://api.dinod2.com/${version}/getSubscriberLink`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            }
        });
        const link = subRes.ok ? await subRes.json() : null;
        if (link) {
            alert("Subscriber link: " + link.token);
        } else {
            alert("Failed to get subscriber link.");
        }

    } catch (e) {
        console.error("Error fetching subscriber link:", e);
    }
}

function initAPIMode() {
    const apiCheckbox = document.getElementById("apiSelector");
    const version = localStorage.getItem("version") || "v0"
    apiCheckbox.checked = (version === "development");
}

function setAPIMode() {
    const apiCheckbox = document.getElementById("apiSelector");
    const apiMode = apiCheckbox.checked ? 'development' : 'v0';
    localStorage.setItem("version", apiMode);
}

function getAPIMode() {
    const version = localStorage.getItem("version");
    return version;
}

const apiCheckbox = document.getElementById("apiSelector");
if (apiCheckbox) {
    apiCheckbox.addEventListener('change', setAPIMode);
    initAPIMode();
}
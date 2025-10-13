let pendingContent = null;

const token = localStorage.getItem("id_token");
const form = document.getElementById('profileForm');
const stageDiv = document.getElementById('stage');

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Load profile data
    fetch(`https://beacon.isaacd2.com/profile`, {
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
        document.getElementById('ownerEmail').value = data.ownerEmail || "";
        document.getElementById('replyToEmail').value = data.replyToEmail || "";
        document.getElementById('senderName').value = data.senderName || "";

        // Read-only fields
        document.getElementById('createdAt').value = data.createdAt || "";
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
        senderName: document.getElementById('senderName').value || ""
    };

    try {
        const response = await fetch(`https://beacon.isaacd2.com/profile`, {
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
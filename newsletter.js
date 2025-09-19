// Get newsletterId from URL
    function getNewsletterId() {
      const params = new URLSearchParams(window.location.search);
      return params.get('newsletterId');
    }

    const token = localStorage.getItem("id_token");
    const newsletterId = getNewsletterId();
    const form = document.getElementById('newsletterForm');
    const stageDiv = document.getElementById('stage');

    // Load newsletter data if editing
    if (newsletterId) {
        fetch(`https://beacon.isaacd2.com/newsletters/${encodeURIComponent(newsletterId)}`, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            Authorization: token
            }
        })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load newsletter");
        return res.json();
      })
      .then(data => {
        console.log(data)
        document.getElementById('subject').value = data.subject || "";
        document.getElementById('preview').value = data.preview || "";
        document.getElementById('content').value = data.content || "";
        document.getElementById('stageDropdown').value = data.stage || "Draft";
        document.getElementById('sendDate').value = data.sendDate || "";
        document.getElementById('pageTitle').textContent = "Edit Newsletter";
      })
      .catch(err => {
        stageDiv.textContent = "Could not load newsletter: " + err.message;
      });
    }

    // Save newsletter (update)
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      stageDiv.textContent = "";

      const payload = {
        subject: document.getElementById('subject').value || "",
        preview: document.getElementById('preview').value || "",
        content: document.getElementById('content').value || "",
        stage: document.getElementById('stageDropdown').value || "",
        sendDate: document.getElementById('sendDate').value || ""
      };

      try {
        const response = await fetch(
          `https://beacon.isaacd2.com/newsletters/${encodeURIComponent(newsletterId)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: token
            },
            body: JSON.stringify(payload)
          }
        );
        if (!response.ok) throw new Error("Failed to save newsletter");
        stageDiv.textContent = "✅ Newsletter saved!";
      } catch (err) {
        stageDiv.textContent = "❌ " + err.message;
      }
    });

    document.getElementById('backBtn').onclick = () => {
      window.location.href = "index.html";
    };
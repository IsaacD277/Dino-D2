// Get newsletterId from URL
<<<<<<< HEAD
    let trixInitialized = false;
    let pendingContent = null;

    addEventListener("trix-initialize", function(event) {
      trixInitialized = true;
      if (pendingContent !== null) {
        document.getElementById('content').value = pendingContent;
        document.getElementById('content').dispatchEvent(new Event('input', { bubbles: true }));
        pendingContent = null;
      }
      const { config } = Trix;
      // Add heading2
      config.blockAttributes.heading2 = {
        tagName: "h2",
        terminal: true,
        breakOnReturn: true,
        group: false
      };
    });
    
  function setTrixContentIfReady() {
    if (trixInitialized && pendingContent !== null) {
      const trixEditor = document.querySelector('trix-editor');
      if (trixEditor) {
        trixEditor.editor.loadHTML(pendingContent);
      }
      pendingContent = null;
    }
  }

=======
>>>>>>> 759795bb227cd6e427694abf33099990bcc2a7c2
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
<<<<<<< HEAD
        document.getElementById('subject').value = data.subject || "";
        document.getElementById('preview').value = data.preview || "";
        pendingContent = data.content || "";
          setTrixContentIfReady();
=======
        console.log(data)
        document.getElementById('subject').value = data.subject || "";
        document.getElementById('preview').value = data.preview || "";
        document.getElementById('content').value = data.content || "";
>>>>>>> 759795bb227cd6e427694abf33099990bcc2a7c2
        document.getElementById('stageDropdown').value = data.stage || "Draft";
        document.getElementById('sendDate').value = data.sendDate || "";
        document.getElementById('pageTitle').textContent = "Edit Newsletter";
      })
      .catch(err => {
        stageDiv.textContent = "Could not load newsletter: " + err.message;
      });
    }

<<<<<<< HEAD
    document.getElementById('viewOutput').addEventListener('click', function() {
      // Get the HTML content from the hidden input (Trix output)
      const trixHtml = document.getElementById('content').value;
      // Show in an alert (or replace with your own display logic)
      alert(trixHtml);
    });

=======
>>>>>>> 759795bb227cd6e427694abf33099990bcc2a7c2
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
<<<<<<< HEAD
    };

addEventListener("trix-initialize", function(event) {
  const { config } = Trix;

  // Add heading2
  config.blockAttributes.heading2 = {
    tagName: "h2",
    terminal: true,
    breakOnReturn: true,
    group: false
  };
});
=======
    };
>>>>>>> 759795bb227cd6e427694abf33099990bcc2a7c2

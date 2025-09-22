document.addEventListener("DOMContentLoaded", function() {
  const apiUrl = "https://beacon.isaacd2.com";

  // Tab Switching
  const tabs = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
      tab.addEventListener('click', () => {
          // Remove active class from all tabs and contents
          tabs.forEach(t => t.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));

          // Add active class to clicked tab and corresponding content
          tab.classList.add('active');
          const tabId = tab.dataset.tab;
          document.getElementById(tabId).classList.add('active');
      });
  });

  // Enable email form if logged in
  if (localStorage.getItem("id_token")) {
    document.getElementById("emailBtn").disabled = false;
  } else {
    document.getElementById("emailBtn").disabled = true;
  }

  // Populate newsletter dropdown for email form
  function populateEmailNewsletterDropdown(newsletters) {
    const select = document.getElementById("emailNewsletter");
    while (select.options.length > 1) select.remove(1);
    if (Array.isArray(newsletters)) {
      const names = Array.from(new Set(newsletters.map(c => c.newsletter).filter(Boolean)));
      for (const name of names) {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
      }
    }
  }

  // Populate recipient dropdown for email form
  function populateEmailRecipientDropdown(subscribers) {
    const select = document.getElementById("emailRecipient");
    while (select.options.length > 1) select.remove(1);
    if (Array.isArray(subscribers)) {
      const emails = Array.from(new Set(subscribers.map(s => s.emailAddress).filter(Boolean)));
      for (const email of emails) {
        const opt = document.createElement("option");
        opt.value = email;
        opt.textContent = email;
        select.appendChild(opt);
      }
    }
  }

  // Email form handler
  document.getElementById("emailForm").onsubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("id_token");
    const recipient = document.getElementById("emailRecipient").value;
    const newsletter = document.getElementById("emailNewsletter").value;
    let version = document.getElementById("emailVersion").value;
    version = version === 'a' ? 'a' : version === 'b' ? 'b' : '';

    document.getElementById("emailResult").textContent = "Submitting...";
    document.getElementById("emailResult").className = "result loading";
    try {
      const res = await fetch(apiUrl + "/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({
          recipient,
          newsletter,
          version
        })
      });
      let msg = '';
      try {
        const data = await res.json();
        if (data && typeof data === 'object') {
          if (data.message) {
            msg = data.message;
          } else if (data.error) {
            msg = data.error;
          } else {
            msg = 'Success.';
          }
        } else {
          msg = String(data);
        }
      } catch (e) {
        msg = await res.text();
      }
      document.getElementById("emailResult").textContent = msg;
      document.getElementById("emailResult").className = res.ok ? "result success" : "result error";
      document.getElementById("emailForm").reset();
    } catch (err) {
      document.getElementById("emailResult").textContent = "Error: " + err.message;
      document.getElementById("emailResult").className = "result error";
    }
  };

  // Step 1: Redirect to Cognito login
  // Step 1: Set login/logout button text and handler
  const loginBtn = document.getElementById("loginBtn");
  if (localStorage.getItem("id_token")) {
    loginBtn.textContent = "🚪 Log Out";
    loginBtn.onclick = () => {
      localStorage.removeItem("id_token");
      // Redirect to Cognito logout endpoint
      const logoutUrl = 'https://auth.isaacd2.com/logout?client_id=62mm4ei4r5os6muq4b4c5fue8m&logout_uri=https%3A%2F%2Fisaacd277.github.io%2FDino-D2%2F';
      window.location = logoutUrl;
    };
  } else {
    loginBtn.textContent = "✨ Login with Cognito";
    loginBtn.onclick = () => {
      const loginUrl = 'https://auth.isaacd2.com/login/continue?client_id=62mm4ei4r5os6muq4b4c5fue8m&response_type=token&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fisaacd277.github.io%2FDino-D2%2F';
      window.location = loginUrl;
    };
  }

  // Step 2: Parse token from URL hash after redirect
  function parseHash() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return {
      id_token: params.get("id_token"),
      access_token: params.get("access_token"),
      expires_in: params.get("expires_in"),
      token_type: params.get("token_type")
    };
  }

  // Parse tokens from URL hash
  const tokens = parseHash();

  // If just logged in, store token and update UI
  if (tokens.id_token) {
    localStorage.setItem("id_token", tokens.id_token);
    // Optionally, show a non-destructive login success message
    const msg = document.createElement('div');
    msg.className = 'success';
    msg.textContent = 'Logged in successfully.';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
    // Update login/logout button state after login
    loginBtn.textContent = "🚪 Log Out";
    loginBtn.onclick = () => {
      localStorage.removeItem("id_token");
      const logoutUrl = 'https://auth.isaacd2.com/logout?client_id=62mm4ei4r5os6muq4b4c5fue8m&logout_uri=https%3A%2F%2Fisaacd277.github.io%2FDino-D2%2F';
      window.location = logoutUrl;
    };
  }

  // Enable subscribe/refresh if token is present
  if (localStorage.getItem("id_token")) {
    document.getElementById("subscribeBtn").disabled = false;
    document.getElementById("refreshBtn").style.display = "inline-block";
    callApi(); // Call API on page load
  }

  // Render subscribers as a modern table
  function renderSubscribers(data) {
    populateEmailRecipientDropdown(data);
    const tbody = document.querySelector('#subscribersTable tbody');
    const output = document.getElementById('output');
    if (!Array.isArray(data)) {
      tbody.innerHTML = '<tr><td colspan="5" class="error">No subscriber data available.</td></tr>';
      if (output) output.innerHTML = "";
      return;
    }
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="loading">No subscribers found.</td></tr>';
      if (output) output.innerHTML = "";
      return;
    }
    tbody.innerHTML = data.map(sub => `
      <tr>
        <td>${sub.firstName || "—"}</td>
        <td>${sub.emailAddress || "—"}</td>
        <td>${sub.subscriptionDate ? new Date(sub.subscriptionDate).toLocaleDateString() : "—"}</td>
        <td><span class="status-badge active">Active</span></td>
        <td>
          <button class="btn btn-small" onclick="editSubscriber('${sub.emailAddress}')">Edit</button>
          <button class="btn btn-small btn-danger" onclick="deleteSubscriber('${sub.emailAddress}')">Delete</button>
        </td>
      </tr>
    `).join('');
    if (output) output.innerHTML = "";
  }

  // Update dashboard metrics
  function updateMetrics(subscribersData) {
    if (Array.isArray(subscribersData)) {
      // Update total subscribers count
      const totalSubscribers = subscribersData.length;
      document.querySelector('.metrics-grid .metric-card:nth-child(1) .metric-value').textContent = totalSubscribers;

      // Calculate month-over-month growth
      const now = new Date();
      const thisMonth = subscribersData.filter(sub => {
        const subDate = new Date(sub.subscriptionDate);
        return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear();
      }).length;

      const lastMonth = subscribersData.filter(sub => {
        const subDate = new Date(sub.subscriptionDate);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
        return subDate.getMonth() === lastMonthDate.getMonth() && subDate.getFullYear() === lastMonthDate.getFullYear();
      }).length;

      const growthPercent = lastMonth ? Math.round((thisMonth - lastMonth) / lastMonth * 100) : 0;
      const growthTrend = document.querySelector('.metrics-grid .metric-card:nth-child(1) .metric-trend');
      growthTrend.textContent = `${growthPercent >= 0 ? '↑' : '↓'} ${Math.abs(growthPercent)}% this month`;
      growthTrend.style.color = growthPercent >= 0 ? '#16a34a' : '#dc2626';
    }
  }

  // Function to call the /subscribers API
  async function callApi() {
    const token = localStorage.getItem("id_token");
    if (!token) return;
    document.getElementById("output").innerHTML = '<div class="loading">Loading subscribers...</div>';
    try {
      const res = await fetch(apiUrl + "/subscribers", {
        method: "GET",
        headers: { Authorization: token }
      });
      const data = await res.json();
      renderSubscribers(data);
      updateMetrics(data);
    } catch (err) {
      document.getElementById("output").innerHTML = `<div class="error">Error: ${err.message}</div>`;
    }
  }

  // Refresh button handler
  document.getElementById("refreshBtn").onclick = callApi;

  // Subscribe form handler
  document.getElementById("subscribeForm").onsubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("id_token");
    const name = document.getElementById("firstName").value;
    const email = document.getElementById("emailAddress").value;
    document.getElementById("subscribeResult").textContent = "Submitting...";
    document.getElementById("subscribeResult").className = "result loading";
    try {
      const res = await fetch(apiUrl + "/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({
          emailAddress: email,
          firstName: name
        })
      });
      let msg = '';
      try {
        const data = await res.json();
        if (data && typeof data === 'object') {
          if (data.message) {
            msg = data.message;
          } else if (data.error) {
            msg = data.error;
          } else {
            msg = 'Success.';
          }
        } else {
          msg = String(data);
        }
      } catch (e) {
        msg = await res.text();
      }
      document.getElementById("subscribeResult").textContent = msg;
      document.getElementById("subscribeResult").className = res.ok ? "result success" : "result error";
      document.getElementById("subscribeForm").reset();
      callApi();
    } catch (err) {
      document.getElementById("subscribeResult").textContent = "Error: " + err.message;
      document.getElementById("subscribeResult").className = "result error";
    }
  };

  // Enable newsletter form if logged in
  if (localStorage.getItem("id_token")) {
    document.getElementById("newsletterBtn").disabled = false;
    fetchNewsletters();
  }

  // Render Newsletter Cards
  function renderNewsletterCards(newsletters) {
    const container = document.getElementById('newslettersCardList');
    container.className = 'newsletter-card-list';
    container.innerHTML = '';
    // Sort newsletters so the most recent is last (reverse of previous)
    const sortedNewsletters = [...newsletters].sort((a, b) => {
      const aDate = a.sendDate ? new Date(a.sendDate) : new Date(0);
      const bDate = b.sendDate ? new Date(b.sendDate) : new Date(0);
      return bDate - aDate; // descending order
    });
    sortedNewsletters.forEach(newsletter => {
      const card = document.createElement('div');
      card.className = 'newsletter-card';
      // Use helper functions to get status class and text
      const statusClass = getStatusClass(newsletter);
      const statusText = getStatusText(newsletter);
      card.innerHTML = `
        <div class="newsletter-avatar"></div>
        <div class="newsletter-details">
          <div class="newsletter-subject">${newsletter.subject}</div>
          <div class="newsletter-preview">${newsletter.preview}</div>
          <span class="newsletter-status ${statusClass}">
            ${statusText}
          </span>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Render newsletters as cards
  function renderNewsletters(data) {
    populateEmailNewsletterDropdown(data);
    renderNewsletterCards(data);
  }

  // Fetch newsletters from API
  async function fetchNewsletters() {
    const token = localStorage.getItem("id_token");
    if (!token) return;
    document.getElementById("newslettersOutput").innerHTML = '<div class="loading">Loading newsletters...</div>';
    try {
      const res = await fetch(apiUrl + "/newsletters", {
        method: "GET",
        headers: { Authorization: token }
      });
      const data = await res.json();
      renderNewsletters(data);
    } catch (err) {
      document.getElementById("newslettersOutput").innerHTML = `<div class="error">Error: ${err.message}</div>`;
    }
  }

  // Newsletter form handler
  // Helper functions for newsletter status
  function getStatusClass(newsletter) {
    const now = new Date();
    const sendDate = newsletter.sendDate ? new Date(newsletter.sendDate) : null;
    
    if (!sendDate) return 'draft';
    if (sendDate < now) return 'sent';
    if (sendDate > now) return 'ready';
    return 'active';
  }

  function getStatusText(newsletter) {
    const now = new Date();
    const sendDate = newsletter.sendDate ? new Date(newsletter.sendDate) : null;
    
    if (!sendDate) return 'Draft';
    if (sendDate < now) return 'Sent';
    if (sendDate > now) return 'Ready';
    return 'Active';
  }

  // Global handlers for table actions
  window.editSubscriber = (email) => {
    // TODO: Implement subscriber editing
    console.log('Edit subscriber:', email);
  };

  window.deleteSubscriber = async (email) => {
    if (!confirm(`Are you sure you want to delete subscriber ${email}?`)) return;
    
    const token = localStorage.getItem("id_token");
    try {
      const res = await fetch(`${apiUrl}/subscribers/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: { Authorization: token }
      });
      if (res.ok) {
        callApi(); // Refresh the list
      } else {
        alert('Failed to delete subscriber');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  window.editNewsletter = (newsletterName) => {
    // TODO: Implement newsletter editing
    console.log('Edit newsletter:', newsletterName);
  };

  window.deleteNewsletter = async (newsletterName) => {
    if (!confirm(`Are you sure you want to delete newsletter ${newsletterName}?`)) return;
    
    const token = localStorage.getItem("id_token");
    try {
      const res = await fetch(`${apiUrl}/newsletters/${encodeURIComponent(newsletterName)}`, {
        method: "DELETE",
        headers: { Authorization: token }
      });
      if (res.ok) {
        fetchNewsletters(); // Refresh the list
      } else {
        alert('Failed to delete newsletter');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  document.getElementById("newsletterForm").onsubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("id_token");
    const newsletter = document.getElementById("newsletterName").value;
    const version = document.getElementById("newsletterVersion").value;
    const subject = document.getElementById("newsletterSubject").value;
    const preview = document.getElementById("newsletterPreview").value;
    const sendDate = document.getElementById("newsletterSendDate").value;
    document.getElementById("newsletterResult").textContent = "Submitting...";
    document.getElementById("newsletterResult").className = "result loading";
    try {
      const res = await fetch(apiUrl + "/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({
          newsletter,
          version,
          sendDate,
          subject,
          preview
        })
      });
      let msg = '';
      try {
        const data = await res.json();
        if (data && typeof data === 'object') {
          if (data.message) {
            msg = data.message;
          } else if (data.error) {
            msg = data.error;
          } else {
            msg = 'Success.';
          }
        } else {
          msg = String(data);
        }
      } catch (e) {
        msg = await res.text();
      }
      document.getElementById("newsletterResult").textContent = msg;
      document.getElementById("newsletterResult").className = res.ok ? "result success" : "result error";
      document.getElementById("newsletterForm").reset();
      fetchNewsletters();
    } catch (err) {
      document.getElementById("newsletterResult").textContent = "Error: " + err.message;
      document.getElementById("newsletterResult").className = "result error";
    }
  };
});

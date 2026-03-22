/**
 * USER DASHBOARD SCRIPT
 *
 * This script handles:
 * - Loading user data from localStorage
 * - Displaying user information
 * - Logout functionality
 * - Navigation between dashboard sections
 */

// Check if user is authenticated
function checkAuth() {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  if (!token || userType !== "user") {
    // Redirect to login if not authenticated
    window.location.href = "../index.html";
    return false;
  }
  return true;
}

// Load and display user information
function loadUserInfo() {
  const fullName = localStorage.getItem("userFullName") || "User";
  const email = localStorage.getItem("userEmail") || "user@example.com";
  const userId = localStorage.getItem("userId") || "N/A";

  // Update dashboard header with user name
  const userNameElements = document.querySelectorAll("[data-user-name]");
  userNameElements.forEach((el) => {
    el.textContent = fullName;
  });

  const userEmailElements = document.querySelectorAll("[data-user-email]");
  userEmailElements.forEach((el) => {
    el.textContent = email;
  });

  console.log(`✅ User dashboard loaded for: ${fullName}`);
}

// Handle logout
function logout() {
  // Clear all localStorage data
  localStorage.removeItem("token");
  localStorage.removeItem("userType");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userFullName");

  console.log("🚪 Logged out successfully");

  // Redirect to home/login page
  window.location.href = "../index.html";
}

// Set up logout button
function setupLogoutButton() {
  const logoutBtns = document.querySelectorAll("[data-logout-btn]");
  if (logoutBtns.length > 0) {
    logoutBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent dropdown from closing immediately

        // Close any open profile dropdowns
        document
          .querySelectorAll(
            ".profile-dropdown.open, .mobile-profile-dropdown.open",
          )
          .forEach((dropdown) => {
            dropdown.classList.remove("open");
          });

        if (confirm("Are you sure you want to logout?")) {
          logout();
        }
      });
    });
  }
}

// Initialize dashboard on page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔄 Initializing dashboard...");

  if (checkAuth()) {
    console.log("✅ Authentication successful");
    loadUserInfo();
    setupLogoutButton();
  } else {
    console.log("❌ Authentication failed, redirecting to login...");
  }
});

// AI diagnosis: collect form inputs, call backend, render results
async function startAI() {
  const analyzeBtn = document.getElementById("analyzeBtn");
  if (analyzeBtn) analyzeBtn.disabled = true;

  const symptoms = document.getElementById("symptoms").value || "";
  const durationDays =
    Number(document.getElementById("durationInput").value) || 0;
  const existing = document.getElementById("existingConditions").value || "";

  // UI feedback
  document.getElementById("processing").style.display = "block";
  document.getElementById("ai").style.display = "none";

  try {
    const token = localStorage.getItem("token");
    const payload = {
      symptoms,
      durationDays,
      existingConditions: existing
        ? existing.split(/,|;/).map((s) => s.trim())
        : [],
    };

    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;

    // Try to use absolute URL to backend
    const apiUrl = "http://localhost:5000/api/diagnosis/run";
    console.log("📤 Sending diagnosis request to:", apiUrl);
    console.log("   Payload:", payload);

    const resp = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      credentials: "include",
    });

    console.log("📥 Response status:", resp.status, resp.statusText);

    const text = await resp.text();
    if (!text) {
      throw new Error(`Empty response from server (status ${resp.status})`);
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error("Invalid JSON response: " + text);
    }

    renderDiagnosis(data);
  } catch (err) {
    alert("Error running diagnosis: " + (err.message || err));
    console.error("Diagnosis Error:", err);
  } finally {
    if (analyzeBtn) analyzeBtn.disabled = false;
    document.getElementById("processing").style.display = "none";
  }
}

function renderDiagnosis(data) {
  if (!data || !data.timestamp) {
    alert(
      "Diagnosis failed: " + (data && data.message ? data.message : "unknown"),
    );
    return;
  }

  const resultsList = document.getElementById("resultsList");
  const reasoningList = document.getElementById("reasoningList");
  const riskBadge = document.getElementById("riskLevelBadge");
  const recommendationText = document.getElementById("recommendationText");

  if (!resultsList || !riskBadge) {
    console.error("❌ Missing result display elements");
    return;
  }

  // Clear previous results
  resultsList.innerHTML = "";
  if (reasoningList) reasoningList.innerHTML = "";

  // Display top possible conditions with confidence scores
  (data.topPossibleConditions || []).forEach((condition) => {
    const li = document.createElement("li");
    const conditionName = condition.condition || "Unknown";
    const confidence = condition.confidenceScore || 0;
    li.innerHTML = `<strong>${conditionName}</strong> (${confidence}% confidence)`;
    li.setAttribute(
      "data-reasoning",
      condition.reasoning || "No reasoning provided",
    );
    li.style.cursor = "pointer";
    li.style.padding = "8px";
    li.style.borderRadius = "4px";
    li.style.transition = "background-color 0.2s";
    li.addEventListener("mouseenter", (e) => {
      e.target.style.backgroundColor = "#e8f4f8";
    });
    li.addEventListener("mouseleave", (e) => {
      e.target.style.backgroundColor = "";
    });
    li.addEventListener("click", () => {
      const reasoning = li.getAttribute("data-reasoning");
      alert(`${conditionName}\n\nReasoning:\n${reasoning}`);
    });
    resultsList.appendChild(li);
  });

  // Display reasoning for each condition
  (data.topPossibleConditions || []).forEach((condition) => {
    if (reasoningList) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${condition.condition}:</strong> ${condition.reasoning}`;
      reasoningList.appendChild(li);
    }
  });

  // Set risk level with color coding
  riskBadge.textContent = data.riskLevel || "Low";
  riskBadge.className =
    "badge " + (data.riskLevel || "Low").toLowerCase().replace(" ", "-");

  // Set color based on risk level
  const riskColors = {
    low: "#28a745",
    moderate: "#ffc107",
    high: "#fd7e14",
    emergency: "#dc3545",
  };
  riskBadge.style.backgroundColor =
    riskColors[riskBadge.textContent.toLowerCase()] || "#6c757d";
  riskBadge.style.color = "white";
  riskBadge.style.padding = "6px 12px";
  riskBadge.style.borderRadius = "4px";

  // Set recommendation text (includes doctor visit advice)
  if (recommendationText) {
    recommendationText.textContent =
      data.recommendation ||
      "Visit your doctor if issue persists for more than 2 days.";
  }

  // Display the result section
  const diagnosisResults = document.getElementById("diagnosisResults");
  if (diagnosisResults) diagnosisResults.style.display = "block";

  const aiSection = document.getElementById("ai");
  if (aiSection) aiSection.style.display = "block";

  console.log("✅ Diagnosis results rendered successfully");
}

// Wire analyze button
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("analyzeBtn");
  if (btn)
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      startAI();
    });
});

async function loadHistory() {
  const token = localStorage.getItem("token");
  if (!token) {
    return;
  }
  try {
    const apiUrl = "http://localhost:5000/api/diagnosis/records";
    console.log("📤 Fetching diagnosis history from:", apiUrl);

    const resp = await fetch(apiUrl, {
      headers: { Authorization: "Bearer " + token },
      credentials: "include",
    });

    console.log("📥 History response status:", resp.status);

    const text = await resp.text();
    if (!text) return;
    const data = JSON.parse(text);
    if (!data.success) return;

    const container = document.getElementById("historyList");
    if (!container) {
      console.error("❌ historyList container not found");
      return;
    }

    container.innerHTML = "";

    if (!data.records || data.records.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: #94a3b8; padding: 20px 0;">No previous assessments yet.</p>';
      return;
    }

    // Display each assessment as an expandable card with AI card styling
    data.records.forEach((record, index) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      cardDiv.style.cssText =
        "margin-bottom: 12px; cursor: pointer; transition: all 0.2s;  color: white; border: 1px solid #1a2434;";

      const timestamp = new Date(record.timestamp).toLocaleString();
      const symptoms = (record.symptoms || []).join(", ") || "No symptoms";
      const riskLevel = record.riskLevel || "Low";

      // Card header (always visible)
      const headerDiv = document.createElement("div");
      headerDiv.style.cssText =
        "display: flex; justify-content: space-between; align-items: center; padding: 12px 0;";

      const riskBgColor =
        {
          Low: "#28a745",
          Moderate: "#ffc107",
          High: "#fd7e14",
          Emergency: "#dc3545",
        }[riskLevel] || "#6c757d";

      headerDiv.innerHTML = `
        <div>
          <strong style="color: white;">${timestamp}</strong><br/>
          <small style="color: rgba(255, 255, 255, 0.8);">Symptoms: ${symptoms}</small>
        </div>
        <div style="text-align: right;">
          <span style="background: ${riskBgColor}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 13px;">
            ${riskLevel}
          </span>
        </div>
      `;

      // Expandable details (hidden by default)
      const detailsDiv = document.createElement("div");
      detailsDiv.className = "assessment-details";
      detailsDiv.style.cssText =
        "display: none; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.2); margin-top: 12px; color: white;";

      // Top conditions
      const conditionsHtml = (record.topPossibleConditions || [])
        .map(
          (c) =>
            `<li><strong style="color: white;">${c.condition}</strong> (${c.confidenceScore}%)<br/><small style="color: rgba(255, 255, 255, 0.8);">${c.reasoning}</small></li>`,
        )
        .join("");
      detailsDiv.innerHTML = `
        <div style="margin-bottom: 10px;">
          <strong style="color: white;">Possible Conditions:</strong>
          <ul style="margin: 8px 0; padding-left: 20px; color: rgba(255, 255, 255, 0.95);">${conditionsHtml}</ul>
        </div>
        <div style="margin-bottom: 10px;">
          <strong style="color: white;">Recommendation:</strong>
          <p style="margin: 4px 0; color: rgba(255, 255, 255, 0.95); line-height: 1.4;">${record.recommendation}</p>
        </div>
        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
          <em>${record.disclaimer}</em>
        </div>
      `;

      // Toggle details on click
      headerDiv.addEventListener("click", () => {
        const isVisible = detailsDiv.style.display !== "none";
        detailsDiv.style.display = isVisible ? "none" : "block";
      });

      cardDiv.addEventListener("mouseenter", () => {
        cardDiv.style.transform = "translateY(-2px)";
        cardDiv.style.boxShadow = "0 8px 16px rgba(102, 126, 234, 0.3)";
      });

      cardDiv.addEventListener("mouseleave", () => {
        cardDiv.style.transform = "translateY(0)";
        cardDiv.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
      });

      cardDiv.appendChild(headerDiv);
      cardDiv.appendChild(detailsDiv);
      container.appendChild(cardDiv);
    });

    console.log(`✅ Loaded ${data.records.length} past assessments`);
  } catch (err) {
    console.error("History Error:", err);
  }
}

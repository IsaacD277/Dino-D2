// === CONFIG ===
const isLocal = window.location.hostname === "localhost";
const clientId = "62mm4ei4r5os6muq4b4c5fue8m";
const domain = "https://auth.isaacd2.com";
const redirectUri = isLocal ? "http://localhost:5500" : "https://isaacd277.github.io/Dino-D2/"; // must match Cognito app settings
const logoutUri = isLocal ? "http://localhost:5500" : "https://isaacd277.github.io/Dino-D2/"; // must match Cognito app settings
const scope = "email+openid+phone"; // must match Cognito app settings // USE '+' for spaces
const responseType = "token"; // Implicit flow for static sites

// === PARSE TOKEN FROM URL AFTER LOGIN ===
function parseHash() {
    if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const idToken = params.get("id_token");
    const accessToken = params.get("access_token");
    if (idToken && accessToken) {
        localStorage.setItem("id_token", idToken);
        localStorage.setItem("access_token", accessToken);
        window.location.hash = ""; // clean URL
    }
    }
}

// === CHECK LOGIN STATUS ===
function isLoggedIn() {
    return !!localStorage.getItem("id_token");
}

function showStatus() {
    const loggedIn = isLoggedIn();

    document.getElementById("loggedOutView").style.display = loggedIn ? "none" : "block";
    document.getElementById("loggedInView").style.display = loggedIn ? "block" : "none";
}

// === LOGIN/LOGOUT ACTIONS ===
document.getElementById("loginBtn").onclick = () => {
    const loginUrl = `${domain}/login?client_id=${clientId}&response_type=${responseType}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = loginUrl;
};

document.getElementById("logoutBtn").onclick = () => {
    localStorage.clear();
    window.location.href = `${domain}/logout?client_id=${clientId}&response_type=${responseType}&scope=${scope}&logout_uri=${encodeURIComponent(redirectUri)}`;
};

// Run on page load
parseHash();
showStatus();
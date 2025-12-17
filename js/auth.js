// Conceptual: In a real app, this sends data to the server for validation
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Conceptual POST request to /api/login
    console.log(`Attempting login for: ${email}`);
    
    // On successful login (SIMULATED):
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', email);
    alert('Login Successful!');
    window.location.href = 'index.html';
});

// Logout functionality (in app.js)
document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    alert('Logged out successfully.');
    window.location.reload(); // Refresh the page to update the UI
});

// UI update on all pages (in app.js)
(function updateAuthUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginLink = document.querySelector('a[href="login.html"]');
    const logoutBtn = document.getElementById('logout-btn');

    if (isLoggedIn) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
})();
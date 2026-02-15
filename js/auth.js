
// // --- 1. SMART CONFIGURATION (Local + Live Ready) ---
// const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// // Agar local hai toh localhost, nahi toh aapka Render wala live backend link
// const BASE_URL = isLocal 
//     ? "http://localhost:3000" 
//     : "https://your-backend-service.onrender.com"; 

const API_URL = `${BASE_URL}/api/user`;
const GOOGLE_CLIENT_ID = "1074517545758-4ijdnhe0tkbjoervpd1810q2hkva3pkp.apps.googleusercontent.com";

// --- 2. LUXURY ALERTS CONFIG ---
const RJ_Alert = (title, text, icon) => {
    return Swal.fire({
        title: title.toUpperCase(),
        text: text,
        icon: icon,
        background: '#FFFFFF',
        color: '#5D4037',
        confirmButtonColor: '#8D6E63',
        iconColor: '#A1887F',
        customClass: { popup: 'luxury-border', title: 'luxury-font' },
        showConfirmButton: icon !== 'success',
        timer: icon === 'success' ? 2000 : null,
        timerProgressBar: icon === 'success'
    });
};

// --- 3. REDIRECT LOGIC ---
function completeAuthAndRedirect(data) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(data.user));
    localStorage.setItem('userEmail', data.user.email);

    const redirectTo = localStorage.getItem('redirectTo');
    if (redirectTo) {
        localStorage.removeItem('redirectTo');
        window.location.href = redirectTo;
    } else {
        window.location.href = 'index.html';
    }
}

async function handleGoogleSignIn(response) {
    try {
        const res = await fetch(`${API_URL}/google-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
        });
        
        const data = await res.json();
        if (data.success) {
            RJ_Alert('Welcome', `Hello ${data.user.name}, Login Successful!`, 'success')
            .then(() => completeAuthAndRedirect(data));
        } else {
            RJ_Alert('Failed', data.message || 'Google authentication failed.', 'error');
        }
    } catch (err) {
        console.error("Google Login Error:", err);
        RJ_Alert('Server Error', 'Could not connect to the backend.', 'warning');
    }
}

// Global scope mein expose karna zaroori hai HTML callback ke liye
window.handleGoogleSignIn = handleGoogleSignIn;

// --- 5. NAVBAR UPDATE ---
function updateNavbar() {
    const authBtnContainer = document.getElementById('authBtnContainer');
    if (!authBtnContainer) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (isLoggedIn === 'true' && userData) {
        authBtnContainer.innerHTML = `
            <div class="user-wrapper" style="position: relative; display: inline-block; padding: 5px 10px;">
                <a class="nav-link logout-link" href="#" onclick="handleLogout(event)" 
                   style="color: #8D6E63 !important; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 5px;">
                    <i class="bi bi-person-check"></i> LOGOUT
                </a>
                <span class="hover-name-tooltip">${userData.name}</span>
            </div>
            <style>
                .hover-name-tooltip {
                    position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
                    background: #5D4037; color: #FFFFFF; padding: 4px 12px; border-radius: 4px;
                    font-size: 11px; font-weight: 500; white-space: nowrap; opacity: 0;
                    visibility: hidden; transition: all 0.3s ease; z-index: 9999;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2); text-transform: capitalize;
                }
                .hover-name-tooltip::after {
                    content: ""; position: absolute; bottom: 100%; left: 50%; margin-left: -5px;
                    border-width: 5px; border-style: solid; border-color: transparent transparent #5D4037 transparent;
                }
                .user-wrapper:hover .hover-name-tooltip { opacity: 1; visibility: visible; top: 110%; }
                .logout-link:hover { color: #5D4037 !important; }
            </style>
        `;
    } else {
        authBtnContainer.innerHTML = `
            <a class="nav-link" href="login.html" style="color: #8D6E63; font-weight: 600; text-decoration: none;">
                <i class="bi bi-person-circle"></i> LOGIN
            </a>`;
    }
}

// --- 6. LOGIN & REGISTER HANDLER ---
document.addEventListener('submit', async function(e) {
    const formId = e.target.id;
    if (formId === 'loginForm' || formId === 'registerForm') {
        e.preventDefault();
        const isLogin = formId === 'loginForm';
        
        const payload = isLogin ? {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value


        } : {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            phone: document.getElementById('regPhone').value,
            password: document.getElementById('regPassword').value
        };


        // 2. Validation (Sirf Registration ke liye)
        if (!isLogin) {
            // Fake Number rokne ka logic (India: 10 digits, starts with 6-9)
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(payload.phone)) {
                return RJ_Alert('Invalid Number', 'Please enter a valid 10-digit mobile number.!', 'error');
            }

            // Email format check
            if (!payload.email.includes('@')) {
                return RJ_Alert('Invalid Email', 'Invalid email! Please enter a valid one.', 'error');
            }

            if (payload.password.length < 6) {
                return RJ_Alert('Weak Password', 'Password must be at least 6 characters long.', 'error');
            }
        }


        try {
            const response = await fetch(`${API_URL}${isLogin ? '/login' : '/register'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                if (isLogin) {
                    RJ_Alert('Success', 'Redirecting...', 'success')
                    .then(() => completeAuthAndRedirect(data));
                } else {
                    RJ_Alert('Success', 'Registration successful! Please login.', 'success')
                    .then(() => {
                        if(typeof switchTab === 'function') switchTab('login');
                        else window.location.href = 'login.html';
                    });
                }
            } else {
                RJ_Alert('Error', data.message, 'error');
            }
        } catch (error) {
            RJ_Alert('Offline', 'Server error.', 'warning');
        }
    }
});

// --- 7. LOGOUT ---
window.handleLogout = function(event) {
    if(event) event.preventDefault();
    Swal.fire({
        title: 'CONFIRM LOGOUT',
        text: 'Are you sure?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#8D6E63',
        confirmButtonText: 'LOGOUT',
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.href = 'index.html';
        }
    });
}

// --- 8. CART PROTECTION ---
window.handleCartClick = function(event) {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        if(event) event.preventDefault();
        localStorage.setItem('redirectTo', 'cart.html'); 
        RJ_Alert('Member Access', 'Please login to view your cart.', 'info')
        .then(() => window.location.href = 'login.html');
    }
}




window.onload = function () {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: "1074517545758-4ijdnhe0tkbjoervpd1810q2hkva3pkp.apps.googleusercontent.com",
            callback: handleGoogleSignIn,
            ux_mode: 'redirect', // <--- YE LINE DAALNI HAI, Isse error khatam hoga
            login_uri: window.location.href // Taaki login ke baad wapas isi page pe aaye
        });

        const googleBtn = document.getElementById('googleCustomBtn');
        if (googleBtn) {
            googleBtn.onclick = () => {
                // Redirect mode mein ye prompt seedha Google ke login page pe le jayega
                google.accounts.id.prompt(); 
            };
        }
    }
};



window.handleSocial = function(platform) {
    if (platform === 'Instagram') {
        const username = "rameshjewellers7";
        const webUrl = `https://www.instagram.com/${username}/`;
        const appUrl = `instagram://user?username=${username}`;

        // Check if user is on Mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            // Mobile hai toh App kholne ki koshish karo
            window.location.href = appUrl;
            
            // Agar app nahi hai toh 1 sec baad browser mein khol do
            setTimeout(() => {
                window.location.href = webUrl;
            }, 1000);
        } else {
            // PC hai toh bina error ke seedha browser mein tab kholo
            window.open(webUrl, '_blank');
        }
    }
};
document.addEventListener('DOMContentLoaded', updateNavbar);
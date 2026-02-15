// --- 0. SMART CONFIGURATION ---
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BASE_URL = isLocal ? "http://localhost:3000" : "https://your-backend-service.onrender.com";
const API = `${BASE_URL}/api`;



// --- CONFIGURATION ---
window.productData = []; 
window.liveRates = {}; // Live rates ko store karne ke liye global variable

async function loadProductsFromDB() {
    try {
        const response = await fetch(`${API}/products`);
        const data = await response.json();
        
        // 1. Save live rates to global variable
        window.liveRates = data.rates || {};
        const rates = window.liveRates;

        // 2. Data mapping with PER GRAM making charge calculation
        window.productData = (data.products || []).map(p => {
            const weight = parseFloat(p.weight_gm) || 0;
            const makingPerGram = parseFloat(p.making_charge) || 0; // Value from DB (e.g. 500)
            let rateToUse = 0;

            // Decide rate based on purity
            if (p.purity === '916' || p.purity === '22') {
                rateToUse = parseFloat(rates.rate_916) > 0 ? parseFloat(rates.rate_916) : (parseFloat(rates.rate_995) * 0.916);
            } else if (p.purity === '750' || p.purity === '18') {
                rateToUse = parseFloat(rates.rate_750) > 0 ? parseFloat(rates.rate_750) : (parseFloat(rates.rate_995) * 0.750);
            } else {
                rateToUse = parseFloat(rates.rate_995) || 0;
            }

            // --- UPDATED LOGIC: Gold Price + (Making per gram * Weight) ---
            const goldOnlyPrice = Math.round(weight * rateToUse);
            const totalMakingCharge = Math.round(weight * makingPerGram);
            const finalPriceIncludingMaking = goldOnlyPrice + totalMakingCharge;

            return {
                ...p,
                real_price: finalPriceIncludingMaking, // Now includes Gold + Per Gram Making
                pure_gold_price: goldOnlyPrice,        // Storing separately for detail page
                live_gold_rate: rateToUse              // Useful for detail page calculations
            };
        });

        console.log("✅ Data Loaded: Price now includes Per Gram Making Charge.");

        // UI Refresh functions
        if (typeof renderProducts === 'function') renderProducts(window.productData);
        if (typeof renderNewArrivals === 'function') renderNewArrivals();
        
        if (typeof renderLimitedOffers === 'function') {renderLimitedOffers();}
        if (typeof renderWishlist === 'function') renderWishlist(); 
        
    } catch (error) {
        console.error("❌ Error loading products:", error);
    }
}

// --- WISHLIST & TOAST LOGIC --- (Pehle jaisa hi hai)
window.wishlist = JSON.parse(localStorage.getItem('jewelleryWishlist')) || [];

function toggleWishlist(productId) {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        showToastNotification("⚠️ Please login first!");
        return; 
    }
    const id = Number(productId);
    const index = window.wishlist.indexOf(id);
    
    if (index > -1) { 
        window.wishlist.splice(index, 1); 
        showToastNotification("💔 Removed from Wishlist"); 
    } else { 
        window.wishlist.push(id); 
        showToastNotification("⭐ Added to Wishlist!"); 
    }
    
    localStorage.setItem('jewelleryWishlist', JSON.stringify(window.wishlist));
    
    if (typeof renderProducts === 'function') renderProducts(window.productData);
    if (typeof renderWishlist === 'function') renderWishlist();
}

function showToastNotification(message) {
    let toast = document.getElementById('smart-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'smart-toast';
        toast.style.cssText = `position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.85); color: #fff; padding: 12px 25px; border-radius: 50px; z-index: 10000; transition: 0.5s; box-shadow: 0 4px 15px rgba(0,0,0,0.3); font-weight: 500;`;
        document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.style.display = 'block'; 
    toast.style.opacity = '1';
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        setTimeout(() => { toast.style.display = 'none'; }, 500); 
    }, 3000);
}

function isWishlisted(id) { return window.wishlist.includes(Number(id)); }

document.addEventListener('DOMContentLoaded', loadProductsFromDB);



// both connected cart wishlist 
function updateBadgeCounts() {
    // LocalStorage se cart aur wishlist ka data nikalein
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const jewelleryWishlist = JSON.parse(localStorage.getItem('jewelleryWishlist')) || [];

    const cartCount = cart.length;
    const wishlistCount = jewelleryWishlist.length;

    // Cart Badges update karein
    const cartBadges = ['cart-count-desktop', 'cart-count-mobile'];
    cartBadges.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = cartCount;
            el.style.display = cartCount > 0 ? 'block' : 'none';
        }
    });

    // Wishlist Badges update karein
    const wishlistBadges = ['wishlist-count-desktop', 'wishlist-count-mobile'];
    wishlistBadges.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = wishlistCount;
            el.style.display = wishlistCount > 0 ? 'block' : 'none';
        }
    });
}

// Page load hone par run karein
document.addEventListener('DOMContentLoaded', updateBadgeCounts);


async function loadMainCarousel() {
    const container = document.getElementById('main-carousel-content');
    const indicatorContainer = document.getElementById('carousel-indicators');
    if (!container) return;

    try {
        const res = await fetch(`${API}/carousel`);
        // const res = await fetch(`${CONFIG.API_BASE_URL}/api/carousel`);
        const slides = await res.json();

        if (slides.length > 0) {
            // Indicators Render
            indicatorContainer.innerHTML = slides.map((_, i) => `
                <button type="button" data-bs-target="#mainHeroCarousel" data-bs-slide-to="${i}" 
                        class="${i === 0 ? 'active' : ''}"></button>
            `).join('');
            container.innerHTML = slides.map((slide, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <div class="hero-overlay"></div>
                    <img src="${BASE_URL}/images/${slide.image_path}" class="d-block w-100 hero-img" alt="${slide.title}">
                    <div class="carousel-caption hero-content text-start">
                        <span class="category-tag mb-3 d-inline-block">${slide.tag || 'EXCLUSIVE'}</span>
                        <h1 class="display-1 gold-text fw-bold mb-3">${slide.title}</h1>
                        <p class="hero-desc fs-5 mb-4 text-white-50">${slide.description}</p>
                        <div class="hero-btns">
                            <a href="collection.html" class="btn btn-gold-luxury px-5 py-3">VIEW COLLECTION</a>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error("❌ Carousel fetch error:", err);
    }
}

function showModal() {
    document.getElementById('numberModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
}

function closeModal() {
    document.getElementById('numberModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
}
document.addEventListener('DOMContentLoaded', loadMainCarousel);



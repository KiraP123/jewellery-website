// const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// const BASE_URL = isLocal ? "http://localhost:3000" : "https://your-backend-service.onrender.com";

// --- product-detail.js ---

async function initProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'collection.html';
        return;
    }

    if (window.productData && window.productData.length > 0) {
        loadData(productId);
    } else {
        if (typeof loadProductsFromDB === "function") {
            await loadProductsFromDB(); 
            loadData(productId);
        } else {
            console.error("❌ loadProductsFromDB function not found!");
        }
    }
}

function loadData(id) {
    const product = window.productData.find(p => Number(p.id) === Number(id));
    
    if (product) {
        // const imgPath = `http://localhost:3000/images/${product.image}`;
        const imgPath = `${BASE_URL}/images/${product.image}`;
        const mainImg = document.getElementById('mainImg');
        if (mainImg) mainImg.src = imgPath;

        renderUI(product);
        calculateBreakdown(product);
        renderRelated(product.purity, product.id);
    } else {
        const detailsDiv = document.getElementById('productDetails');
        if (detailsDiv) detailsDiv.innerHTML = "<h3 class='text-center'>Product Not Found</h3>";
    }
}





function calculateBreakdown(p) {
    const weight = parseFloat(p.weight_gm) || 0;
    const ratePerGram = parseFloat(p.live_gold_rate) || 0; 
    const originalMakingPerGram = parseFloat(p.making_charge) || 0;
    const isOffer = Number(p.is_limited_offer) === 1;
    const hallmarkCharge = 53.10; 
    
    // 1. Calculations logic
    const currentMakingPerGram = isOffer ? (originalMakingPerGram * 0.95) : originalMakingPerGram;
    const pureGoldValue = Math.round(weight * ratePerGram);
    const totalOriginalMaking = Math.round(weight * originalMakingPerGram);
    const totalDiscountedMaking = Math.round(weight * currentMakingPerGram);
    
    // Hallmark merged with Making for display
    const originalMakingWithHallmark = totalOriginalMaking + hallmarkCharge;
    const savingsAmount = isOffer ? (totalOriginalMaking - totalDiscountedMaking) : 0;

    const subtotal = pureGoldValue + totalDiscountedMaking + hallmarkCharge;
    const gstAmount = Math.round(subtotal * 0.03);
    const finalBill = subtotal + gstAmount;

    const breakdownBody = document.getElementById('breakdownDetails');
    if (breakdownBody) {
        breakdownBody.innerHTML = `
            <div class="mt-4 p-4 rounded-4 shadow-sm border" style="background: #ffffff; border-color: #eee !important;">
                <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                    <h6 class="fw-bold text-dark mb-0" style="letter-spacing: 0.5px;">PRICE BREAKDOWN</h6>
                    <span class="badge bg-success-subtle text-success border-success border fw-medium px-2 py-1" style="font-size: 9px;">
                        <i class="bi bi-shield-check me-1"></i>SECURE PRICE
                    </span>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center">
                        <div class="icon-box me-3 rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                            <i class="bi bi-gem text-warning"></i>
                        </div>
                        <div>
                            <span class="d-block fw-bold small text-dark">Gold Value</span>
                            <small class="text-muted" style="font-size: 10px;">${p.purity}K Gold | ${weight}g</small>
                        </div>
                    </div>
                    <span class="fw-bold text-dark">₹${pureGoldValue.toLocaleString('en-IN')}</span>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center">
                        <div class="icon-box me-3 rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                            <i class="bi bi-tools text-secondary"></i>
                        </div>
                        <div>
                            <span class="d-block fw-bold small text-dark">Making & Services</span>
                            <small class="text-muted" style="font-size: 10px;">Includes Hallmark Fee</small>
                        </div>
                    </div>
                    <span class="fw-bold text-dark">+ ₹${originalMakingWithHallmark.toLocaleString('en-IN')}</span>
                </div>

                ${isOffer ? `
                <div class="d-flex justify-content-between align-items-center mb-3 p-2 rounded-3" style="background: #f0fff4; border: 1px dashed #22c55e;">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-tags-fill text-success me-2 ms-1"></i>
                        <span class="small text-success fw-bold">Special Offer Applied</span>
                    </div>
                    <span class="fw-bold text-success">- ₹${savingsAmount.toLocaleString('en-IN')}</span>
                </div>
                ` : ''}

                <div class="d-flex justify-content-between align-items-center mb-4 pt-2">
                    <div class="d-flex align-items-center">
                        <div class="icon-box me-3 rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                            <i class="bi bi-receipt text-muted"></i>
                        </div>
                        <div>
                            <span class="d-block fw-bold small text-dark">GST</span>
                        </div>
                    </div>
                    <span class="fw-bold text-dark">+ ₹${gstAmount.toLocaleString('en-IN')}</span>
                </div>

                <div class="p-3 rounded-4 shadow-sm" style="background: linear-gradient(135deg, #4a1d1f 0%, #2b1112 100%); color: white;">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <small class="d-block opacity-75 fw-bold" style="font-size: 10px; letter-spacing: 1px;">TOTAL PAYABLE</small>
                            <span class="fw-light" style="font-size: 11px;">(All Taxes Included)</span>
                        </div>
                        <span class="fw-bolder" style="font-size: 1.7rem; font-family: 'Inter', sans-serif;">₹${finalBill.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <div class="text-center mt-3">
                    <small class="text-muted" style="font-size: 10px;">
                        <i class="bi bi-info-circle me-1"></i> Prices are subject to gold rate fluctuations.
                    </small>
                </div>
            </div>`;
    }
}

function sendWhatsAppOrder() {
    // 1. Basic Product Info
    const productName = document.querySelector('h1')?.innerText || "Jewellery Item";
    const finalPrice = document.getElementById('mainProductPrice')?.innerText || "Price on Request";
    // const finalPrice = document.getElementById('mainProductPrice')?.innerText.replace('₹', '').trim() || "Price on Request";
    
    // 2. Specs Cards se data nikalna (Purity, Weight, Size)
    const specs = document.querySelectorAll('.spec-card span');
    const purity = specs[0]?.innerText || "N/A";
    const weight = specs[1]?.innerText || "N/A";
    const size = document.getElementById('selectedUserSize')?.value || specs[2]?.innerText || "Standard";

    // 3. Hisab Kitab (Calculation Details from UI)
    // Hum breakdown section se text utha rahe hain taaki hisab exact match kare
    const goldRateText = document.querySelector('.text-muted[style*="font-size: 10px;"]')?.innerText || "";
    
    // 4. WhatsApp Number (Yahan apna number 91 ke saath likhein)
    const myNumber = "919321837665"; 

    // 5. Professional Message Design
    const text = `✨ *RAMESH JEWELLERY - NEW ORDER* ✨\n` +
                 `--------------------------------\n` +
                 `🛍️ *Product:* ${productName}\n` +
                 `⭐ *Purity:* ${purity}\n` +
                 `⚖️ *Weight:* ${weight}\n` +
                 `📏 *Size:* ${size}\n` +
                 `--------------------------------\n` +
                 `💰 *PRICE BREAKDOWN*\n` +
                 `• Gold Value: ${goldRateText}\n` +
                 `• Final Amount: *${finalPrice}*\n` +
                 `_(Incl. Making, Hallmark & GST)_\n` +
                 `--------------------------------\n` +
                 `🔗 *Product Link:* ${window.location.href}\n\n` +
                 `Hello, I want to confirm this order. Please let me know the next steps! 🙏`;

    // 6. WhatsApp Link generation
    const waLink = `https://wa.me/${myNumber}?text=${encodeURIComponent(text)}`;
    
    window.open(waLink, '_blank');
}

function renderUI(p) {
    const detailsDiv = document.getElementById('productDetails');
    if (detailsDiv) {
        const isOffer = p.is_limited_offer == 1;
        
        // Sync with existing Wishlist Key
        const currentWishlist = JSON.parse(localStorage.getItem('jewelleryWishlist')) || [];
        const isFav = currentWishlist.includes(Number(p.id));

        const weight = parseFloat(p.weight_gm) || 0;
        const rate = parseFloat(p.live_gold_rate) || 0;
        const currentPrice = Math.round(weight * rate);
        const originalPrice = Math.round(currentPrice * 1.35 );
        
        const mcPerGram = parseFloat(p.making_charge) || 0;
const hallmarkCharge = 53.10;

// Making Charge with 5% Discount logic
let totalMaking = weight * mcPerGram;
if (isOffer) totalMaking *= 0.95;

// Grand Total (Gold + Making + Hallmark + 3% GST)
const finalGrandTotal = Math.round(((weight * rate) + totalMaking + hallmarkCharge) * 1.03);


const stockQty = parseInt(p.stock_qty) || 0;
const isOutOfStock = stockQty <= 0;

// Button ke liye text aur state taiyar karein
const cartBtnText = isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART';
const cartBtnStatus = isOutOfStock ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : '';

// Compact Box Logic
const stockDisplay = (stockQty > 0) 
    ? `<div class="border border-success text-success rounded-2 px-2 py-1 mb-3 text-center fw-bold" style="font-size: 0.75rem; background: #f8fff9;">
        <i class="bi bi-check-circle-fill me-1"></i> IN STOCK: ${stockQty} UNITS
       </div>`
    : `<div class="border border-danger text-danger rounded-2 px-2 py-1 mb-3 text-center fw-bold" style="font-size: 0.75rem; background: #fff8f8;">
        <i class="bi bi-x-circle-fill me-1"></i> OUT OF STOCK
       </div>`;


        detailsDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex flex-wrap align-items-center gap-2">
                    <div class="badge-premium">
                        <i class="bi bi-patch-check-fill"></i> BIS HALLMARKED
                    </div>
                    <div class="badge-huid">
                        <i class="bi bi-qr-code-scan"></i> HUID: ${Math.random().toString(36).substring(2, 8).toUpperCase()}
                    </div>
                    ${isOffer ? '<span class="badge rounded-pill bg-danger animate-pulse">OFFER ENDING SOON</span>' : ''}
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-light btn-sm rounded-circle border shadow-sm" onclick="handleWishlistToggle(${p.id}, this)">
                        <i class="${isFav ? 'bi-heart-fill' : 'bi-heart'}" style="${isFav ? 'color:red;' : ''}"></i>
                    </button>
                    <button class="btn btn-light btn-sm rounded-circle border shadow-sm" onclick="shareProduct('${p.name}')">
                        <i class="bi bi-reply-fill" style="transform: scaleX(-1);"></i>
                    </button>
                </div>
            </div>

            <h1 class="h2 fw-bold text-serif mb-1">${p.name}</h1>
            <div class="price-section mb-4">
                <div class="d-flex align-items-baseline gap-2">
                    <h2 id="mainProductPrice" class="fw-bold text-dark mb-0" style="font-size: 1.8rem;">₹${finalGrandTotal.toLocaleString('en-IN')}</h2>
                    <span class="fw-light" style="font-size: 11px;">(All Taxes Included)</span>
                </div>
                
            </div>

            <div class="row g-2 mb-4">
                <div class="col-3">
                    <div class="spec-card shadow-sm border text-center p-1">
                        <small class="text-muted" style="font-size: 10px;">METAL</small>
                        <span class="d-block fw-bold small">${p.purity}K Gold</span>
                    </div>
                </div>
                <div class="col-3">
                    <div class="spec-card shadow-sm border text-center p-1">
                        <small class="text-muted" style="font-size: 10px;">WEIGHT</small>
                        <span class="d-block fw-bold small">${p.weight_gm}g</span>
                    </div>
                </div>
                <div class="col-3">
                    <div class="spec-card shadow-sm border text-center p-1  border-warning">
                        <small class="text-muted" style="font-size: 10px;"> SIZE</small>
                        <span class="d-block fw-bold small ">${p.size || '0'}</span>
                    </div>
                </div>
            </div>

            <div class="mb-4">
                <label class="fw-bold small mb-2 d-block text-uppercase">Choose Different Size</label>
                <div class="d-flex gap-2 flex-wrap" id="sizeSelector">
                    ${[10, 12, 14, 16, 18, 20 ,30].map(s => `
                        <button class="btn btn-outline-secondary btn-sm rounded-circle size-btn" 
                                onclick="setProductSize(this, '${s}')">${s}</button>
                    `).join('')}
                </div>
                <input type="hidden" id="selectedUserSize" value="${p.size || ''}">
            </div>

           <div class="pincode-widget mt-3">
    <div class="d-flex align-items-center gap-2 mb-2">
        <i class="bi bi-geo-alt-fill text-gold"></i>
        <span class="small fw-bold text-muted text-uppercase tracking-wider" style="font-size: 0.7rem;">Delivery Check</span>
    </div>
    
    <div class="input-group input-group-sm mb-1" style="max-width: 280px;">
        <input type="number" id="pincodeInput" class="form-control border-end-0 bg-white" placeholder="Enter Pincode" style="border-radius: 8px 0 0 8px;">
        <button class="btn btn-dark fw-bold px-3" onclick="checkDelivery()" style="border-radius: 0 8px 8px 0; font-size: 0.75rem;">CHECK</button>
    </div>

    <div id="deliveryLoader" class="spinner-border spinner-border-sm text-secondary mt-2" role="status" style="display: none;"></div>
    <div id="deliveryResult" class="mt-2" style="display: none;"></div>
</div>
              ${stockDisplay} </div>
            <div class="d-grid gap-2">
                ${!isOutOfStock ? `
        <button class="btn btn-dark btn-lg py-3 rounded-pill fw-bold shadow-lg mb-1" 
                style="background-color: #4a1d1f !important; border:none;" 
                onclick="buyNowLink(${p.id})">
            <i class="bi bi-lightning-charge-fill me-1"></i> BUY NOW
        </button>
    ` : ''}
                <button class="btn btn-outline-dark btn-lg py-2 rounded-pill fw-bold" 
                       ${cartBtnStatus} 
                          onclick="addToBagDetail(${p.id})">
                       <i class="bi ${isOutOfStock ? 'bi-x-circle' : 'bi-bag-heart'} me-2"></i> ${cartBtnText}
                </button>
               
            </div>
        `;
    }
}

// Fixed Wishlist Logic to sync with jewelleryWishlist
function handleWishlistToggle(id, btn) {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        alert("Please login first!");
        window.location.href = 'login.html';
        return;
    }

    let wishlist = JSON.parse(localStorage.getItem('jewelleryWishlist')) || [];
    const icon = btn.querySelector('i');
    const index = wishlist.indexOf(Number(id));

    if (index === -1) {
        wishlist.push(Number(id));
        icon.classList.replace('bi-heart', 'bi-heart-fill');
        icon.style.color = 'red';
        if(typeof showToastNotification === 'function') showToastNotification("⭐ Added to Wishlist!");
    } else {
        wishlist.splice(index, 1);
        icon.classList.replace('bi-heart-fill', 'bi-heart');
        icon.style.color = '';
        if(typeof showToastNotification === 'function') showToastNotification("💔 Removed from Wishlist");
    }

    localStorage.setItem('jewelleryWishlist', JSON.stringify(wishlist));
}

function setProductSize(btn, size) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('btn-dark', 'text-white'));
    btn.classList.add('btn-dark', 'text-white');
    document.getElementById('selectedUserSize').value = size;
}

function buyNowLink(id) {
    const size = document.getElementById('selectedUserSize').value;
    if(!size) { alert("Chooce The Size!"); return; }
    if (typeof addToCart === 'function') {
        addToCart(id, size);
        window.location.href = 'checkout.html';
    }
}

function shareProduct(name) {
    if (navigator.share) {
        navigator.share({ title: name, url: window.location.href });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link Copy Ho Gaya!");
    }
}

function addToBagDetail(id) {
    const size = document.getElementById('selectedUserSize').value;
    if (typeof addToCart === 'function') {
        addToCart(id, size);
        if (typeof Swal !== 'undefined') {
            Swal.fire({ icon: 'success', title: 'Added to BagG', showConfirmButton: false, timer: 1000 });
        }
    }
}

function renderRelated(purity, currentId) {
    const container = document.getElementById('relatedContainer');
    if (!container || !window.productData) return;

    const related = window.productData.filter(p => p.purity === purity && Number(p.id) !== Number(currentId)).slice(0, 4);
    container.innerHTML = related.map(p => {
        const goldOnly = Math.round((parseFloat(p.weight_gm) || 0) * (parseFloat(p.live_gold_rate) || 0));
        // <img src="http://localhost:3000/images/${p.image}" class="card-img-top p-2" style="height:120px; object-fit:contain;"></img>
        return `
        <div class="col-6 col-md-3 mb-3">
            <div class="card h-100 border-0 shadow-sm rounded-4 text-center">
                <a href="product-detail.html?id=${p.id}">                    
                    <img src="${product.image.startsWith('http') ? product.image : `${BASE_URL}/images/${product.image}`}" class="img-fluid" alt="${product.name}">
                </a>
                <div class="card-body p-2">
                    <h6 class="small fw-bold mb-1 text-truncate">${p.name}</h6>
                    <p class="text-dark fw-bold mb-0">₹${goldOnly.toLocaleString('en-IN')}</p>
                </div>
            </div>
        </div>`;
    }).join('');
}


// Global Toggle Function
function toggleBreakdown() {
    const content = document.getElementById('breakdownDetails');
    const icon = document.getElementById('dropdownIcon');
    if (content.style.display === "none") {
        content.style.display = "block";
        icon.classList.replace('bi-chevron-down', 'bi-chevron-up');
    } else {
        content.style.display = "none";
        icon.classList.replace('bi-chevron-up', 'bi-chevron-down');
    }
}




function checkDelivery() {
    const pin = document.getElementById('pincodeInput').value;
    const resultDiv = document.getElementById('deliveryResult');
    const loader = document.getElementById('deliveryLoader');
    
    if (pin.length !== 6) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<span class="text-danger small fw-bold"><i class="bi bi-x-circle"></i> Invalid Pincode</span>`;
        return;
    }

    resultDiv.style.display = 'none';
    loader.style.display = 'block';

    // Helper: Date calculate karne ke liye
    const getDeliveryDate = (daysToAdd) => {
        const d = new Date();
        d.setDate(d.getDate() + daysToAdd);
        // Agar Sunday pad raha hai toh ek din aur badha do (Optional)
        if(d.getDay() === 0) d.setDate(d.getDate() + 1); 
        return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
    };

    setTimeout(() => {
        loader.style.display = 'none';
        resultDiv.style.display = 'block';

        let deliveryInfo = "";
        let earliestInfo = "";
        let icon = "bi-truck";
        let themeClass = "text-mumbai";

        // --- KANDIVALI SHOP LOGIC ---

        // 1. NEARBY (Kandivali, Malad, Borivali) - Pincodes: 400067, 400064, 400091, 400092, etc.
        if (["400067", "400064", "400091", "400092", "400097", "400095"].includes(pin)) {
            deliveryInfo = `by <b>Tomorrow, ${getDeliveryDate(1)}</b>`;
            earliestInfo = "Could arrive as early as <b>Today Evening</b>";
            icon = "bi-lightning-charge-fill text-success";
        } 
        // 2. WESTERN LINE - ANDHERI to BANDRA & BHAYANDER to VIRAR (2 Days)
        else if (pin.startsWith('40005') || pin.startsWith('40006') || pin.startsWith('4011') || pin.startsWith('4012') || pin.startsWith('4013')) {
            deliveryInfo = `by <b>${getDeliveryDate(2)}</b>`;
            earliestInfo = `Earliest arrival: <b>Tomorrow, ${getDeliveryDate(1)}</b>`;
            icon = "bi-truck text-primary";
        }
        // 3. SOUTH MUMBAI (Churchgate / Colaba) - 400001 to 400030 (3 Days)
        else if (pin.startsWith('40000') || pin.startsWith('40002') || pin.startsWith('40003')) {
            deliveryInfo = `by <b>${getDeliveryDate(3)}</b>`;
            earliestInfo = `Expected between <b>${getDeliveryDate(2)} - ${getDeliveryDate(3)}</b>`;
            icon = "bi-truck text-info";
        }
        // 4. OTHER STATES (Rajasthan, UP, Bangalore etc.) - 5 to 7 Days
        else {
            deliveryInfo = `by <b>${getDeliveryDate(6)}</b>`;
            earliestInfo = `Estimated between <b>${getDeliveryDate(5)} to ${getDeliveryDate(7)}</b>`;
            icon = "bi-airplane text-secondary";
            themeClass = "text-muted";
        }

        resultDiv.innerHTML = `
            <div class="res-box ${themeClass} p-3 border rounded-3 bg-white shadow-sm">
                <div class="d-flex align-items-center mb-1">
                    <i class="bi ${icon} fs-4 me-2"></i>
                    <span class="fs-6">Deliver ${deliveryInfo}</span>
                </div>
                <div class="text-muted ps-4 small" style="font-size: 0.85rem;">
                    <i class="bi bi-info-circle me-1"></i> ${earliestInfo}
                </div>
            </div>`;
    }, 600); 
}


document.addEventListener('DOMContentLoaded', initProductPage);






// const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// const BASE_URL = isLocal ? "http://localhost:3000" : "https://your-backend-service.onrender.com";



function renderProducts(productsToRender) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    if (!productsToRender || productsToRender.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center py-5"><h3>No Products Found</h3></div>`;
        return;
    }

    

    grid.innerHTML = productsToRender.map(product => {
        const isFav = isWishlisted(product.id);
        const weight = parseFloat(product.weight_gm) || 0;
        const mcPerGram = parseFloat(product.making_charge) || 0;
        const hallmarkCharge = 53.10;

        // --- 1. Gold Rate Fetch (Logic Fix) ---
        let rate = parseFloat(product.live_gold_rate) || 0;
        if (rate === 0 && window.currentGoldRates) {
            const purity = String(product.purity);
            if (purity.includes('18')) rate = window.currentGoldRates.rate_750;
            else if (purity.includes('22') || purity.includes('916')) rate = window.currentGoldRates.rate_916;
            else rate = window.currentGoldRates.rate_995;
        }

        // --- 2. Discount Calculation (Special Offer) ---
        const goldPrice = weight * rate;
        let totalMaking = weight * mcPerGram;
        
        // Agar limited offer product hai toh 5% Making minus karo
        if (product.is_limited_offer == 1) {
            totalMaking = totalMaking * 0.95; 
        }

        const subTotal = goldPrice + totalMaking + hallmarkCharge;
        const finalPriceWithGST = Math.round(subTotal * 1.03); // 3% GST

       
          // Stock Status Logic
const stockQty = parseInt(product.stock_qty) || 0;
const stockBadge = stockQty > 0 
    ? `<div class="text-success small fw-bold mb-2"><i class="fa-solid fa-circle-check"></i> In Stock: ${stockQty}</div>` 
    : `<div class="text-danger small fw-bold mb-2"><i class="fa-solid fa-circle-exclamation"></i> Out of Stock</div>`;

// Button logic: Stock 0 hone par disable ho jaye
const cartBtnAttr = stockQty > 0 ? `onclick="addToCart(${product.id})"` : `disabled style="opacity: 0.6; cursor: not-allowed;"`;
const cartBtnText = stockQty > 0 ? `<i class="fa-solid fa-bag-shopping me-2"></i> ADD TO BAG` : `OUT OF STOCK`;
const btnStatus = stockQty > 0 ? "" : "disabled";
const btnText = stockQty > 0 ? `<i class="fa-solid fa-bag-shopping me-2"></i> ADD TO BAG` : `OUT OF STOCK`;
        // return `
        //     <div class="col-md-4 mb-4">
        //         <div class="product-card-advance">
        //             <div class="img-wrapper">
        //                 <div class="purity-floating-tag">${product.purity || '916'}K</div>
        //                  <img src="${product.image && product.image.startsWith('http') ? product.image : `${BASE_URL}/images/${product.image}`}" class="img-main-zoom" onerror="this.src='https://placehold.co/300'">
                        
        //                 <div class="sidebar-hover-actions">
        //                     <button class="side-action-btn ${isFav ? 'active' : ''}" onclick="toggleWishlist(${product.id})" title="Wishlist">
        //                         <i class="${isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
        //                     </button>
        //                     <button class="side-action-btn" onclick="location.href='product-detail.html?id=${product.id}'" title="View Details">
        //                         <i class="fa-regular fa-eye"></i>
        //                     </button>
        //                 </div>
        //             </div>

        //             <div class="content-wrapper">
        //                 <h6 class="product-title-luxury">${product.name}</h6>
        //                 <div class="specs-bar-luxury">
        //                     <span><i class="fa-solid fa-weight-hanging"></i> ${weight} gm</span>
        //                     <span><i class="fa-solid fa-ruler-horizontal"></i> ${product.size || 'Standard'}</span>
        //                 </div>

        //                 <div class="price-display-box">
        //                     <div class="final-price-tag">₹ ${finalPriceWithGST.toLocaleString('en-IN')}</div> <small>${stockBadge}</small>
        //                     <span class="price-title">${product.is_limited_offer == 1 ? 'Special Offer Price' : 'Total Price (Incl. GST)'}</span>
        //                 </div> 
        //                 <button class="btn-bag-luxury" ${btnStatus} onclick="addToCart(${product.id})">
        //                  ${btnText}
        //                 </button> 
        //             </div>
        //         </div>
        //     </div>`;




        return `
            <div class="col-md-4 mb-4">
                <div class="product-card-advance">
                    <div class="img-wrapper">
                        <div class="purity-floating-tag">${product.purity || '916'}K</div>
                        <img src="http://localhost:3000/images/${product.image}" class="img-main-zoom" onerror="this.src='https://via.placeholder.com/300'"></img>
                        
                        <div class="sidebar-hover-actions">
                            <button class="side-action-btn ${isFav ? 'active' : ''}" onclick="toggleWishlist(${product.id})" title="Wishlist">
                                <i class="${isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
                            </button>
                            <button class="side-action-btn" onclick="location.href='product-detail.html?id=${product.id}'" title="View Details">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div class="content-wrapper">
                        <h6 class="product-title-luxury">${product.name}</h6>

                        <div class="price-display-box">
                            <div class="final-price-tag">₹ ${finalPriceWithGST.toLocaleString('en-IN')}</div> <small>${stockBadge}</small>   
                        </div> 
                       <button class="btn-bag-luxury" ${btnStatus} onclick="addToCart(${product.id})">
                          ${btnText}
                         </button>
                    </div>
                </div>
            </div>`;
    }).join('');
}




function renderNewArrivals() {
    const arrivalGrid = document.getElementById('newArrivalsContainer');
    if (!arrivalGrid || !window.productData || window.productData.length === 0) return;

    // STEP 1: Pehle filter karein (Sirf wahi products jinka stock > 0 hai)
    // STEP 2: Phir slice karein (Pehle 4 available products)
    const topProducts = window.productData
        .filter(p => (parseInt(p.stock_qty) || 0) > 0) 
        .slice(0, 4);

    arrivalGrid.innerHTML = topProducts.map(product => {
        const isFav = isWishlisted(product.id);
        const weight = parseFloat(product.weight_gm) || 0;
        const mcPerGram = parseFloat(product.making_charge) || 0;
        const hallmarkCharge = 53.10;

        let rate = parseFloat(product.live_gold_rate) || 0;
        if (rate === 0 && window.currentGoldRates) {
            const purity = String(product.purity);
            if (purity.includes('18')) rate = window.currentGoldRates.rate_750;
            else if (purity.includes('22') || purity.includes('916')) rate = window.currentGoldRates.rate_916;
            else rate = window.currentGoldRates.rate_995;
        }

        let totalMaking = weight * mcPerGram;
        if (product.is_limited_offer == 1) {
            totalMaking = totalMaking * 0.95;
        }

        const subTotal = (weight * rate) + totalMaking + hallmarkCharge;
        const finalPriceWithGST = Math.round(subTotal * 1.03);

        return `
            <div class="col-lg-3 col-md-6 mb-4 col-6">
                <div class="arrival-card">
                    <div class="arrival-img-container">
                        <img src="${product.image && product.image.startsWith('http') ? product.image : `${BASE_URL}/images/${product.image}`}" onerror="this.src='https://placehold.co/300'">
                        <div class="arrival-actions visible-mobile">
                            <button class="action-btn" onclick="toggleWishlist(${product.id})">
                                <i class="bi ${isFav ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i>
                            </button>
                            <button class="action-btn" onclick="location.href='product-detail.html?id=${product.id}'">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="arrival-details text-center">
                        <h5 class="fw-bold mt-1 mb-2" style="font-size: 0.9rem;">${product.name}</h5>
                        <p class="price-tag fw-bold text-dark">₹ ${finalPriceWithGST.toLocaleString('en-IN')}</p>
                        <button class="btn btn-dark w-100 py-2 rounded-pill shadow-sm" style="font-size: 12px;" onclick="addToCart(${product.id})">
                            <i class="bi bi-bag-plus"></i> ADD
                        </button>
                    </div>
                </div>
            </div>`;
    }).join('');
}
function renderLimitedOffers() {
    const container = document.getElementById('offerContainer');
    if (!container) return;

    const offerItems = window.productData.filter(p => p.is_limited_offer == 1);
    const HALLMARK_CHARGE = 53.10; // Hallmark value per piece

    if (offerItems.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5"></div>`;
        return;
    }

    container.innerHTML = offerItems.map(p => {
        const weight = parseFloat(p.weight_gm) || 0;
        const rate = parseFloat(p.live_gold_rate) || 0;
        const mcPerGram = parseFloat(p.making_charge) || 0;

        // 1. Full Calculation (Original)
        const goldPrice = weight * rate;
        const fullMaking = weight * mcPerGram;
        // Total = (Gold + Making + Hallmark) + 3% GST
        const originalTotal = Math.round((goldPrice + fullMaking + HALLMARK_CHARGE) * 1.03);

        // 2. 5% Discount on Making (Offer)
        const discountedMaking = fullMaking * 0.95; 
        const offerTotal = Math.round((goldPrice + discountedMaking + HALLMARK_CHARGE) * 1.03);
        //<img src="http://localhost:3000/images/${p.image}" class="img-fluid rounded" style="height:180px; object-fit:contain;" onerror="this.src='https://via.placeholder.com/300'"></img>
        return `
            <div class="col-md-4 mb-4 col-6">
                <div class="card lto-card border-0 shadow-sm h-100 overflow-hidden position-relative">
                    <div class="offer-tag" style="background: #dc3545; color: white; padding: 4px 10px; font-size: 10px; font-weight: bold; position: absolute; top: 10px; left: 10px; border-radius: 4px; z-index: 5;">
                        5% OFF MAKING
                    </div>
                    
                    <div class="img-container p-3 text-center">
                       
                      <img src="${p.image && p.image.startsWith('http') ? p.image : `${BASE_URL}/images/${p.image}`}" class="img-fluid rounded" style="height:180px; object-fit:contain;" onerror="this.src='https://placehold.co/300'">
                    </div>

                    <div class="card-body text-center pt-0">
                        <h6 class="fw-bold mb-1" style="font-size: 0.9rem;">${p.name}</h6>
                        <p class="text-muted mb-2" style="font-size: 9px;"><i class="bi bi-patch-check-fill text-success"></i> Includes Hallmark ₹53.10</p>
                        
                        <div class="d-flex justify-content-center align-items-center gap-2 mb-2">
                            <span class="text-decoration-line-through text-muted small" style="font-size: 12px;">₹${originalTotal.toLocaleString('en-IN')}</span>
                            <span class="fw-bold text-danger" style="font-size: 1.1rem;">₹${offerTotal.toLocaleString('en-IN')}</span>
                        </div>
                        
                        <div class="savings-bar mb-3" style="background: #fff5f5; color: #e44d26; font-size: 10px; font-weight: 700; padding: 5px; border-radius: 6px; border: 1px dashed #e44d26;">
                            ✨ FLAT 5% OFF ON MAKING ✨
                        </div>
                        
                        <button class="btn btn-dark w-100 rounded-pill shadow-sm py-2" style="font-size: 12px;" onclick="claimOfferNow(${p.id})">
                            CLAIM OFFER NOW
                        </button>
                    </div>
                </div>
            </div>`;
    }).join('');
}


// Ye function Claim Offer wale products ke liye hai
function claimOfferNow(productId) {
    // Hamare paas cart.js mein addToCart pehle se hai
    // Hum sirf ye confirm kar rahe hain ki isme making charge 0 dikhe
    if (typeof addToCart === "function") {
        addToCart(productId); // Cart mein add karo
        
        // SweetAlert se confirmation
        Swal.fire({
            title: 'Offer Claimed! 🎁',
            text: '"5% Off on Making Charges!".',
            icon: 'success',
            confirmButtonColor: '#d4af37'
        });
    }
}

// --- 2. FILTER & SEARCH LOGIC ---
function applyFilters() {
    const priceEl = document.getElementById('priceRange');
    // Price Lakhs mein convert ho rahi hai filter ke liye
    const maxPrice = priceEl ? (priceEl.value * 100000) : 1000000;
    
    // Search term handle karna
    const searchTerm = (document.getElementById('laptopSearch')?.value || 
                        document.getElementById('mobileSearch')?.value || "").toLowerCase().trim();
    
    if (!window.productData) return;

    let filtered = window.productData.filter(p => {
        // Search Filter
        const matchesSearch = p.name.toLowerCase().includes(searchTerm);
        
        // Price Filter (Using Gold Only Value)
        const currentGoldValue = (parseFloat(p.weight_gm) || 0) * (parseFloat(p.live_gold_rate) || 0);
        const matchesPrice = currentGoldValue <= maxPrice;
        
        return matchesSearch && matchesPrice;
    });
    
    renderProducts(filtered);
}

// --- 3. EVENT LISTENERS ---
document.getElementById('laptopSearch')?.addEventListener('input', applyFilters);
document.getElementById('mobileSearch')?.addEventListener('input', applyFilters);

if (document.getElementById('priceRange')) {
    document.getElementById('priceRange').addEventListener('input', (e) => {
        const label = document.getElementById('priceValue');
        if(label) label.textContent = `₹ ${e.target.value} Lakhs`;
        applyFilters();
    });
}


function filterByCategory(catName, element) {
    // 1. Active class manage karna (Design change)
    document.querySelectorAll('.cat-pill').forEach(pill => pill.classList.remove('active'));
    element.classList.add('active');

    // 2. Filter Logic
    if (!window.productData) return;
    
    const filtered = (catName === 'All') 
        ? window.productData 
        : window.productData.filter(p => 
            (p.category && p.category.includes(catName)) || 
            (p.name && p.name.toLowerCase().includes(catName.toLowerCase()))
        );

    renderProducts(filtered); // Yeh aapka purana render function call karega
}



// --- 1. INITIALIZATION ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
});

// --- 2. ADD TO CART (Logic: Sirf Gold Value Save Hogi) ---


window.addToCart = function(productId, selectedSize) {
    if (!window.productData) return;

    const product = window.productData.find(p => Number(p.id) === Number(productId));
    const finalSize = selectedSize || product.size || '0';

    if (product) {
        let originalMaking = parseFloat(product.making_charge) || 0;
        let isOffer = Number(product.is_limited_offer) === 1;
        
        // 5% Discount Logic: 100% - 5% = 95% (0.95)
        let finalMaking = isOffer ? (originalMaking * 0.95) : originalMaking;
        
        const existingItem = cart.find(item => 
            Number(item.id) === Number(productId) && item.customerSize === finalSize
        );
        
        const weight = parseFloat(product.weight_gm) || 0;
        const liveRate = parseFloat(product.live_gold_rate) || 0;
        const currentGoldPrice = Math.round(weight * liveRate);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            existingItem.price = currentGoldPrice; 
            existingItem.making_charge = finalMaking; 
        } else {
            cart.push({
                ...product,
                quantity: 1,
                price: currentGoldPrice, 
                making_charge: finalMaking, 
                customerSize: finalSize,
                hasOffer: isOffer 
            });
        }
        saveAndRefresh();
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Added to Bag`, showConfirmButton: false, timer: 1500 });
        }
    }
};

function updateCartUI() {
    const cartBody = document.getElementById('cart-table-body');
    if (!cartBody) return;

    let totalGoldValue = 0;
    let totalFinalMakingCharges = 0; 





    if (cart.length === 0) {
    const cartBody = document.getElementById('cart-table-body');
    cartBody.innerHTML = `
        <div class="text-center py-5">
            <dotlottie-player 
                 src="https://lottie.host/98b8f48a-ccaa-4178-ab1e-d05de6079b92/KS7xGhpPl9.lottie"
                background="transparent" 
                speed="1" 
                style="width: 300px; height: 300px; margin: 0 auto;" 
                loop 
                autoplay>
            </dotlottie-player>
            
            <h2 class="mt-4 fw-bold">Your Bag is Empty!</h2>
            <p class="text-muted">Explore our luxury collection and find something special.</p>
            <a href="collection.html" class="btn btn-dark rounded-pill px-5 mt-3">BACK TO SHOP</a>
        </div>
    `;
    return;
}
   

    cartBody.innerHTML = cart.map((item, index) => {
        const qty = Number(item.quantity || 1);
        const weight = parseFloat(item.weight_gm) || 0;
        
        // 1. Rates nikalna
        const currentMakingRate = parseFloat(item.making_charge) || 0;
        // Agar offer hai toh original rate wapas nikalne ke liye 0.95 se divide kiya
        const originalMakingRate = item.hasOffer ? (currentMakingRate / 0.95) : currentMakingRate;
        
        const hallmarkPerPiece = 53.10; 

        // 2. Calculations
        const itemGoldTotal = Math.round(item.price) * qty;
        const itemMakingOnlyTotal = Math.round(weight * currentMakingRate) * qty;
        const itemHallmarkTotal = hallmarkPerPiece * qty;
        const finalMakingWithHallmark = itemMakingOnlyTotal + itemHallmarkTotal;

        totalGoldValue += itemGoldTotal;
        totalFinalMakingCharges += finalMakingWithHallmark;
         
        // <img src="http://localhost:3000/images/${item.image}" class="rounded border me-3" style="width:65px; height:65px; object-fit:contain;"></img>
        return `
        <div class="card mb-3 border-0 shadow-sm rounded-4 overflow-hidden position-relative animate__animated animate__fadeIn">
            <button class="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-2 shadow-sm border text-danger" 
                    onclick="removeFromCart(${index})" style="z-index: 10; width:32px; height:32px; padding:0;">
                <i class="bi bi-x-lg" style="font-size: 14px;"></i>
            </button>

            <div class="card-body p-3">
                <div class="row g-3 align-items-center">
                    <div class="col-4 col-md-2 text-center">
                        <div class="position-relative">
                            <img src="${item.image.startsWith('http') ? item.image : `${BASE_URL}/images/${item.image}`}"
                             class="img-fluid rounded-3 border p-1" 
                             style="max-height: 90px; width: 100%; object-fit: contain; background: #fdfdfd;"
                             onerror="this.src='https://placehold.co/100'">
                        </div>
                    </div>

                    <div class="col-8 col-md-6">
                        <div class="d-flex flex-column h-100">
                            <span class="fw-bolder text-dark text-uppercase mb-1" style="font-size: 14px; letter-spacing: 0.3px;">${item.name}</span>
                            
                            <div class="mb-2">
                                <span class="badge bg-gold-subtle text-dark border fw-medium" style="font-size: 10px; background-color: #fff9e6; color: #b8860b !important;">
                                    <i class="bi bi-star-fill me-1"></i>${item.purity}K | ${weight}g
                                </span>
                                <span class="badge bg-light text-muted border ms-1 fw-medium" style="font-size: 10px;">Size: ${item.customerSize}</span>
                            </div>

                            ${item.hasOffer ? `
                                <div class="bg-success-subtle p-2 rounded-2 mb-2" style="border: 1px dashed #28a745;">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="text-success fw-bold" style="font-size: 9px;"><i class="bi bi-lightning-fill"></i> 5% OFFER APPLIED</small>
                                        <small class="text-success fw-bold" style="font-size: 9px;">Saved ₹${Math.round(originalMakingRate - currentMakingRate)}/g</small>
                                    </div>
                                </div>
                            ` : ''}

                            <div class="mt-auto d-flex align-items-center gap-3">
                                <div class="price-info">
                                    <small class="text-muted d-block" style="font-size: 10px;">Making Rate</small>
                                    <span class="fw-bold ${item.hasOffer ? 'text-success' : 'text-dark'}" style="font-size: 13px;">₹${Math.round(currentMakingRate)}/g</span>
                                </div>
                                <div class="vertical-divider border-start" style="height: 20px;"></div>
                                <div class="price-info">
                                    <small class="text-muted d-block" style="font-size: 10px;">Gold Price</small>
                                    <span class="fw-bold text-dark" style="font-size: 13px;">₹${Math.round(item.price).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-4 border-top-mobile pt-3-mobile">


                       <div class="d-flex align-items-center" style="gap: 15px;">
    <div class="input-group shadow-sm rounded-pill overflow-hidden" 
         style="width: 100px !important; flex: none !important; border: 1px solid #eee; background: #fff; height: 30px;">
        
        <button class="btn btn-white border-0 px-2" onclick="changeQty(${index}, -1)" style="box-shadow: none; padding: 0 8px;">
            <i class="bi bi-dash" style="font-size: 12px;"></i>
        </button>
        
        <input type="text" class="form-control text-center border-0 fw-bold bg-white p-0" 
               value="${qty}" readonly 
               style="font-size: 13px; pointer-events: none; box-shadow: none; background: transparent !important;">
        
        <button class="btn btn-white border-0 px-2" onclick="changeQty(${index}, 1)" style="box-shadow: none; padding: 0 8px;">
            <i class="bi bi-plus" style="font-size: 12px;"></i>
        </button>
    </div>

    </div>




                            <div class="text-end mt-md-3">
                                <small class="text-muted d-block fw-bold" style="font-size: 9px; letter-spacing: 0.5px;">SUBTOTAL</small>
                                <span class="fw-bolder text-dark" style="font-size: 1.1rem;">₹${itemGoldTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cart-full-card animate__animated animate__fadeIn">
        <div class="form-check m-0 mb-2">
            <input class="form-check-input cart-item-checkbox" type="checkbox" value="${index}" id="check-${index}">
            <label class="form-check-label small fw-bold text-muted" for="check-${index}">SELECT ITEM</label>
        </div>
        
        <div class="cart-main-row">
        </div>
    `;
}).join('');
  
    renderSummaryValues(totalGoldValue, totalFinalMakingCharges);
}

// --- 4. UTILITY FUNCTIONS (Qty & Storage) ---
window.changeQty = function(index, delta) {
    if (cart[index]) {
        let newQty = (cart[index].quantity || 1) + delta;
        if (newQty > 0) {
            cart[index].quantity = newQty;
            saveAndRefresh();
        }
    }
};

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveAndRefresh();
};

function saveAndRefresh() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    if(typeof updateCartCount === 'function') updateCartCount();
}




function renderSummaryValues(goldTotal, totalMakingWithHallmark) {
    const safeGold = Number(goldTotal) || 0;
    const combinedMaking = Math.round(Number(totalMakingWithHallmark)) || 0;
    
    // Subtotal = Gold + (Discounted Making + Hallmark)
    const subtotal = safeGold + combinedMaking;
    const gst = Math.round(subtotal * 0.03); 
    const grandTotal = subtotal + gst;

    const subEl = document.getElementById('cart-subtotal');
    const makingEl = document.getElementById('cart-making');
    const taxEl = document.getElementById('cart-tax');
    const totalEl = document.getElementById('cart-total');

    if (subEl) subEl.innerText = `₹${safeGold.toLocaleString('en-IN')}`;
    if (makingEl) makingEl.innerText = `+ ₹${combinedMaking.toLocaleString('en-IN')}`;
    if (taxEl) taxEl.innerText = `+ ₹${gst.toLocaleString('en-IN')}`;
    if (totalEl) totalEl.innerText = `₹${grandTotal.toLocaleString('en-IN')}`;
}


window.moveToWishlist = function() {
    // 1. Sabhi checked checkboxes ko pakdo
    const selectedCheckboxes = document.querySelectorAll('.cart-item-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        Swal.fire({ icon: 'info', title: 'Nothing Selected', text: 'Please select items to move to wishlist' });
        return;
    }

    // Wishlist ko localStorage se lo (ya khali array)
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    // Reverse order mein loop chalayenge taaki splice karte waqt index na bigde
    const indicesToMove = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value)).sort((a, b) => b - a);

    indicesToMove.forEach(index => {
        const item = cart[index];
        
        // Wishlist mein add karo (duplicate check kar sakte hain)
        const exists = wishlist.some(w => w.id === item.id);
        if (!exists) {
            wishlist.push(item);
        }

        // Cart se hatao
        cart.splice(index, 1);
    });

    // Dono storage update karo
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    // UI Refresh
    updateCartUI();
    if(typeof updateCartCount === 'function') updateCartCount();

    Swal.fire({
        icon: 'success',
        title: 'Moved to Wishlist',
        text: `${selectedCheckboxes.length} items have been moved.`,
        timer: 2000,
        showConfirmButton: false
    });
};
// // --- CONFIGURATION ---
// const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// const BASE_URL = isLocal ? "http://localhost:3000" : "https://your-backend-service.onrender.com";

// --- WISHLIST STORAGE & ACTIONS ---
// Storage key wahi rakhi jo common.js mein hai
let wishlist = JSON.parse(localStorage.getItem('jewelleryWishlist')) || [];

function saveWishlist() {
    localStorage.setItem('jewelleryWishlist', JSON.stringify(wishlist));
    if (document.getElementById('wishlistTableBody')) {
        renderWishlist();
    }
}

function isWishlisted(productId) {
    return wishlist.includes(Number(productId));
}

function toggleWishlist(productId) {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        showToastNotification("⚠️ Please login first!");
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        return; 
    }

    const product = (window.productData || []).find(p => Number(p.id) === Number(productId));
    if (!product) return;

    const index = wishlist.indexOf(Number(productId));
    if (index > -1) { 
        wishlist.splice(index, 1); 
        showToastNotification(`💔 Removed: ${product.name}`);
    } else { 
        wishlist.push(Number(productId)); 
        showToastNotification(`⭐ Added to Wishlist!`);
    }

    saveWishlist();

    // Collection page par button ka color update karne ke liye
    if (typeof renderProducts === 'function' && window.productData) {
        renderProducts(window.productData);
    }
}

function moveToCart(productId) {
    if (typeof addToCart === 'function') {
        addToCart(productId); // Cart mein add karo
        wishlist = wishlist.filter(id => Number(id) !== Number(productId)); // Wishlist se hatao
        saveWishlist();
        showToastNotification("🛒 Moved to Cart!");
    }
}

// --- WISHLIST PAGE RENDER ---
function renderWishlist() {
    const tableBody = document.getElementById('wishlistTableBody');
    if (!tableBody) return;

    if (!wishlist.length) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center py-5"><h4>Your wishlist is empty. ❤️</h4><a href="collection.html" class="btn btn-dark mt-2">Go Shopping</a></td></tr>';
        return;
    }

    // Database data se match karein
    const wishlistProducts = (window.productData || []).filter(p => wishlist.includes(Number(p.id)));
    
    tableBody.innerHTML = wishlistProducts.map(product => {
        const displayPrice = product.real_price || 0;
       const imageSrc = product.image.startsWith('http') 
        ? product.image 
        : `images/${product.image}`;
    //    const imageSrc = `images/${product.image}`;


        const stockQty = parseInt(product.stock_qty) || 0;

    // --- 1. YAHAN LOGIC HAI ---
    const isOutOfStock = stockQty <= 0;
    

    //  <img src="${imageSrc}" style="width:70px; height:70px; object-fit:cover;" class="me-3 rounded shadow-sm" onerror="this.src='https://via.placeholder.com/100'"></img>
    // Agar stock nahi hai toh button disable hoga aur uska look badal jayega
    const cartButtonHtml = isOutOfStock 
        ? `<button class="btn btn-secondary btn-sm" disabled title="Out of Stock" style="cursor: not-allowed; opacity: 0.6;">
                <i class="bi bi-cart-x"></i>
           </button>` 
        : `<button class="btn btn-dark btn-sm" title="Add to Cart" onclick="moveToCart(${product.id})">
                <i class="bi bi-cart-plus"></i>
           </button>`;

        return `
        <tr>
            <td class="align-middle">
                <div class="d-flex align-items-center">
                   
                    <img src="${imageSrc}" 
                     style="width:70px; height:70px; object-fit:cover;" 
                     class="me-3 rounded shadow-sm" 
                     onerror="this.onerror=null;this.src='https://via.placeholder.com/70?text=No+Image'">
                    <div>
                        <h6 class="mb-0 fw-bold">${product.name}</h6>
                        <small class="text-muted">${product.weight_gm} gm | ${product.purity || '22'}K</small>
                        ${isOutOfStock ? '<br><span class="text-danger fw-bold" style="font-size: 10px;">OUT OF STOCK</span>' : ''}
                    </div>
                </div>
            </td>
            <td class="text-end align-middle fw-bold text-danger">
                ₹ ${Number(displayPrice).toLocaleString('en-IN')}
            </td>
            <td class="text-center align-middle">
                <div class="btn-group">
                ${cartButtonHtml}
                    
                        
                    </button>
                    <button class="btn btn-outline-danger btn-sm" title="Remove" onclick="toggleWishlist(${product.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// Initial Load
document.addEventListener('DOMContentLoaded', async () => {
    // Agar data nahi hai, toh pehle fetch hone ka wait karein
    if (!window.productData || window.productData.length === 0) {
        // common.js ka load function call ho chuka hoga
        setTimeout(renderWishlist, 1000); 
    } else {
        renderWishlist();
    }
});


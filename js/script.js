

// // --- UTILITY FUNCTIONS ---

// // Function to show custom Toast notifications (Used for login, register, cart, wishlist)
// function showToast(message, type = 'success') {
//     const toastElement = document.getElementById('loginToast');
//     const toastBody = toastElement?.querySelector('.toast-body');

//     if (!toastElement || !toastBody) {
//         console.log("Toast element not found for message: " + message);
//         return;
//     }

//     let bgColor;
//     if (type === 'success') {
//         bgColor = 'bg-success';
//     } else if (type === 'error') {
//         bgColor = 'bg-danger';
//     } else if (type === 'warning') {
//         bgColor = 'bg-warning';
//     } else {
//         bgColor = 'bg-primary';
//     }

//     toastElement.className = 'toast align-items-center text-white border-0';
//     toastElement.classList.add(bgColor);
    
//     toastBody.textContent = message;

//     const toast = new bootstrap.Toast(toastElement);
//     toast.show();
// }

// function showToastNotification(message) {
//     const toastElement = document.getElementById('cartToast');
//     const toastBody = document.getElementById('toastBody');
//     if (toastElement && toastBody) {
//         toastBody.textContent = message;
//         const toast = new bootstrap.Toast(toastElement); 
//         toast.show();
//     } else console.log("Toast not found: " + message);
// }

// // --- LOGIN & REGISTER HANDLING ---
// function handleLogin(username, password) {
//     const users = JSON.parse(localStorage.getItem('rameshUsers')) || [];
//     const normalizedUsername = username.toLowerCase();

//     const user = users.find(u => 
//         u.email.toLowerCase() === normalizedUsername && 
//         u.password === password
//     );
    
//     if (user) {
//         localStorage.setItem('isLoggedIn', 'true');
//         localStorage.setItem('loggedInUserEmail', user.email); 
//         window.location.href = 'index.html'; 
//     } else {
//         alert('Invalid Email or Password! Please check your credentials.');
//     }
// }

// function handleLogout() {
//     const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
//     logoutModal.show();
// }

// // --- CONSTANTS FOR PRICE CALCULATION (SIMULATED) ---
// const LIVE_GOLD_RATE_PER_GM = 6500; 
// const MAKING_CHARGE_PERCENT_LOW = 0.10; // Simple/Mid Design
// const MAKING_CHARGE_PERCENT_HIGH = 0.15; // Heavy Design
// const GST_RATE_PERCENT = 0.03; 

// // --- PRICE CALCULATION FUNCTION ---
// function calculateRealPrice(product) {
//     const makingChargeRate = (product.design === 'Heavy') ? MAKING_CHARGE_PERCENT_HIGH : MAKING_CHARGE_PERCENT_LOW;
    
//     let basePrice = product.weight_gm * LIVE_GOLD_RATE_PER_GM;
//     let makingCharge = basePrice * makingChargeRate;
//     let subtotal = basePrice + makingCharge;
//     let gst = subtotal * GST_RATE_PERCENT;
//     product.real_price = Math.round((subtotal + gst) / 10) * 10;
//     return product.real_price;
// }

// // --- PRODUCT DATA ---
// const productData = [
//     { id: 1, name: "Classic Plain Kada", weight_gm: 10.5, design: 'Simple', image: 'bangle-01.jpg'},
//     { id: 2, name: "Everyday Thread Bangle", weight_gm: 8.2, design: 'Simple', image: 'bangle-02.jpg' },
//     { id: 3, name: "Matte Finish Gold Bracelet", weight_gm: 12.0, design: 'Simple', image: 'bangle-03.jpg' },
//     { id: 4, name: "Sleek Line Bangle (Set of 2)", weight_gm: 15.0, design: 'Simple', image: 'bangle-04.jpg' },
//     { id: 5, name: "Twisted Rope Design Bangle", weight_gm: 9.8, design: 'Simple', image: 'bangle-05.jpg' },
//     { id: 6, name: "Diamond Cut Edge Bangle", weight_gm: 11.5, design: 'Simple', image: 'bangle-06.jpg' },
//     { id: 7, name: "Flexible Gold Mesh Bangle", weight_gm: 13.5, design: 'Simple', image: 'bangle-07.jpg' },
//     { id: 8, name: "Open Cuff Style Bangle", weight_gm: 10.1, design: 'Simple', image: 'bangle-08.jpg' },
//     { id: 9, name: "Geometric Square Bangle", weight_gm: 14.2, design: 'Simple', image: 'bangle-09.jpg' },
//     { id: 10, name: "Hammered Finish Bangle", weight_gm: 9.5, design: 'Simple', image: 'bangle-10.jpg' },
//     // 11-20: Antique & Filigree Designs (Mid Weight/Charge)
//     { id: 11, name: "Filigree Floral Bangle", weight_gm: 16.5, design: 'Mid', image: 'bangles1.jpg' },
//     { id: 12, name: "Antique Temple Design Kada", weight_gm: 20.0, design: 'Mid', image: 'bangle-12.jpg' },
//     { id: 13, name: "Peacock Motif Bangle", weight_gm: 18.8, design: 'Mid', image: 'bangle-13.jpg' },
//     { id: 14, name: "Rajwadi Engraved Bangle", weight_gm: 17.5, design: 'Mid', image: 'bangle-14.jpg' },
//     { id: 15, name: "Victorian Style Carved Bangle", weight_gm: 19.2, design: 'Mid', image: 'bangle-15.jpg' },
//     { id: 16, name: "Intricate Jaali Work Bangle", weight_gm: 15.8, design: 'Mid', image: 'bangle-16.jpg' },
//     { id: 17, name: "Ghungroo Detailed Bangle", weight_gm: 21.0, design: 'Mid', image: 'bangle-17.jpg' },
//     { id: 18, name: "Half-Round Polished Bangle", weight_gm: 14.5, design: 'Mid', image: 'bangle-18.jpg' },
//     { id: 19, name: "Meenakari Accent Bangle", weight_gm: 22.5, design: 'Mid', image: 'bangle-19.jpg' },
//     { id: 20, name: "Traditional Coin Bangle", weight_gm: 16.9, design: 'Mid', image: 'bangle-20.jpg' },
//     // 21-30: Wedding & Kundan Designs (Higher Weight/Charge)
//     { id: 21, name: "Heavy Bridal Kada", weight_gm: 25.5, design: 'Heavy', image: 'bangle-21.jpg' },
//     { id: 22, name: "Kundan Work Diamond Bangle", weight_gm: 28.0, design: 'Heavy', image: 'bangle-22.jpg' },
//     { id: 23, name: "Pachi Work Gemstone Bangle", weight_gm: 30.0, design: 'Heavy', image: 'bangle-23.jpg' },
//     { id: 24, name: "Gold Chura Set (Single Piece)", weight_gm: 32.5, design: 'Heavy', image: 'bangle-24.jpg' },
//     { id: 25, name: "Jadau Pearl Drop Kada", weight_gm: 26.8, design: 'Heavy', image: 'bangle-25.jpg' },
//     { id: 26, name: "Wide Band Engraved Kada", weight_gm: 35.0, design: 'Heavy', image: 'bangle-26.jpg' },
//     { id: 27, name: "Three-Row Filigree Bangle", weight_gm: 24.0, design: 'Heavy', image: 'bangle-27.jpg' },
//     { id: 28, name: "Emerald & Gold Inlay Bangle", weight_gm: 29.5, design: 'Heavy', image: 'bangle-28.jpg' },
//     { id: 29, name: "Ornate Ganesha Design Kada", weight_gm: 31.0, design: 'Heavy', image: 'bangle-29.jpg' },
//     { id: 30, name: "Grand Marriage Ceremony Kada", weight_gm: 33.5, design: 'Heavy', image: 'bangle-30.jpg' },
// ];

// productData.forEach(calculateRealPrice);

// // --- CART STORAGE & ACTIONS ---
// let cart = JSON.parse(localStorage.getItem('rameshJewellersCart')) || [];

// function getCartItemsFromStorage() {
//     return JSON.parse(localStorage.getItem('rameshJewellersCart')) || [];
// }

// function updateCartCount() {
//     const cartItems = getCartItemsFromStorage();
//     const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0); 
//     const cartCountElement = document.getElementById('cartItemCount'); 
    
//     if (cartCountElement) {
//         if (totalItems > 0) {
//             cartCountElement.textContent = totalItems;
//             cartCountElement.classList.remove('d-none'); 
//         } else {
//             cartCountElement.textContent = '0';
//             cartCountElement.classList.add('d-none'); 
//         }
//     }
// }


// // --- NEW: AUTH UI RENDER FUNCTION ---
// function renderAuthButtons() {
//     const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
//     const authBtnContainer = document.getElementById('authBtnContainer');

//     if (authBtnContainer) {
//         if (isLoggedIn) {
//             // Agar logged in hai, toh LOGOUT dikhao
//             authBtnContainer.innerHTML = `
//                 <a class="nav-link text-danger fw-bold" href="#" onclick="handleLogout()">
//                     <i class="bi bi-box-arrow-right"></i> LOGOUT
//                 </a>`;
//         } else {
//             // Agar logged in nahi hai, toh LOGIN dikhao
//             authBtnContainer.innerHTML = `
//                 <a class="nav-link text-primary fw-bold" href="login.html">
//                     <i class="bi bi-person-circle"></i> LOGIN
//                 </a>`;
//         }
//     }
// }



// function saveCart() {
//     localStorage.setItem('rameshJewellersCart', JSON.stringify(cart));
//     if (document.getElementById('cart-table-body')) {
//         updateCartUI();
//     }
//     updateCartCount();
// }




// function addToCart(productId) {
//     // Check if user is logged in
//     const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

//     if (!isLoggedIn) {
//         // Agar login nahi hai toh alert dikhao aur login page par bhejo
//         alert("Pehle login karein!");
//         window.location.href = 'login.html'; 
//         return;
//     }

//     // Agar login hai toh purana logic (item add karne wala)
//     const product = productData.find(p => p.id === productId);
//     const existing = cart.find(item => item.id === productId);
//     if (existing) {
//         existing.quantity += 1;
//     } else {
//         cart.push({ ...product, price: product.real_price, quantity: 1 });
//     }
//     saveCart();
//     showToastNotification(`✅ Added to cart!`);
// }


// function deleteFromCart(productId) {
//     cart = cart.filter(item => item.id !== productId);
//     saveCart();
// }

// function changeQuantity(productId, change) {
//     const item = cart.find(item => item.id === productId);
//     if (!item) return;
//     item.quantity += change;
//     if (item.quantity <= 0) deleteFromCart(productId);
//     saveCart();
// }

// function getTotal() {
//     const cartItems = getCartItemsFromStorage();
//     let subtotal = 0;
//     cartItems.forEach(item => {
//         subtotal += (item.price * item.quantity); 
//     });
    
//     const gst = subtotal * GST_RATE_PERCENT; 
//     return Math.round(subtotal + gst);
// }


// // --- WISHLIST ---
// let wishlist = JSON.parse(localStorage.getItem('rameshJewellersWishlist')) || [];

// function saveWishlist() {
//     localStorage.setItem('rameshJewellersWishlist', JSON.stringify(wishlist));
//     if (document.getElementById('wishlistTableBody')) renderWishlist();
// }

// function isWishlisted(productId) {
//     return wishlist.includes(productId);
// }

// function toggleWishlist(productId) {


//      // --- LOGIN CHECK ---
//     if (localStorage.getItem('isLoggedIn') !== 'true') {
//         alert("Please login to manage your wishlist.");
//         window.location.href = 'login.html';
//         return; // Ye aage ka code nahi chalne dega
//     }


//     const product = productData.find(p => p.id === productId);
//     if (!product) return;
//     const index = wishlist.indexOf(productId);
//     if (index > -1) { wishlist.splice(index, 1); showToastNotification(`💔 "${product.name}" removed from Wishlist.`);}
//     else { wishlist.push(productId); showToastNotification(`⭐ "${product.name}" added to Wishlist!`);}
//     saveWishlist();
//     applyFilters();
// }

// function moveToCart(productId) {
//     addToCart(productId);
//     wishlist = wishlist.filter(id => id !== productId);
//     saveWishlist();
//     showToastNotification(`🛒 Item moved to cart.`);
// }

// // --- FILTERS ---


// function getFilterSettings() {
//     const maxPrice = (document.getElementById('priceRange')?.value || 0) * 100000;
//     const selectedDesigns = [];
//     if (document.getElementById('designSimple')?.checked) selectedDesigns.push('Simple');
//     if (document.getElementById('designMid')?.checked) selectedDesigns.push('Mid');
//     if (document.getElementById('designHeavy')?.checked) selectedDesigns.push('Heavy');

//     // FIX: Nav bar ke laptop ya mobile search dono me se kisi ki bhi value uthao
//     const searchTerm = (document.getElementById('laptopSearch')?.value || 
//                         document.getElementById('mobileSearch')?.value || "").toLowerCase().trim();
                        
//     return { maxPrice, selectedDesigns, searchTerm };
// }
// // function getFilterSettings() {
// //     const maxPrice = (document.getElementById('priceRange')?.value || 0) * 100000;
// //     const selectedDesigns = [];
// //     if (document.getElementById('designSimple')?.checked) selectedDesigns.push('Simple');
// //     if (document.getElementById('designMid')?.checked) selectedDesigns.push('Mid');
// //     if (document.getElementById('designHeavy')?.checked) selectedDesigns.push('Heavy');
// //     const searchTerm = document.getElementById('productSearch')?.value.toLowerCase().trim() || '';
// //     return { maxPrice, selectedDesigns, searchTerm };
// // }

// function applyFilters() {
//     const { maxPrice, selectedDesigns, searchTerm } = getFilterSettings();
//     let filtered = productData;
//     if (searchTerm) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm) || p.design.toLowerCase().includes(searchTerm));
//     if (maxPrice) filtered = filtered.filter(p => p.real_price <= maxPrice);
//     if (selectedDesigns.length) filtered = filtered.filter(p => selectedDesigns.includes(p.design));
//     renderProducts(filtered);
// }

// function updatePriceLabel() {
//     const rangeInput = document.getElementById('priceRange');
//     const valueSpan = document.getElementById('priceValue');
//     if (rangeInput && valueSpan) valueSpan.textContent = `₹ ${(rangeInput.value*100000).toLocaleString('en-IN')}`;
// }

// // --- RENDER PRODUCTS (Collection Page) ---

// function renderProducts(productsToRender = productData) {
//     const grid = document.getElementById('productGrid');
//     if (!grid) return;

//     if (!productsToRender.length) {
//         // Realistic No Results UI
//         grid.innerHTML = `
//             <div class="col-12 text-center py-5 my-5">
//                 <div class="mb-4">
//                     <i class="bi bi-search text-muted" style="font-size: 4rem; opacity: 0.3;"></i>
//                 </div>
//                 <h3 class="fw-bold custom-logo-font">Humne Maafi Chahate Hain!</h3>
//                 <p class="text-muted">Aapne jo dhoonda humein wo nahi mila. <br> Kripya kuch aur dhoondhein ya filters saaf karein.</p>
//                 <button class="btn btn-outline-dark rounded-pill px-4 mt-3" onclick="clearAllFilters()">
//                     <i class="bi bi-x-circle me-2"></i> Clear All Filters
//                 </button>
//             </div>`;
//         return;
//     }

//     // Purana mapping code jo products dikhata hai
//     grid.innerHTML = productsToRender.map(product => {
//         const heartClass = isWishlisted(product.id) ? 'btn-warning' : 'btn-outline-warning';
//         const imagePath = `images/${product.image}`; 
        
//         return `
//             <div class="col">
//                 <div class="card product-card h-100 shadow-sm border-0">
//                     <a href="product-detail.html?id=${product.id}" class="text-decoration-none">
//                         <div class="overflow-hidden">
//                            <img src="${imagePath}" class="card-img-top product-zoom" alt="${product.name}">
//                         </div>
//                     </a>
//                     <div class="card-body text-center">
//                          <h6 class="card-title fw-bold">
//                             <a href="product-detail.html?id=${product.id}" class="text-dark text-decoration-none">${product.name}</a>
//                         </h6>
//                         <p class="card-text text-muted small mb-1">Wt: ${product.weight_gm} gm | Design: ${product.design}</p>
//                         <p class="card-text fw-bold text-danger mb-3">₹ ${product.real_price.toLocaleString('en-IN')}</p>
//                         <div class="d-flex gap-2 justify-content-center">
//                             <button class="btn btn-dark btn-sm flex-grow-1" onclick="addToCart(${product.id})">
//                                 <i class="bi bi-cart-plus"></i> Add
//                             </button>
//                             <button class="btn ${heartClass} btn-sm" onclick="toggleWishlist(${product.id})">
//                                 <i class="bi bi-heart-fill"></i>
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>`;
//     }).join('');
// }

// // Filters reset karne ke liye naya function
// function clearAllFilters() {
//     // Search inputs khali karein
//     const searchInputs = ['laptopSearch', 'mobileSearch'];
//     searchInputs.forEach(id => {
//         const el = document.getElementById(id);
//         if(el) el.value = '';
//     });

//     // Checkboxes ko wapas tick karein
//     ['designSimple', 'designMid', 'designHeavy'].forEach(id => {
//         const el = document.getElementById(id);
//         if(el) el.checked = true;
//     });

//     // Price range ko max par set karein
//     const priceRange = document.getElementById('priceRange');
//     if(priceRange) priceRange.value = 5;

//     // UI update karein
//     updatePriceLabel();
//     applyFilters(); 
// }


// // function renderProducts(productsToRender = productData) {
// //     const grid = document.getElementById('productGrid');
// //     if (!grid) return;
// //     if (!productsToRender.length) {
// //         grid.innerHTML = '<div class="col-12"><div class="alert alert-info text-center">No bangles found.</div></div>';
// //         return;
// //     }
// //     grid.innerHTML = productsToRender.map(product => {
// //         const heartClass = isWishlisted(product.id) ? 'btn-warning' : 'btn-outline-warning';
// //         const imagePath = `images/${product.image}`; 
        
// //         return `
// //             <div class="col">
// //                 <div class="card product-card h-100">
// //                     <a href="product-detail.html?id=${product.id}" class="text-decoration-none">
// //                         <img src="${imagePath}" class="card-img-top" alt="${product.name}">
// //                     </a>
// //                     <div class="card-body text-center">
// //                          <h5 class="card-title">
// //                            <a href="product-detail.html?id=${product.id}" class="text-dark">${product.name}</a>
// //                         </h5>
// //                         <p class="card-text text-muted">Wt: ${product.weight_gm} gm | Design: ${product.design}</p>
// //                         <p class="card-text fw-bold text-danger">₹ ${product.real_price.toLocaleString('en-IN')}</p>
// //                         <button class="btn btn-dark btn-sm" onclick="addToCart(${product.id})">
// //                             <i class="bi bi-cart-plus"></i> Add to Cart
// //                         </button>
// //                         <button class="btn ${heartClass} btn-sm" onclick="toggleWishlist(${product.id})"><i class="bi bi-heart-fill"></i></button>
// //                     </div>
// //                 </div>
// //             </div>`;
// //     }).join('');
// // }


// // --- NEW: PRODUCT DETAIL RENDER (product-detail.html) ---
// function renderProductDetail() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const productId = parseInt(urlParams.get('id'));

//     if (!productId) {
//         document.getElementById('productDetailContainer').innerHTML = '<p class="alert alert-danger">Product ID not found in URL.</p>';
//         return;
//     }

//     const product = productData.find(p => p.id === productId);

//     if (!product) {
//         document.getElementById('productDetailContainer').innerHTML = '<p class="alert alert-danger">Product details not found.</p>';
//         return;
//     }

//     const container = document.getElementById('productDetailContainer');
//     if (container) {
//         container.innerHTML = `
//             <div class="row">
//                 <div class="col-md-6">
//                     <img src="images/${product.image}" class="img-fluid border rounded shadow-sm" alt="${product.name}">
//                 </div>
//                 <div class="col-md-6">
//                     <h1 class="display-5">${product.name}</h1>
//                     <hr>
//                     <p class="lead fw-bold text-danger fs-3">₹ ${product.real_price.toLocaleString('en-IN')}</p>
                    
//                     <p><strong>Metal Weight:</strong> ${product.weight_gm} gm</p>
//                     <p><strong>Design Type:</strong> ${product.design}</p>
//                     <p class="small text-muted">Current Gold Rate: ₹ ${LIVE_GOLD_RATE_PER_GM.toLocaleString('en-IN')} / gm (Simulated)</p>
//                     <hr>
//                     <h4>Price Breakdown:</h4>
//                     <ul class="list-group list-group-flush mb-4">
//                         <li class="list-group-item">Base Price (Gold): ₹ ${Math.round(product.weight_gm * LIVE_GOLD_RATE_PER_GM).toLocaleString('en-IN')}</li>
//                         <li class="list-group-item">Making Charges (${product.design === 'Heavy' ? '15%' : '10%'}): ₹ ${Math.round(product.real_price - ((product.real_price / 1.03) * 1.03)).toLocaleString('en-IN')} (Approx)</li>
//                         <li class="list-group-item">GST (3%): ₹ ${Math.round((product.real_price * 3) / 103).toLocaleString('en-IN')} (Approx)</li>
//                     </ul>
//                     <hr>

//                     <button class="btn btn-lg btn-dark me-2" onclick="addToCart(${product.id})">
//                         <i class="bi bi-cart-plus"></i> Add to Cart
//                     </button>
//                     <button class="btn btn-lg ${isWishlisted(product.id) ? 'btn-warning' : 'btn-outline-warning'}" onclick="toggleWishlist(${product.id})">
//                         <i class="bi bi-heart-fill"></i> Wishlist
//                     </button>
//                 </div>
//             </div>
//         `;
//     }
// }


// // --- CART RENDER (Cart Page) ---
// function updateCartUI() {
//     const cartBody = document.getElementById('cart-table-body');
//     if (!cartBody) return;
    
//     let subtotal = 0;
//     const html = cart.map(item => {
//         const total = item.price * item.quantity;
//         subtotal += total;
//         return `<tr>
//             <td><img src="images/${item.image}" style="width:50px" class="me-2 rounded">${item.name}</td>
//             <td>₹ ${item.price.toLocaleString('en-IN')}</td>
//             <td>
//                 <div class="input-group input-group-sm w-75 mx-auto">
//                     <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(${item.id},-1)">-</button>
//                     <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
//                     <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(${item.id},1)">+</button>
//                 </div>
//             </td>
//             <td class="fw-bold">₹ ${total.toLocaleString('en-IN')}</td>
//             <td><button class="btn btn-danger btn-sm" onclick="deleteFromCart(${item.id});"><i class="bi bi-trash"></i></button></td>
//         </tr>`;
//     }).join('');
    
//     cartBody.innerHTML = html || '<tr><td colspan="5" class="text-center py-4">Your cart is empty.</td></tr>';
    
//     const gst = subtotal * GST_RATE_PERCENT;
//     const grandTotal = subtotal + gst;

//     if (document.getElementById('cart-subtotal')) document.getElementById('cart-subtotal').textContent = `₹ ${subtotal.toLocaleString('en-IN')}`;
//     if (document.getElementById('cart-tax')) document.getElementById('cart-tax').textContent = `₹ ${Math.round(gst).toLocaleString('en-IN')}`;
//     if (document.getElementById('cart-total')) document.getElementById('cart-total').textContent = `₹ ${Math.round(grandTotal).toLocaleString('en-IN')}`;
// }

// // --- WISHLIST RENDER ---
// function renderWishlist() {
//     const tableBody = document.getElementById('wishlistTableBody');
//     if (!tableBody) return;
//     if (!wishlist.length) {
//         tableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4">Your wishlist is empty.</td></tr>';
//         return;
//     }
//     const wishlistProducts = productData.filter(p => wishlist.includes(p.id));
//     tableBody.innerHTML = wishlistProducts.map(product => `
//         <tr>
//             <td><img src="images/${product.image}" style="width:60px" class="me-3 rounded"><strong>${product.name}</strong><br><small>${product.weight_gm} gm | ${product.design}</small></td>
//             <td class="text-end fw-bold text-danger">₹ ${product.real_price.toLocaleString('en-IN')}</td>
//             <td class="text-center">
//                 <button class="btn btn-dark btn-sm me-2" onclick="moveToCart(${product.id})"><i class="bi bi-cart-plus"></i></button>
//                 <button class="btn btn-outline-danger btn-sm" onclick="toggleWishlist(${product.id})"><i class="bi bi-trash"></i></button>
//             </td>
//         </tr>`).join('');
// }


// // ==============================================
// // CHECKOUT LOGIC & RENDER FUNCTIONS
// // ==============================================

// function renderCheckoutSummary() {
//     const cartItems = getCartItemsFromStorage();
//     let subtotal = 0;
    
//     const itemsList = document.getElementById('checkoutItemsList');
//     if (!itemsList) return;

//     if (cartItems.length === 0) {
//         itemsList.innerHTML = '<li class="list-group-item d-flex justify-content-between lh-sm"><div><h6 class="my-0 text-muted">Cart is empty</h6></div><span class="text-muted">₹ 0</span></li>';
//         document.getElementById('checkoutItemCount').textContent = '0';
        
//         if (document.getElementById('checkoutSubtotal')) document.getElementById('checkoutSubtotal').textContent = `₹ 0`;
//         if (document.getElementById('checkoutGST')) document.getElementById('checkoutGST').textContent = `₹ 0`;
//         if (document.getElementById('checkoutGrandTotal')) document.getElementById('checkoutGrandTotal').textContent = `₹ 0`;
        
//         return; 
//     }

//     const listHtml = cartItems.map(item => {
//         const total = item.price * item.quantity;
//         subtotal += total;
//         return `
//             <li class="list-group-item d-flex justify-content-between lh-sm">
//                 <div>
//                     <h6 class="my-0">${item.name}</h6>
//                     <small class="text-muted">Qty: ${item.quantity}</small>
//                 </div>
//                 <span class="text-muted">₹ ${total.toLocaleString('en-IN')}</span>
//             </li>
//         `;
//     }).join('');

//     const gst = subtotal * GST_RATE_PERCENT;
//     const grandTotal = subtotal + gst;

//     itemsList.innerHTML = listHtml;
    
//     const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0); 
//     document.getElementById('checkoutItemCount').textContent = totalItems;
    
//     if (document.getElementById('checkoutSubtotal')) document.getElementById('checkoutSubtotal').textContent = `₹ ${subtotal.toLocaleString('en-IN')}`;
//     if (document.getElementById('checkoutGST')) document.getElementById('checkoutGST').textContent = `₹ ${Math.round(gst).toLocaleString('en-IN')}`;
//     if (document.getElementById('checkoutGrandTotal')) document.getElementById('checkoutGrandTotal').textContent = `₹ ${Math.round(grandTotal).toLocaleString('en-IN')}`;
    
//     const userEmail = localStorage.getItem('loggedInUserEmail');
//     const emailField = document.getElementById('email');
//     if (userEmail && emailField) {
//         emailField.value = userEmail;
//         emailField.readOnly = true; 
//     }
// }


// // Function jo cart ke total amount ko calculate karta hai
// function calculateGrandTotal(cartItems) {
//     const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//     const gst = subtotal * 0.03; // 3% GST
//     return Math.round(subtotal + gst);
// }

// async function proceedToCheckoutAction() {
//     const cart = JSON.parse(localStorage.getItem('rameshJewellersCart')) || [];
//     // 'userEmail' ki jagah 'loggedInUserEmail' use karein jo aapne handleLogin mein set kiya hai
//     const userEmail = localStorage.getItem('loggedInUserEmail') || "Guest"; 

//     if (cart.length === 0) {
//         alert("Aapka cart khali hai!");
//         return;
//     }

//     const shippingDetails = {
//         firstName: document.getElementById('firstName').value,
//         lastName: document.getElementById('lastName').value,
//         mobile: document.getElementById('mobile').value,
//         address: document.getElementById('address').value,
//         city: document.getElementById('state').value, 
//         pincode: document.getElementById('pincode').value
//     };

//     const orderData = {
//         user: userEmail,
//         items: cart.map(item => ({
//             id: item.id,
//             name: item.name,
//             price: item.price,
//             quantity: item.quantity // Quantity bhi add karein
//         })),
//         total: calculateGrandTotal(cart), // Ab ye function chalega
//         shippingDetails: shippingDetails

//     };


//     try {
//         const response = await fetch('http://localhost:3000/api/orders', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(orderData)
//         });

//         const data = await response.json();

  
//         if (response.ok) {
//             localStorage.removeItem('rameshJewellersCart');
//             window.location.href = `thankyou.html?orderId=${data.orderId}`;
//         } else {
//             alert("Order fail ho gaya: " + data.error);
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         alert("Server band hai! Pehle terminal mein 'node server.js' chalayein.");
//     }
// }




// document.addEventListener('DOMContentLoaded', () => {
//     // Sabse pehle ye function chalao jo check karega ki LOGIN dikhana hai ya LOGOUT
//     if (typeof renderAuthButtons === "function") {
//         renderAuthButtons(); 
//     }

//     // 1. Agar user logged in hai aur galti se login.html par jaye toh use Home par bhej do
//     const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
//     if (isLoggedIn && window.location.pathname.includes('login.html')) {
//         window.location.href = 'index.html';
//         return;
//     }
    
//     // ... baaki ka code jo pehle se tha


//     // 2. Logout Button Listener (Updated for Phone Login)
//     const confirmBtn = document.getElementById('confirmLogoutBtn');
//     if (confirmBtn) {
//         confirmBtn.addEventListener('click', () => {
//             localStorage.removeItem('isLoggedIn');
//             localStorage.removeItem('loggedInUserEmail'); // Purana email data saaf karein
//             localStorage.removeItem('userPhone');         // Naya phone data saaf karein
            
//             const logoutModalElement = document.getElementById('logoutModal');
//             const modalInstance = bootstrap.Modal.getInstance(logoutModalElement);
//             if(modalInstance) modalInstance.hide();
            
//             window.location.href = 'index.html'; // Logout ke baad seedha Home par
//         });
//     }

//     // 3. Collection Page: Products load karein aur Filters setup karein
//     if (document.getElementById('productGrid')) {
//         renderProducts();
//         document.querySelectorAll('#filterSidebar input').forEach(el => el.addEventListener('change', applyFilters));
        
//         // Desktop aur Mobile dono search bars ke liye listener
//         const searchInputs = ['productSearch', 'laptopSearch', 'mobileSearch'];
//         searchInputs.forEach(id => {
//             document.getElementById(id)?.addEventListener('input', (e) => {
//                 const term = e.target.value;
//                 // Sabhi search boxes ko sync karein
//                 searchInputs.forEach(otherId => {
//                     const el = document.getElementById(otherId);
//                     if(el) el.value = term;
//                 });
//                 applyFilters();
//             });
//         });

//         const priceRange = document.getElementById('priceRange');
//         if (priceRange) { 
//             priceRange.addEventListener('input', updatePriceLabel); 
//             updatePriceLabel();
//         }
//     }
    
//     // 4. Product Detail Page Initialization
//     if (document.getElementById('productDetailContainer')) { 
//         renderProductDetail();
//     }
    
//     // 5. Cart Page UI Initialization
//     if (document.getElementById('cart-table-body')) { 
//         updateCartUI();
        
//         const checkoutButton = document.getElementById('proceedToCheckoutBtn');
//         if (checkoutButton) {
//             checkoutButton.addEventListener('click', (e) => {
//                 if (getCartItemsFromStorage().length === 0) {
//                      e.preventDefault();
//                      alert('Your cart is empty. Please add items before checking out.');
//                 } else if (localStorage.getItem('isLoggedIn') !== 'true') {
//                      e.preventDefault();
//                      window.location.href = 'login.html';
//                 } else {
//                      window.location.href = 'checkout.html';
//                 }
//             });
//         }
//     }
    
//     // 6. Wishlist Page UI Initialization
//     if (document.getElementById('wishlistTableBody')) {
//         renderWishlist();
//     }
    
//     // 7. Checkout Page Logic
//     const checkoutForm = document.getElementById('checkoutForm');
//     if (checkoutForm) {
//         renderCheckoutSummary(); 
//         checkoutForm.addEventListener('submit', function (event) {
//             if (!checkoutForm.checkValidity()) {
//                 event.preventDefault();
//                 event.stopPropagation();
//             } else {
//                 event.preventDefault(); 
//                 proceedToCheckoutAction(); 
//             }
//             checkoutForm.classList.add('was-validated');
//         }, false);
//     }

//     // 8. Navbar Cart Count Update (Hamesha visible rahega)
//     updateCartCount(); 
// });
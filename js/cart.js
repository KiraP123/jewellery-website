// --- Shared Logic in js/app.js ---

// Conceptual Cart Data (Stored in LocalStorage for client-side persistence)
let cart = JSON.parse(localStorage.getItem('rameshCart')) || [];

function saveCart() {
    localStorage.setItem('rameshCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    document.getElementById('cart-count').textContent = cart.length;
}

function addToCart(productId) {
    // Find the product data (conceptual lookup from a server or product array)
    const productData = products.find(p => p.id == productId); 
    if (productData) {
        cart.push({...productData, quantity: 1, finalPrice: calculatePrice(productData.weight)});
        saveCart();
        alert(`${productData.name} added to cart!`);
    }
}

// Function to handle checkout (on checkout.html)
function processCheckout() {
    // 1. Validate user is logged in (Conceptual: check server session)
    // 2. Send cart data to the backend for final order creation
    // 3. Clear cart upon successful server response
    // 4. Redirect to a 'Thank You' page.
    alert('Order placed successfully! (Conceptual Backend Process)');
    cart = [];
    saveCart();
    window.location.href = 'index.html'; // Redirect to home
}

// ... other shared functions ...

// --- Logic for Delete from Cart (in js/cart.js) ---

function deleteFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart(); // Re-render the cart items
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('empty-cart-message');
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '';
        emptyMsg.style.display = 'block';
        document.getElementById('subtotal').textContent = '₹ 0';
        document.getElementById('grand-total').textContent = '₹ 0';
        document.getElementById('gst-amount').textContent = '₹ 0';
        return;
    }
    emptyMsg.style.display = 'none';
    let cartHTML = '';

    cart.forEach(item => {
        total += item.finalPrice;
        cartHTML += `
            <div class="card mb-3 shadow-sm">
                <div class="row g-0">
                    <div class="col-md-3">
                        <img src="${item.imageUrl}" class="img-fluid rounded-start" alt="${item.name}">
                    </div>
                    <div class="col-md-6">
                        <div class="card-body">
                            <h5 class="card-title">${item.name}</h5>
                            <p class="card-text">Weight: ${item.weight} g | Final Price: **₹ ${item.finalPrice.toLocaleString('en-IN')}**</p>
                        </div>
                    </div>
                    <div class="col-md-3 d-flex align-items-center justify-content-center">
                        <button class="btn btn-danger delete-btn" data-id="${item.id}">Delete</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    const gst = total * 0.03;
    const grandTotal = total + gst;

    container.innerHTML = cartHTML;
    document.getElementById('subtotal').textContent = `₹ ${total.toLocaleString('en-IN')}`;
    document.getElementById('gst-amount').textContent = `₹ ${Math.round(gst).toLocaleString('en-IN')}`;
    document.getElementById('grand-total').textContent = `₹ ${Math.round(grandTotal).toLocaleString('en-IN')}`;

    // Attach delete listeners
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => deleteFromCart(e.target.dataset.id));
    });
}
// Initial call
updateCartCount(); 
if(document.getElementById('cart-items-container')) {
    renderCart();
}
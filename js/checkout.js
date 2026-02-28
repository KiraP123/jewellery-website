// // --- 0. SMART CONFIGURATION ---
// const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// const BASE_URL = isLocal ? "http://localhost:3000" : "https://your-backend-service.onrender.com";
// const API = `${BASE_URL}/api`;



document.addEventListener('DOMContentLoaded', () => {
    // 1. Memory se email nikalo jo login ke waqt save kiya tha
    const savedEmail = localStorage.getItem('userEmail');

    // 2. Agar email mil gaya hai
    if (savedEmail) {
        const emailBox = document.getElementById('email');
        if (emailBox) {
            // 3. HTML box mein email daal do
            emailBox.value = savedEmail;
        }
    }
});
function renderCheckoutSummary() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    let goldTotal = 0;
    let makingTotal = 0;

    const list = document.getElementById('checkoutItemsList');
    if (!list) return;

    // Items List Render
    list.innerHTML = cartItems.map(item => {
        const qty = Number(item.quantity || 1);
        const weight = parseFloat(item.weight_gm) || 0;
        const makingRate = parseFloat(item.making_charge) || 0;
        const hallmark = 53.10; // Hallmark as per your cart logic

        // Cart logic: item.price is the Gold Price
        const itemGold = Math.round(item.price) * qty;
        // Making + Hallmark calculation
        const itemMaking = (Math.round(weight * makingRate) + Math.round(hallmark)) * qty;

        goldTotal += itemGold;
        makingTotal += itemMaking;


         return `
        <li class="list-group-item d-flex justify-content-between align-items-center py-4 border-bottom px-0 bg-transparent">
            <div class="d-flex align-items-center">
                <img src="${item.image.startsWith('http') ? item.image : `${BASE_URL}/images/${item.image}`}" 
                      class="rounded border shadow-sm me-4" 
                        style="width:65px; height:65px; object-fit:cover;" 
                          onerror="this.src='https://via.placeholder.com/65'">
                
                <div>
                    <h6 class="mb-2 fw-bold text-uppercase" style="font-size: 0.9rem; letter-spacing: 0.5px;">
                        ${item.name} <span class="text-muted ms-2 small" style="font-weight:400;">x${qty}</span>
                    </h6>
                    <div class="d-flex gap-2">
                        <span class="badge bg-dark text-white px-2 py-1" style="font-size: 10px; font-weight: 300; border-radius: 3px;">
                            Weight: ${weight}g
                        </span>
                        <span class="badge border text-dark px-2 py-1" style="font-size: 10px; font-weight: 400; border-radius: 3px; background: #f8f9fa;">
                            ${item.purity || '22'}K Purity
                        </span>
                    </div>
                    <small class="badge bg-light text-dark border" fw-bold">Size: ${item.customerSize}</small>
                </div>
            </div>
            
            <div class="text-end ms-3">
                <span class="fw-bold d-block text-dark" style="font-size: 1.1rem;">
                    ₹${itemGold.toLocaleString('en-IN')}
                </span>
                <small class="text-muted text-uppercase" style="font-size: 9px; letter-spacing: 0.5px;">Gold Price</small>
            </div>
        </li>`;
    }).join('');

    // --- Calculation to Match Cart Screenshot ---
    const subtotal = goldTotal + makingTotal; // ₹3,01,645 + ₹4,370 = ₹3,06,015
    const gst = Math.round(subtotal * 0.03);   // ₹9,180 approx
    const grandTotal = subtotal + gst;        // ₹3,15,195 approx

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    // UI Updates - Ab breakdown cart jaisa dikhega
    setVal('checkoutSubtotal', `₹${goldTotal.toLocaleString('en-IN')}`); // Will show ₹3,01,645
    setVal('checkoutMaking', `+ ₹${makingTotal.toLocaleString('en-IN')}`); // Will show ₹4,370
    setVal('checkoutGST', `+ ₹${gst.toLocaleString('en-IN')}`);
    setVal('checkoutGrandTotal', `₹${grandTotal.toLocaleString('en-IN')}`);
}

async function autoFillFromDatabase() {
    // 1. Login ke waqt jo User ID save ki thi wo nikalein
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.id) return;

    try {
        // 2. Database se taza data mangwayein
        // const response = await fetch(`http://localhost:3000/api/user/profile/${userData.id}`);
        const response = await fetch(`${API}/user/profile/${userData.id}`);
        const data = await response.json();

        if (data.success) {
            // 3. Email field mein data bhar dein
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.value = data.user.email;
                emailInput.readOnly = true; // Security: User change na kar sake
                emailInput.style.background = "#f4f4f4";
            }
            
            // 4. Name aur Mobile bhi bhar sakte hain
            if(document.getElementById('firstName')) document.getElementById('firstName').value = data.user.name.split(' ')[0];
            if(document.getElementById('mobile')) document.getElementById('mobile').value = data.user.phone || '';
        }
    } catch (error) {
        console.error("Database sync failed:", error);
    }
}

// --- ORDER SUBMIT ACTION (With Validation) ---
async function proceedToCheckoutAction(event) {
    if(event) event.preventDefault(); 

    const checkoutForm = document.getElementById('checkoutForm');

    const pincodeField = document.getElementById('pincodeInput');
    const pincodeValue = pincodeField ? pincodeField.value.trim() : "";
    
    // 1. Validation Check
    if (!checkoutForm.checkValidity()) {
        checkoutForm.classList.add('was-validated'); 
        Swal.fire({
            icon: 'error',
            title: 'Details Missing!',
            text: 'please fill all the details before placing order.',
            confirmButtonColor: '#000'
        });
        return; 
    }

    const checkoutCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (checkoutCart.length === 0) {
        Swal.fire('Error', 'Your cart is empty!', 'error');
        return;
    }

    const orderBtn = document.querySelector('#checkoutForm button[type="submit"]');
    if (orderBtn) {
        orderBtn.disabled = true;
        orderBtn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Processing...`;
    }
      


const orderData = {
    customer_name: (document.getElementById('firstName')?.value || "") + " " + (document.getElementById('lastName')?.value || ""),
    user_email: document.getElementById('email')?.value || "",
    pincode: pincodeValue, 
    phone: document.getElementById('mobile')?.value || "",
    address: document.getElementById('address')?.value || "",
    // Yahan '?' lagane se code crash nahi hoga agar ID galat hai
    total_amount: (document.getElementById('checkoutGrandTotal')?.innerText || "0").replace(/[^0-9]/g, ''), 
    
    items: checkoutCart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: Number(item.quantity || item.qty || 1), 
        price: item.price,
        image: item.image,
        weight_gm: item.weight_gm || 0,
        customerSize: item.customerSize || 'N/A',
        purity: item.purity || '22K',
        making_charge: item.making_charge
    }))
};

console.log("BHAI AB TOH MESSAGE AAYEGA:", orderData);

    try {

    const response = await fetch(`${API}/place-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
});
        

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('lastOrderDetails', JSON.stringify(orderData));
            localStorage.removeItem('cart'); 
            window.location.href = `thankyou.html?orderId=${data.orderId}`;
        } else {
            Swal.fire('Failed', 'Order failed: ' + (data.error || "Unknown Error"), 'error');
            if(orderBtn) { orderBtn.disabled = false; orderBtn.innerText = "Place Order Now"; }
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire('Server Error', 'Could not connect to server.', 'error');
        if(orderBtn) { orderBtn.disabled = false; orderBtn.innerText = "Place Order Now"; }
    }
}
function calculateGrandTotal(cartItems) {
    const totals = cartItems.reduce((acc, item) => {
        const weight = parseFloat(item.weight_gm) || 0;
        const makingRate = parseFloat(item.making_charge) || 0;
        const qty = Number(item.quantity || 1);

        const gold = Math.round(Number(item.price || 0)) * qty;
        const making = Math.round(weight * makingRate) * qty; 
        
        return { gold: acc.gold + gold, making: acc.making + making };
    }, { gold: 0, making: 0 });

    const subtotal = totals.gold + totals.making;
    const gst = subtotal * 0.03;
    return Math.round(subtotal + gst);
}




document.addEventListener('DOMContentLoaded', () => {
    // 1. Checkout Summary render karein
    if (document.getElementById('checkoutItemsList')) {
        renderCheckoutSummary();
    }

    // 2. AUTO-FILL LOGIC: Database/Login se aaya data yahan bharein
    const userEmail = localStorage.getItem('userEmail'); // Aapka login wala key
    const userName = localStorage.getItem('userName');   // Agar name bhi save hai toh

    if (userEmail) {
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.value = userEmail;
            emailField.readOnly = true; // Taaki user ise badal na sake
            emailField.style.backgroundColor = "#f8f9fa"; // Premium feel
        }
    }

    // 3. Form submission listener
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', proceedToCheckoutAction);
    }
});

async function handlePincodeInput() {
    const pinValue = document.getElementById('pincodeInput').value;
    const stateField = document.getElementById('stateInput');
    const countryField = document.getElementById('countryInput');

    console.log("Typing Pincode...", pinValue); // Check karein console mein ye aa raha hai?

    // Jab exact 6 digit ho jayein
    if (pinValue.length === 6) {
        console.log("6 Digits reached! Fetching data...");
        
        try {
            // India Post ki official free API
            const response = await fetch(`https://api.postalpincode.in/pincode/${pinValue}`);
            const data = await response.json();

            console.log("API Response:", data); // Check karein data aaya ya nahi

            if (data[0].Status === "Success") {
                const details = data[0].PostOffice[0];
                
                // Fields Update karna
                stateField.value = details.State;
                countryField.value = "India";
                
                console.log("Successfully updated to:", details.State);
            } else {
                console.log("Pincode not found in Database");
                alert("Pincode sahi nahi hai!");
            }
        } catch (error) {
            console.error("API Fetch Error:", error);
            alert("Network issue! API kaam nahi kar rahi.");
        }
    }
}


function selectPremiumPayment(method) {
    // 1. Uncheck all and remove classes
    document.querySelectorAll('.payment-label').forEach(el => {
        el.classList.remove('active-method');
    });

    // 2. Add class to selected
    const activeLabel = document.getElementById(`label-${method}`);
    const radioBtn = document.getElementById(method);
    
    if (activeLabel && radioBtn) {
        activeLabel.classList.add('active-method');
        radioBtn.checked = true;
    }
}

// Function: Details ko Browser memory mein save karne ke liye
function saveDataLocally() {
    const saveBtn = document.getElementById('saveAddressBtn'); // Niche di gayi button ki ID
    
    const customerData = {
        fName: document.getElementById('firstName').value,
        lName: document.getElementById('lastName').value,
        mobile: document.getElementById('mobile').value,
        email: document.getElementById('email').value,
        addr1: document.getElementById('address').value,
        addr2: document.getElementById('address2').value,
        country: document.getElementById('countryInput').value,
        state: document.getElementById('stateInput').value,
        pin: document.getElementById('pincodeInput').value
    };

    // Save to LocalStorage
    localStorage.setItem('rj_customer_details', JSON.stringify(customerData));

    // Button Animation: Green and Change Text (No Alert)
    saveBtn.classList.replace('btn-dark', 'btn-success');
    saveBtn.innerHTML = '✓ Details Saved';
    saveBtn.style.fontWeight = 'bold';

    // 3 Seconds baad wapas normal kar dena (optional)
    setTimeout(() => {
        saveBtn.classList.replace('btn-success', 'btn-dark');
        saveBtn.innerHTML = 'Save Address';
        checkSavedAddress(); // Button dikhane ke liye check karein
    }, 3000);
}

// Function: Saved data ko form mein wapas bharne ke liye
function loadSavedAddress() {
    const savedData = localStorage.getItem('rj_customer_details');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        document.getElementById('firstName').value = data.fName || '';
        document.getElementById('lastName').value = data.lName || '';
        document.getElementById('mobile').value = data.mobile || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('address').value = data.addr1 || '';
        document.getElementById('address2').value = data.addr2 || '';
        document.getElementById('countryInput').value = data.country || 'India';
        document.getElementById('stateInput').value = data.state || '';
        document.getElementById('pincodeInput').value = data.pin || '';
    }
}

// Function: Page load par check karega ki data hai ya nahi
function checkSavedAddress() {
    const quickSelect = document.getElementById('quickSelectContainer');
    if (localStorage.getItem('rj_customer_details')) {
        quickSelect.style.display = 'block';
    }
}

// Toggle Office Info Box
function toggleOfficeInfo(show) {
    document.getElementById('officeAddressBox').style.display = show ? 'block' : 'none';
}
// Page load hote hi check karein
window.addEventListener('DOMContentLoaded', checkSavedAddress);


document.addEventListener('DOMContentLoaded', () => {
    updateCheckoutBadge();
});

function updateCheckoutBadge() {
    // LocalStorage se cart data nikalein
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const badge = document.getElementById('checkoutItemCount');
    
    if (badge) {
        // .length ka matlab hai kitne alag-alag items cart array mein hain
        const uniqueItemsCount = cart.length;
        
        // Count update karein
        badge.innerText = uniqueItemsCount;
        
        // Agar cart khali hai toh badge ka color change ya hide kar sakte hain
        if (uniqueItemsCount === 0) {
            badge.style.display = "none"; // Khali hone par hide ho jayega
        } else {
            badge.style.display = "inline-block";
        }
    }
}
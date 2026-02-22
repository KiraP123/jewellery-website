// Localhost hata kar Render ka link dal diya
const BASE_URL = "https://jewellery-website-f9tx.onrender.com";
const API = `${BASE_URL}/api`;

console.log("Connecting to Live API at:", API);



// const API = "http://127.0.0.1:3000/api"; 
// const BASE_URL = "http://127.0.0.1:3000/api"; 
// // localhost ki jagah 127.0.0.1 likh kar dekho


// Login check: Ensure user is logged in
if (sessionStorage.getItem('ownerLoggedIn') !== 'true') {
    window.location.href = "admin_login.html";
}




// FIX: Page refresh hone par database se data fetch karne ka logic
    document.addEventListener('DOMContentLoaded', () => {
        // Aapke admin.js ke original functions ko call kar rahe hain
        if (typeof fetchDashboardStats === "function") fetchDashboardStats();
        if (typeof fetchInventory === "function") fetchInventory();
        if (typeof fetchOrders === "function") fetchOrders();
        if (typeof fetchSalesReport === "function") fetchSalesReport(); // Yeh Sales Report fix karega
        if (typeof fetchEnquiries === "function") fetchEnquiries();
        if (typeof loadRates === "function") loadRates();
    });


// Sidebar aur Navigation ka wahi logic jo upar diya tha
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const menuIcon = document.getElementById('menuIcon');
        
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
        
        if(sidebar.classList.contains('show')) {
            menuIcon.classList.replace('bi-list', 'bi-x-lg');
        } else {
            menuIcon.classList.replace('bi-x-lg', 'bi-list');
        }
    }

function showPage(pageId, element) {
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    if (element) element.classList.add('active');
    
    // Agar Reports page open ho toh data fetch karo
    if(pageId === 'reports') {
        loadSalesReport();
    }

    if(window.innerWidth < 992 && document.getElementById('sidebar')?.classList.contains('show')) {
        toggleSidebar();
    }
}


// Logout function
function logout() {
    sessionStorage.removeItem('ownerLoggedIn');
    window.location.href = "admin_login.html";
}

// Gold rate calculation logic
document.getElementById('r995')?.addEventListener('input', function() {
    const base = parseFloat(this.value) || 0;
    document.getElementById('r916').value = Math.round(base * 0.916);
    document.getElementById('r750').value = Math.round(base * 0.750);
});

// Table search filter
function filterTable(tableId, query) {
    const rows = document.querySelectorAll(`#${tableId} tr`);
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(query.toLowerCase()) ? "" : "none";
    });
}

// Update Gold Rates to Database
async function updateRates() {
    const btn = event.target; 
    const originalText = btn.innerText;
    btn.innerText = "Updating...";
    const data = { 
        r995: document.getElementById('r995').value, 
        r916: document.getElementById('r916').value, 
        r750: document.getElementById('r750').value 
    };
    try {
        const res = await fetch(`${API}/update-rates`, {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(data) 
        });
        if(res.ok) { 
            Swal.fire('Success', 'Rates Updated!', 'success'); 
            fetchAll(); 
        }
    } catch(e) { 
        Swal.fire('Error', 'Failed!', 'error'); 
    } finally { 
        btn.innerText = originalText; 
    }
}



// Delete function for Products and Orders (English Version)
async function deleteItem(type, id) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you really want to delete this ${type === 'products' ? 'Product' : 'Order'}? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch(`${API}/${type}/${id}`, { 
                method: 'DELETE' 
            });

            if (res.ok) {
                await Swal.fire(
                    'Deleted!',
                    `The ${type === 'products' ? 'Product' : 'Order'} has been successfully deleted.`,
                    'success'
                );
                // Refresh the table to show updated data
                fetchAll(); 
            } else {
                Swal.fire('Error', 'Failed to delete the item. There might be a server issue.', 'error');
            }
        } catch (error) {
            console.error("Delete Error:", error);
            Swal.fire('Error', 'Unable to connect to the server. Please try again later.', 'error');
        }
    }
}


async function fetchAll() {
    try {
        // 1. Data mangwana (Products, Rates aur Orders)
        const pRes = await fetch(`${API}/products`);
        const pData = await pRes.json();
        const products = pData.products || [];
        const rates = pData.rates || {};

        const oRes = await fetch(`${API}/orders`);
        const orders = await oRes.json();

        // 2. Dashboard Stats Update
        document.getElementById('totalProducts').innerText = products.length;
        document.getElementById('totalOrders').innerText = orders.length;


        // ✨ YE WALI 4 LINES ADD KARO ✨
const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;
if(document.getElementById('cancelledOrdersCount')) {
    document.getElementById('cancelledOrdersCount').innerText = cancelledCount;
}

        document.getElementById('r995').value = rates.rate_995 || 0;
        document.getElementById('r916').value = rates.rate_916 || 0;
        document.getElementById('r750').value = rates.rate_750 || 0;

   
        





        document.getElementById('productTableBody').innerHTML = products.map(p => {
    let currentRate = (p.purity === '916') ? rates.rate_916 : (p.purity === '750') ? rates.rate_750 : rates.rate_995;
    const weight = parseFloat(p.weight_gm) || 0;
    const makingPerGram = parseFloat(p.making_charge) || 0;
    const pureGoldValue = Math.round(weight * currentRate);
    const totalMaking = Math.round(weight * makingPerGram);
    const stockQty = parseInt(p.stock_qty) || 0;
    const isChecked = p.is_limited_offer === 1 ? 'checked' : '';

    return `<tr>
      <td><img src="${BASE_URL}/images/${p.image}" class="product-img border" style="width:50px; height:50px; object-fit:cover;"></td>
        <td><b>${p.name}</b></td>
        <td><span class="badge bg-dark">${p.purity}K</span></td>
        
        <td>
            <input type="number" step="0.01" id="w-input-${p.id}" 
                class="form-control form-control-sm fw-bold border-2" 
                style="width: 80px;" value="${weight}">
        </td>

        <td>
            <input type="number" id="s-input-${p.id}" 
                class="form-control form-control-sm text-center fw-bold border-2 ${stockQty <= 0 ? 'border-danger text-danger' : 'border-success text-success'}" 
                style="width: 70px;" value="${stockQty}">
        </td>

        <td>${p.size || 'N/A'}</td>
        <td class="text-primary small">₹${makingPerGram}/gm<br><b>(₹${totalMaking.toLocaleString('en-IN')})</b></td>
        <td class="text-success fw-bold">₹${pureGoldValue.toLocaleString('en-IN')}</td>
        <td>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" onchange="toggleOfferStatus(${p.id}, this.checked)" ${isChecked}>
            </div>
        </td>

        <td class="text-center">
            <div class="d-flex gap-2 justify-content-center">
                <button class="btn btn-sm btn-primary" title="Update Row" id="btn-upd-${p.id}" onclick="saveRowUpdate(${p.id})">
                    <i class="bi bi-cloud-arrow-up"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Delete" onclick="deleteItem('products', ${p.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    </tr>`;
}).join('');

  // 4. Orders Table Render
const orderTable = document.getElementById('adminOrderTable');
if (orderTable) {
    let totalSalesAmount = 0;
    const hallmarkFee = 53.10;

    if (orders.length === 0) {
        orderTable.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No orders found.</td></tr>`;
    } else {
        orderTable.innerHTML = orders.map(order => {
            // Logic to match your 'Correct' view price:
            // Convert to number, add hallmark, and use Math.round to match the view
            const rawAmount = parseFloat(order.total_amount || 0);
            const finalAmount = Math.round(rawAmount + hallmarkFee);

            // Update the running total for Gross Sales
            totalSalesAmount += finalAmount;

// --- fetchAll ke andar orders.map ke shuruat mein ye dalo ---

const currentStatus = order.status || "Order Confirm";
const displayID = order.custom_order_id ? `#RJ${order.custom_order_id}` : `#RJ${100000 + order.id}`;
const isDelivered = currentStatus === 'Delivered';



// --- 1. Ye logic return se pehle dalo ---
const oDate = order.created_at ? new Date(order.created_at) : new Date();
const userPin = String(order.pincode || "").trim();

const getDeliveryDate = (days) => {
    let d = new Date(oDate);
    d.setDate(d.getDate() + days);
    if(d.getDay() === 0) d.setDate(d.getDate() + 1); // Sunday skip
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

let expectedDay = "";
// Mumbai/Thane Pincodes (1-2 days)
if (["400067", "400064", "400091", "400092", "400097", "400095"].includes(userPin)) {
    expectedDay = getDeliveryDate(1); 
} else if (userPin.startsWith('400') || userPin.startsWith('401')) {
    expectedDay = getDeliveryDate(2);
} else {
    expectedDay = getDeliveryDate(6); // Outstation
}

   return `
    <tr class="${currentStatus === 'Cancelled' ? 'table-danger' : ''}" style="vertical-align: middle; transition: all 0.3s ease;">
        <td>
            <span class="badge bg-light text-dark border shadow-sm px-2 py-2" style="font-family: monospace; font-size: 0.9rem;">
                ${displayID}
            </span>
        </td>

        <td class="text-muted" style="font-size: 0.85rem;">
            <i class="bi bi-calendar3 me-1"></i> ${new Date(order.created_at).toLocaleDateString('en-IN')}
        </td>

        <td>
            <div class="d-flex flex-column">
                <span class="fw-bold text-dark" style="font-size: 0.95rem;">${order.customer_name}</span>
                <span class="text-muted small"><i class="bi bi-telephone me-1"></i>${order.phone || 'No Phone'}</span>
            </div>
        </td>

        <td>
            <span class="fw-bold text-dark">₹${finalAmount.toLocaleString('en-IN')}</span>
        </td>

        <td class="text-center">
            ${currentStatus === 'Cancelled' 
                ? '<span class="badge bg-danger shadow-sm px-2 py-2" style="font-size: 0.75rem;"><i class="bi bi-x-circle me-1"></i>CANCELLED</span>' 
                : '<span class="badge bg-success shadow-sm px-2 py-2" style="font-size: 0.75rem;"><i class="bi bi-check-circle me-1"></i>CONFIRMED</span>'
            }
        </td>


<td>
    <div class="status-container" style="max-width: 180px;">
        <select id="status_${order.id}" class="form-select form-select-sm mb-2 border-gold-subtle" 
                ${isDelivered ? 'disabled' : ''} 
                style="border-radius: 6px; font-weight: 600; cursor: pointer; 
                ${currentStatus === 'Cancelled' ? 'background-color: #f8d7da;' : isDelivered ? 'background-color: #e9ecef;' : 'background-color: #f0fdf4;'}">
            
            <option value="Order Confirm" ${order.status === 'Order Confirm' ? 'selected' : ''}>💎 Order Confirm</option>
            <option value="Quality Check" ${order.status === 'Quality Check' ? 'selected' : ''}>🔍 Quality Check</option>
            <option value="Insured Transit" ${order.status === 'Insured Transit' ? 'selected' : ''}>🔐 Insured Transit</option>
            <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>🛵 Out for Delivery</option>
            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>✅ Delivered</option>
            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
        </select>
        
        <div class="input-group input-group-sm">
            <span class="input-group-text bg-white border-end-0" style="font-size: 0.75rem;"><i class="bi bi-truck"></i></span>
            <input type="text" id="track_${order.id}" class="form-control form-control-sm border-start-0" 
                   ${isDelivered ? 'disabled' : ''}
                   placeholder="Tracking ID" value="${order.tracking_id || ''}" style="font-size: 0.8rem;">
        </div>
    </div>
</td>

<td class="text-center">
            <span class="badge ${currentStatus === 'Cancelled' ? 'bg-secondary' : 'bg-primary'} p-2" style="font-size: 0.8rem;">
                <i class="bi bi-truck"></i> ${currentStatus === 'Cancelled' ? 'N/A' : expectedDay}
            </span>
        </td>

        <td class="text-center">
            <div class="d-flex justify-content-center gap-2">
               <button id="btn_${order.id}" 
                class="btn btn-sm shadow-sm ${isDelivered ? 'btn-danger' : 'btn-success'}" 
                onclick="handleAction(${order.id}, '${order.status}')">
            <i class="bi ${isDelivered ? 'bi-unlock-fill' : 'bi-save'} me-1"></i> 
            ${isDelivered ? 'Unlock' : 'Save'}
        </button>
                
                <button class="btn btn-sm btn-info text-white shadow-sm" onclick='viewOrderDetails(${JSON.stringify(order)})' title="View Details">
                    <i class="bi bi-eye"></i>
                </button>


${(() => {
    const phone = order.phone || '';
    const name = order.customer_name || 'Customer';
    const orderID = displayID;
    const tracking = order.tracking_id || '';
    
    let message = "";
    let btnClass = "btn-success";

    // --- Dynamic Professional Messages for Each Status ---
    if (currentStatus === 'Order Confirm') {
        message = `*Order Confirmed!* 🎉\n\n` +
                  `Hey ${name},\n\n` +
                  `We have successfully received your order *${orderID}* and will ship it to you within 24-48 hours.\n\n` +
                  `We'll share an order tracking link *as soon as the order is shipped*.\n\n` +
                  `Thank you for choosing *Ramesh Jewellers*!`;
    } 
    else if (currentStatus === 'Quality Check') {
        message = `*Quality Check in Progress* 🔍\n\n` +
                  `Hey ${name},\n\n` +
                  `Your order *${orderID}* is currently undergoing a strict quality inspection to ensure everything is perfect before dispatch.\n\n` +
                  `We believe in delivering only the best to you. We'll update you once it passes the check! ✨\n\n` +
                  `*Ramesh Jewellers*`;
    } 
    else if (currentStatus === 'Insured Transit') {
        message = `*In Insured Transit* 🔐\n\n` +
                  `Hey ${name},\n\n` +
                  `Great news! Your order *${orderID}* has been handed over to our secure logistics partner.\n\n` +
                  `Your package is fully insured for your peace of mind. ${tracking ? '\n*Tracking ID:* ' + tracking : ''}\n\n` +
                  `Thank you for your patience!\n*Ramesh Jewellers*`;
    } 
    else if (currentStatus === 'Out for Delivery') {
        message = `*Out for Delivery* 🛵\n\n` +
                  `Hey ${name},\n\n` +
                  `Your order *${orderID}* is out for delivery and will reach you Soon!\n\n` +
                  `Please ensure someone is available at the address to receive your package.\n\n` +
                  `Enjoy your new jewellery! ✨\n*Ramesh Jewellers*`;
    } 
    else if (currentStatus === 'Delivered') {
        message = `*Order Delivered!* ✅\n\n` +
                  `Hey ${name},\n\n` +
                  `Your order *${orderID}* has been successfully delivered. We hope you love your new jewellery as much as we loved making it for you!\n\n` +
                  `We would love to hear your feedback. See you again soon!\n\n` +
                  `*Team Ramesh Jewellers*`;
    } 
    else if (currentStatus === 'Cancelled') {
        message = `*Order Cancelled* ❌\n\n` +
                  `Dear ${name},\n\n` +
                  `We regret to inform you that your order *${orderID}* has been cancelled.\n\n` +
                  `If this was a mistake or you need help with a refund, please contact our support team immediately.\n\n` +
                  `We apologize for the inconvenience.\n*Ramesh Jewellers*`;
        btnClass = "btn-danger";
    } 
    else {
        message = `*Order Update* ✨\n\n` +
                  `Hey ${name},\n\n` +
                  `The status of your order *${orderID}* has been updated to: *${currentStatus}*.\n\n` +
                  `Thank you for shopping with *Ramesh Jewellers*!`;
    }

    return `<a href="https://wa.me/91${phone}?text=${encodeURIComponent(message)}" target="_blank" class="btn btn-sm ${btnClass} shadow-sm"><i class="bi bi-whatsapp"></i></a>`;
})()}

                
                <button class="btn btn-sm btn-outline-danger shadow-sm" onclick="deleteItem('orders', ${order.id})" title="Delete Order">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    </tr>`;
        }).join('');
    }
    // Update the Dashboard card with the synchronized total
    document.getElementById('totalSales').innerText = `₹ ${Math.round(totalSalesAmount).toLocaleString('en-IN')}`;
}
        // fetchEnquiries();
    } catch (err) { 
        console.error("❌ Error loading dashboard data:", err); 
    }




    document.getElementById('uploadCarouselForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        // YAHAN CHANGE HAI: '/update-carousel' ko '/carousel' kar diya
        const response = await fetch(`${API}/carousel`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            Swal.fire('Success', 'Carousel Live on Cloudinary!', 'success');
            // Upload ke baad 2 second rukh kar page reload kar do taaki nayi image dikhe
            setTimeout(() => window.location.reload(), 2000);
        } else {
            Swal.fire('Error', result.error || 'Upload failed', 'error');
        }
    } catch (err) {
        console.error("Upload Error:", err);
        Swal.fire('Error', 'Server connection failed', 'error');
    }
});
    // Carousel Form Handle karna
// document.getElementById('uploadCarouselForm')?.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);

//     try {
//        const response = await fetch(`${API}/update-carousel`, {
//         // const response = await fetch(`${API}/update-carousel`, {
//             method: 'POST',
//             body: formData
//         });

//         const result = await response.json();
//         if (result.success) {
//             Swal.fire('Success', 'Carousel Updated!', 'success');
//             // Agar aapne preview function banaya hai toh loadCarouselPreview() call karein
//         }
//     } catch (err) {
//         Swal.fire('Error', 'Failed to upload', 'error');
//     }
// });
}



// Add Product form handler (Fixed)
const addProdForm = document.getElementById('addProdForm');
if (addProdForm) {
    addProdForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);

        
        // const isLimited = document.getElementById('isLimitedOffer').checked ? 1 : 0;
        const isLimited = document.getElementById('isLimitedOffer')?.checked ? 1 : 0;
        formData.append('is_limited_offer', isLimited);

        try {
            // NOTE: Headers mat dalo, browser khud boundary set karega
            const res = await fetch(`${API}/products`, { 
                method: 'POST', 
                body: formData 
            });

            if(res.ok) { 
                Swal.fire('Success', 'Product added!', 'success'); 
                fetchAll(); 
                e.target.reset(); 
                bootstrap.Modal.getInstance(document.getElementById('addProdModal')).hide(); 
            } else {
                const errorText = await res.text(); // Error details dekhne ke liye
                console.error("Server Response:", errorText);
                Swal.fire('Error', 'Server Error: Failed', 'error');
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            Swal.fire('Error', 'Connection failed!', 'error');
        }
    };
}

// Detailed Order View Modal Logic
function viewOrderDetails(order) {
    const displayID = order.custom_order_id ? `#RJ${order.custom_order_id}` : `#RJ${100000 + order.id}`;
    document.getElementById('modalOrderID').innerText = `Order ID: ${displayID}`;
    // document.getElementById('modalOrderID').innerText = `Order ID: #RJ976432177${order.id}`;
    const orderDate = order.created_at ? new Date(order.created_at).toLocaleString('en-IN') : 'N/A';
    document.getElementById('modalOrderDate').innerText = `Date: ${orderDate}`;
    document.getElementById('custName').innerText = order.customer_name;
    const gmailEl = document.getElementById('custGmail') || document.querySelector('[id*="Gmail"]');
    if(gmailEl) gmailEl.innerText = order.customer_email || 'N/A';
    document.getElementById('custPhone').innerText = order.customer_phone || order.phone || 'N/A';
    document.getElementById('custAddress').innerText = order.customer_address || order.address || 'Pickup';



    // ✨ YE WALI LINE ADD KARO PINCODE KE LIYE ✨
    const pinEl = document.getElementById('custPin');
    if(pinEl) pinEl.innerText = order.pincode || 'N/A';

    const gmailElement = document.getElementById('custGmail');
    if (gmailElement) {
        // Aapke database mein column ka naam 'customer_email' hai ya 'user_email', dono check karega
        gmailElement.innerText = order.customer_email || order.user_email || 'N/A';
    }
    

    const items = JSON.parse(order.items);
    let pureGoldTotal = 0;
    let totalMakingCharges = 0;

    document.getElementById('modalItemList').innerHTML = items.map(item => {
        const qty = Number(item.quantity || 1);
        const weight = parseFloat(item.weight_gm || 0);
        const makingRate = parseFloat(item.making_charge || 0);
        const purity = item.purity ||'NO'; // Caret value
        const realSize = item.size ||'NO'; // Admin ki real size
        const singleItemGoldPrice = Math.round(Number(item.price || 0)); // Single piece gold rate
       
        
        // Gold Price bina making ke
        const itemGoldPriceTotal = Math.round(Number(item.price || 0)); 
        // const itemMakingTotal = Math.round(weight * makingRate) * qty;
        const itemMakingTotal = (Math.round(weight * makingRate) + Math.round(53.10)) * qty; 

        pureGoldTotal += (itemGoldPriceTotal * qty);
        totalMakingCharges += itemMakingTotal;
        //  <span class="fw-bold ">Size: ${item.customerSize}</span>
        return `
            <div class="p-3 mb-2 bg-white rounded-3 border shadow-sm text-dark">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1 fw-bold text-dark text-uppercase">${item.name} <span class="text-muted small">X${qty}</span></h6>
                        <div class="small mb-2 py-1 px-2 rounded-2" style="background: #f8f9fa; border-left: 3px solid #4a1d1f;">
                        <span class="fw-bold text-dark">Unit Price: ₹${singleItemGoldPrice.toLocaleString('en-IN')}</span>
                        <span class="mx-2 text-muted">|</span>
                        <span class="fw-bold">Size: ${item.customerSize || 'N/A'}</span>


                        <div class="small mb-1 text-dark">
                             Weight: ${weight}g | Purity: ${purity}K 
                             
                        </div>
                    </div>
                        <div class="mt-1">
                            <div class="text-dark small">Making:₹${makingRate}/gm (+ ₹${itemMakingTotal.toLocaleString('en-IN')})</div>
                        </div>
                    </div>
                    <div class="text-end">
                        <span class="fw-bold text-dark h6">₹${(itemGoldPriceTotal * qty).toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>`;
    }).join('');

    const subtotal = pureGoldTotal + totalMakingCharges;
    const gstAmount = Math.round(subtotal * 0.03); 
    const totalAmount = subtotal + gstAmount;

    // Summary Section (All Black except Grand Total)
    document.getElementById('modalItemList').innerHTML += `
        <div class="mt-3 p-3 bg-white rounded-4 border shadow-sm text-dark">
            <div class="d-flex justify-content-between mb-2">
                <span class="text-dark small">Gold Total:</span>
                <span class="fw-bold text-dark small">₹${pureGoldTotal.toLocaleString('en-IN')}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span class="text-dark small">Making & Services(+):</span>
                <span class="fw-bold text-dark small">+ ₹${totalMakingCharges.toLocaleString('en-IN')}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span class="text-dark small">GST (3%) (+):</span>
                <span class="fw-bold text-dark small">+ ₹${gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <hr class="text-dark">
            <div class="d-flex justify-content-between align-items-center fw-bold">
                <span class="h5 mb-0 text-dark">Grand Total:</span>
                <span class="text-danger h4 mb-0">₹${totalAmount.toLocaleString('en-IN')}</span>
            </div>
        </div>`;
        
    const viewModal = new bootstrap.Modal(document.getElementById('orderViewModal'));
    viewModal.show();
}

async function updateAdminPass() {
    const oldPass = document.getElementById('oldPass').value;
    const newUser = document.getElementById('newAdminUser').value;
    const newPass = document.getElementById('newAdminPass').value;

    if(!oldPass || !newUser || !newPass) {
        return Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'All fields are mandatory!', confirmButtonColor: '#a0845a' });
    }

    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Updating...`;
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/admin/change-password`, {
                // const res = await fetch(`${API}/api/admin/change-password`, {
                // const res = await fetch(`${API}/admin/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPass, newUser, newPass })
        });
        const data = await res.json();
        if (data.success) {
            Swal.fire({ icon: 'success', title: 'Access Updated', text: 'New Master Credentials are now active!', confirmButtonColor: '#a0845a' });
            document.querySelectorAll('#settings input').forEach(i => i.value = "");
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch (e) {
        Swal.fire('Connection Error', 'Server is not responding!', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}


// Excel Export Logic
function downloadExcel() {
    // Sabse pehle check karein ki library load hui hai ya nahi
    if (typeof XLSX === 'undefined') {
        return Swal.fire({
            icon: 'error',
            title: 'Library Missing',
            text: 'Excel library load nahi hui hai. Kripya internet check karein ya script add karein.'
        });
    }

    if (currentSalesData.length === 0) {
        return Swal.fire('No Data', 'Export karne ke liye koi data nahi mila.', 'info');
    }
    
    try {
        // Data ko clean karke sheet banana (Optional: aap columns filter bhi kar sakte hain)
        const ws = XLSX.utils.json_to_sheet(currentSalesData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sales_Report");
        
        // File save karna
        XLSX.writeFile(wb, `RJ_Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        Swal.fire('Success', 'Excel file download ho gayi hai!', 'success');
    } catch (e) {
        console.error(e);
        Swal.fire('Error', 'Excel file banane mein problem hui: ' + e.message, 'error');
    }
}

// Run on page load
const currentTimeEl = document.getElementById('currentTime');
if (currentTimeEl) {
    currentTimeEl.innerText = new Date().toLocaleDateString('en-IN', {weekday: 'long', day:'2-digit', month:'long'});
}

// Toggle Offer Status in Database
async function toggleOfferStatus(id, isChecked) {
    const status = isChecked ? 1 : 0;
    try {
        const res = await fetch(`${API}/products/toggle-offer/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_limited_offer: status })
        });
        
        if (res.ok) {
            console.log("Offer status updated!");
        } else {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    } catch (err) {
        console.error("Update Error:", err);
    }
}
async function fetchEnquiries() {
    try {
        const response = await fetch(`${API}/admin/enquiries`);
        // const response = await fetch(`${API}/admin/enquiries`);
        if (!response.ok) throw new Error('Server not responding');
        
        const data = await response.json();
        
        const badge = document.getElementById('enquiryBadge');
        if(badge) badge.innerText = data.length;

        const tableBody = document.getElementById('enquiryTableBody');
        if(!tableBody) return;

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <dotlottie-wc src="https://lottie.host/37052c92-e422-442d-8b43-838e759d09d7/1vVI21Qwy1.lottie" 
                            style="width: 200px; height: 200px; margin: 0 auto;" autoplay loop></dotlottie-wc>
                        <p class="text-muted mt-2">No enquiries found at the moment.</p>
                    </td>
                </tr>`;
            return;
        }

        tableBody.innerHTML = data.map(item => {
    const hasMessage = item.message && item.message.length > 0;
    
    // 1. Advance logic for 'Other' status and colors
    const isCustomReq = !['Pending', 'Meeting Fixed', 'Completed'].includes(item.status);
    const statusColor = item.status === 'Completed' ? '#198754' : 
                        item.status === 'Meeting Fixed' ? '#0dcaf0' : 
                        isCustomReq ? '#dc3545' : '#6c757d';
    
     // Smart WhatsApp Message (Hindi-English Mix)
    const waText = isCustomReq 
        ? `Hello ${item.name} ji, Ramesh Jewellers se. Humne aapki special request "${item.status}" dekhi. Is baare mein kab baat kar sakte hain? We'd love to discuss this with you.`
        : `Hello ${item.name} ji, thank you for contacting Ramesh Jewellers. Aapki ${item.subject} enquiry ka status abhi "${item.status}" update hua hai. Let us know if you need any help!`;

    return `
    <tr class="align-middle border-bottom shadow-hover">
        <td class="ps-3" data-label="Date">
            <div class="small fw-bold">${new Date(item.created_at).toLocaleDateString('en-GB')}</div>
        </td>
        <td data-label="Customer">
            <div class="fw-bold text-uppercase small" style="color: #a0845a;">${item.name}</div>
            <div class="text-muted" style="font-size: 11px;"><i class="bi bi-phone"></i> ${item.phone}</div>
        </td>

        <td data-label="Purpose">
            ${(() => {
                const subject = item.subject;
                const colorMap = {
                    'New Purchase': { class: 'bg-success-soft text-success', icon: 'bi-gem' },
                    'Custom Order': { class: 'bg-info-soft text-info', icon: 'bi-palette' },
                    'B2B Meeting': { class: 'bg-primary-soft text-primary', icon: 'bi-people' },
                    'Repair/Exchange': { class: 'bg-warning-soft text-warning', icon: 'bi-arrow-repeat' }
                };
                const config = colorMap[subject] || { class: 'bg-secondary-soft text-dark', icon: 'bi-pencil-square' };
                return `<span class="badge ${config.class} border px-2 rounded-pill" style="font-size: 10px;">
                            <i class="bi ${config.icon} me-1"></i> ${subject}
                        </span>`;
            })()}
        </td>
        
        <td data-label="Message" class="text-center">
            ${hasMessage ? `
                <button onclick="showFullMessage('${item.name}', \`${item.message.replace(/`/g, "\\`").replace(/\n/g, "<br>")}\`)" 
                        class="btn btn-outline-warning btn-sm rounded-circle shadow-sm" 
                        style="width: 32px; height: 32px; padding: 0; border-color: #a0845a; color: #a0845a;">
                    <i class="bi bi-chat-left-text"></i>
                </button>
            ` : '<span class="text-muted">-</span>'}
        </td>

        <td data-label="Status">
            ${!isCustomReq ? `
                <select class="form-select form-select-sm status-select fw-bold" 
                        style="color: ${statusColor}; border-color: ${statusColor}44; background-color: ${statusColor}11; font-size: 11px;"
                        onchange="updateEnquiryStatus(${item.id}, this.value)">
                    <option value="Pending" ${item.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                    <option value="Meeting Fixed" ${item.status === 'Meeting Fixed' ? 'selected' : ''}>📅 Fixed</option>
                    <option value="Completed" ${item.status === 'Completed' ? 'selected' : ''}>✅ Done</option>
                </select>
            ` : `
                <div class="badge bg-danger text-wrap text-start p-2 shadow-sm" 
                     style="font-size: 10px; width: 95px; cursor:pointer; animation: pulse 2s infinite;" 
                     onclick="updateEnquiryStatus(${item.id}, 'Pending')" title="Click to reset">
                    <i class="bi bi-exclamation-circle me-1"></i> ${item.status}
                </div>
            `}
        </td>

        <td class="text-center pe-2" data-label="Actions">
            <div class="d-flex gap-2 justify-content-center">
                <a href="https://wa.me/91${item.phone}?text=${encodeURIComponent(waText)}" 
                   target="_blank" class="btn btn-success btn-sm d-flex align-items-center justify-content-center shadow-sm" 
                   style="width: 32px; height: 32px; border-radius: 8px;">
                    <i class="bi bi-whatsapp"></i>
                </a>
                <button class="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center" 
                        style="width: 32px; height: 32px; border-radius: 8px;" 
                        onclick="deleteEnquiry(${item.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    </tr>
`}).join('');
    } catch (error) {
        console.error("Enquiry fetch error:", error);
    }
}


function showFullMessage(customerName, fullMessage) {
   
    Swal.fire({
        title: `<span style="color: #c5a059;">Enquiry from ${customerName}</span>`,
        html: `
            <div style="text-align: left; background: #fdfdfd; padding: 15px; border-radius: 10px; border: 1px solid #eee; max-height: 400px; overflow-y: auto; font-size: 14px; line-height: 1.6;">
                ${fullMessage.replace(/\n/g, '<br>')}
            </div>`,
        confirmButtonText: 'CLOSE',
        confirmButtonColor: '#2c3e50',
        width: '600px', // Modal width badi rakhi hai taaki reading easy ho
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        }
    });
}
// Global Helper Functions
function toggleMessage(id, fullText) {
    const box = document.getElementById(`msg-text-${id}`);
    const btn = document.getElementById(`btn-${id}`);
    
    if (btn.innerText === "READ MORE") {
        box.innerText = fullText;
        btn.innerText = "SHOW LESS";
    } else {
        box.innerText = fullText.substring(0, 100) + "...";
        btn.innerText = "READ MORE";
    }
}

function updateStyle(el) {
    const val = el.value;
    if (val === 'Completed') el.style.color = '#198754';
    else if (val === 'Meeting Fixed') el.style.color = '#0d6efd';
    else el.style.color = '#6c757d';
}

fetchEnquiries();


async function updateEnquiryStatus(id, newStatus) {
    try {
       const response = await fetch(`${API}/admin/update-enquiry-status`, {
        // const response = await fetch(`${API}/admin/update-enquiry-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: newStatus })
        });

        if (response.ok) {
            // SweetAlert notification (agar aap use kar rahe hain)
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'success', title: 'Status Updated', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
            } else {
                alert("Status Updated!");
            }
        }
    } catch (error) {
        console.error("Update failed:", error);
    }
}


async function deleteEnquiry(id) {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    try {
        const response = await fetch(`${API}/admin/delete-enquiry/${id}`, {
        // const response = await fetch(`${API}/admin/delete-enquiry/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchEnquiries(); // Table refresh karne ke liye
        }
    } catch (error) {
        console.error("Delete failed:", error);
    }
}





// Image Preview Logic
function previewCarouselImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById('carouselPreviewImg');
            previewImg.src = e.target.result;
            previewImg.classList.remove('opacity-50');
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Text Real-time Preview
document.querySelectorAll('#uploadCarouselForm input, #uploadCarouselForm textarea').forEach(input => {
    input.addEventListener('input', (e) => {
        const name = e.target.name;
        const val = e.target.value;
        if(name === 'tag') document.getElementById('prevTag').innerText = val || 'TAG PREVIEW';
        if(name === 'title') document.getElementById('prevTitle').innerText = val || 'HEADLINE PREVIEW';
        if(name === 'description') document.getElementById('prevDesc').innerText = val || 'Description preview...';
    });
});


function saveTracking(orderId) {
    const trackingId = document.getElementById(`track_${orderId}`).value;
    const courierName = "Delhivery"; // Aap ise input box se bhi le sakte hain

    if (!trackingId) {
        alert("Bhai, Tracking ID toh dalo!");
        return;
    }

   fetch(`${API}/update-tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            orderId: orderId, 
            trackingId: trackingId,
            courierName: courierName 
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            alert("✅ Data Saved! Status set to Shipped.");
            location.reload(); 
        }
    })
    .catch(err => alert("❌ Connection Error: Server check karein!"));
}



async function updateOrder(orderId) {
    const statusSelect = document.getElementById(`status_${orderId}`);
    const trackingInput = document.getElementById(`track_${orderId}`);
    
    const status = statusSelect.value;
    const trackingId = trackingInput.value;

    const confirm = await Swal.fire({
        title: 'Save Changes?',
        text: `The status will be updated to: ${status}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Save'
    });

    if (!confirm.isConfirmed) return;

    try {
        // Sirf URL change kiya hai backend connection ke liye
        const res = await fetch(`${API}/admin/update-order-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status, trackingId }) // dhyan dein variable names same rahein
        });
        
        const data = await res.json();
        if (data.success) {
            Swal.fire('Success', 'Order updated!', 'success');
            fetchAll(); // Refresh dashboard data
            
            // Agar report page open hai toh use bhi refresh karega
            if(status === 'Delivered' && typeof loadSalesReport === 'function') loadSalesReport();
        }
    } catch (error) {
        Swal.fire('Error', 'Update failed', 'error');
    }
}
async function handleAction(orderId, currentStatus) {
    const btn = document.getElementById(`btn_${orderId}`);
    const statusSelect = document.getElementById(`status_${orderId}`);
    const trackingInput = document.getElementById(`track_${orderId}`);

    // LOGIC: If button is in "Unlock" mode
    if (btn.classList.contains('btn-danger')) {
        const confirm = await Swal.fire({
            title: 'Unlock ',
            text: "This order is marked as delivered. Do you want to unlock it?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, Unlock'
        });

        if (confirm.isConfirmed) {
            // Unlock fields
            statusSelect.disabled = false;
            trackingInput.disabled = false;
            
            // Transform button back to Save (Green)
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-success');
            btn.innerHTML = `<i class="bi bi-save me-1"></i> Save`;
            
            // Update onclick to perform the actual save now
            btn.setAttribute('onclick', `updateOrder(${orderId})`);
        }
    } else {
        // If button is already Green, perform normal update
        updateOrder(orderId);
    }
}







// Global data storage for searching
let currentSalesData = []; 

// 1. Sales Data Load Function
async function loadSalesReport() {
    const tbody = document.getElementById('salesTableBody');
    if(!tbody) return;

    try {
        const res = await fetch(`${API}/admin/sales-report`);
        const data = await res.json();
        currentSalesData = Array.isArray(data) ? data : [];
        
        renderSalesTable(currentSalesData);
        updateSalesAnalytics(currentSalesData);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

let allSalesData = []; // Global variable data store karne ke liye

// 2. Table Render Function
function renderSalesTable(data) {
    const tbody = document.getElementById('salesTableBody');
    tbody.innerHTML = '';

    data.forEach(order => {
        // Ab hum seedha #RJ + custom_order_id dikhayenge
        const displayID = `#RJ${order.order_id}`; 
        const date = new Date(order.created_at).toLocaleDateString('en-IN');
        tbody.innerHTML += `
            <tr>
                <td class="ps-4 fw-bold text-primary">${displayID}</td>
                <td>
                    <div class="fw-bold text-dark">${order.customer_name}</div>
                    <div class="small text-muted">${order.email || 'N/A'}</div>
                    <div class="small text-muted"><i class="bi bi-telephone"></i> ${order.phone}</div>
                </td>
                <td><div class="small text-truncate" style="max-width:180px">${parseItemsList(order.items)}</div></td>
                <td>${date}</td>
                <td class="fw-bold text-success">₹${parseFloat(order.total_amount).toLocaleString('en-IN')}</td>
                <td class="pe-4 text-end">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-light border" onclick='viewFullHistory(${JSON.stringify(order)})' title="View Detail">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteSalesRecord(${order.id})" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    });
}

// 3. Search Functionality (ReferenceError Fix)
function searchCustomer(query) {
    const q = query.toLowerCase();
    const filtered = currentSalesData.filter(item => 
        item.customer_name.toLowerCase().includes(q) || 
        (item.phone && item.phone.includes(q)) ||
        String(item.order_id || item.id).includes(q)
    );
    renderSalesTable(filtered);
}

// 4. Delete with Warning (SweetAlert)
async function deleteSalesRecord(id) {
    const result = await Swal.fire({
        title: 'Kya aap sure hain?',
        text: "Yeh record sales report se permanently hat jayega!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Haan, delete karein!',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        try {
           const res = await fetch(`${API}/admin/delete-sales-record/${id}`, { 
                method: 'DELETE' 
            });
            if (res.ok) {
                Swal.fire('Deleted!', 'Record delete kar diya gaya.', 'success');
                loadSalesReport(); // Table refresh
            }
        } catch (err) {
            Swal.fire('Error', 'Record delete nahi ho saka.', 'error');
        }
    }
}

// Items parsing helper
function parseItemsList(json) {
    try {
        const items = typeof json === 'string' ? JSON.parse(json) : json;
        return items.map(i => i.name).join(', ');
    } catch(e) { return "Jewellery Item"; }
}

// 5. Analytics Cards Update
function updateSalesAnalytics(data) {
    let total = 0;
    data.forEach(o => total += parseFloat(o.total_amount || 0));
    
    const revEl = document.getElementById('totalRevenue');
    const countEl = document.getElementById('totalOrderCount');
    const avgEl = document.getElementById('avgOrderVal');

    if(revEl) revEl.innerText = `₹${Math.round(total).toLocaleString('en-IN')}`;
    if(countEl) countEl.innerText = data.length;
    if(avgEl) {
        const avg = data.length > 0 ? Math.round(total / data.length) : 0;
        avgEl.innerText = `₹${avg.toLocaleString('en-IN')}`;
    }
}


function viewFullHistory(order) {
    let items = [];
    try { 
        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items; 
    } catch(e) { items = []; }

    const hallmarkFee = 53.10; // Standard Hallmark fee

    Swal.fire({
        width: '650px',
        title: `
            <div class="d-flex justify-content-between align-items-center px-2">
                <span class="fw-bold text-dark">Customer History</span>
                <span class="badge bg-primary fs-6">#RJ${order.order_id || (100000 + order.id)}</span>
            </div>
            <hr class="my-2 opacity-10">
        `,
        html: `
            <div class="text-start" style="font-family: 'Inter', sans-serif;">
                <div class="p-3 mb-4 rounded-3 border bg-light shadow-sm">
                    <div class="row g-3">
                        <div class="col-6">
                            <label class="small text-uppercase fw-bold text-muted d-block">Full Name</label>
                            <span class="fs-6 fw-bold text-dark">${order.customer_name}</span>
                        </div>
                        <div class="col-6 text-end">
                            <label class="small text-uppercase fw-bold text-muted d-block">Payment Mode</label>
                            <span class="badge bg-success-subtle text-success border border-success-subtle">Online</span>
                        </div>
                        <div class="col-6">
                            <label class="small text-uppercase fw-bold text-muted d-block">Email Address</label>
                            <span class="text-dark">${order.email || 'N/A'}</span>
                        </div>
                        <div class="col-6 text-end">
                            <label class="small text-uppercase fw-bold text-muted d-block">Phone Number</label>
                            <span class="text-dark">${order.phone || 'N/A'}</span>
                        </div>
                        <div class="col-12">
                            <label class="small text-uppercase fw-bold text-muted d-block">Delivery Address</label>
                            <span class="text-dark small">${order.address || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <h6 class="fw-bold text-uppercase small text-secondary mb-2 ms-1">Itemized Purchase Details</h6>
                <div class="table-responsive border rounded-3 overflow-hidden shadow-sm mb-3">
                    <table class="table table-hover mb-0" style="font-size: 0.85rem;">
                        <thead class="bg-dark text-white">
                            <tr>
                                <th class="ps-3 py-2">Item Name</th>
                                <th class="py-2">Karat</th>
                                <th class="py-2">Weight</th>
                                <th class="py-2 text-center">Qty</th>
                                <th class="pe-3 py-2 text-end">Final Price (Incl. GST)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(i => {
                                const weight = parseFloat(i.weight_gm || 0);
                                const qty = parseInt(i.quantity || 1);
                                const makingPerGram = parseFloat(i.making_charge || 0);
                                const goldPriceUnit = parseFloat(i.price || 0); // Unit Gold Price
                                
                                // Calculation Logic:
                                // 1. Item Subtotal = Gold + (Making * Weight) + Hallmark
                                const itemSubtotal = goldPriceUnit + (makingPerGram * weight) + hallmarkFee;
                                // 2. Add 3% GST on top of that
                                const priceWithGST = Math.round(itemSubtotal * 1.03) * qty;

                                return `
                                <tr>
                                    <td class="ps-3 py-3 align-middle fw-bold text-dark text-truncate" style="max-width: 150px;">
                                        ${i.name}
                                    </td>
                                    <td class="align-middle"><span class="badge bg-warning text-dark">${i.purity || '22'}K</span></td>
                                    <td class="align-middle">${weight}g</td>
                                    <td class="align-middle text-center">${qty}</td>
                                    <td class="pe-3 text-end align-middle">
                                        <div class="fw-bold text-dark">₹${priceWithGST.toLocaleString('en-IN')}</div>
                                        <div style="font-size: 0.7rem;" class="text-muted">
                                            Rate: ₹${goldPriceUnit.toLocaleString('en-IN')} | Making: ₹${makingPerGram}/g
                                        </div>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="p-3 bg-dark text-white rounded-3 d-flex justify-content-between align-items-center shadow">
                    <span class="text-uppercase fw-bold opacity-75">Final Bill Amount (Net Payable)</span>
                    <span class="h4 fw-bold mb-0 text-warning">₹${parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
                </div>
            </div>
        `,
        showCloseButton: true,
        confirmButtonText: 'Print Receipt',
        showCancelButton: true,
        cancelButtonText: 'Close',
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#334155'
    });
}


// admin.js ke sabse niche ye code dalein
window.onload = function() {
    // Apne saare fetching functions yahan call karein
    fetchSales();       // Sales Report load karne ke liye
    fetchOrders();      // Orders load karne ke liye
    loadInventory();    // Inventory load karne ke liye
};


// Stock Status Helper
function getStockStatus(qty, logic) {
    if (qty > 5) {
        return `<span class="badge bg-success-soft text-success">In Stock: ${qty}</span>`;
    } else if (qty > 0) {
        return `<span class="badge bg-warning-soft text-warning">Low: ${qty} Left</span>`;
    } else {
        const msg = (logic === 'order') ? "Bana kar milega" : "Out of Stock";
        return `<span class="badge bg-danger-soft text-danger">${msg}</span>`;
    }
}



function closeSidebarOnMobile() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Agar mobile view hai (width 992px se kam), toh sidebar band kar do
    if (window.innerWidth < 992) {
        // Bootstrap Offcanvas check
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebar);
        if (bsOffcanvas) {
            bsOffcanvas.hide();
        } else {
            // Agar normal CSS sidebar hai toh 'show' class remove karein
            sidebar.classList.remove('show');
        }
    }
}


async function saveRowUpdate(id) {
    const weightInput = document.getElementById(`w-input-${id}`);
    const stockInput = document.getElementById(`s-input-${id}`);
    const btn = document.getElementById(`btn-upd-${id}`);
    
    const weightValue = weightInput.value;
    const stockValue = stockInput.value;

    // 1. Loading State
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

    try {
        // Hum do alag calls ki jagah ek saath weight aur stock bhej rahe hain
        // Note: Iske liye niche wala backend code use karein
        // const response = await fetch('/api/update-product-row', {
       const response = await fetch(`${API}/update-product-row`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: id, 
                weight: weightValue, 
                stock: stockValue 
            })
        });

        const data = await response.json();

        if(data.success) {
            // 2. Success Animation
            btn.classList.replace('btn-primary', 'btn-success');
            btn.innerHTML = `<i class="bi bi-check-lg"></i>`;
            
            // Stock color update
            stockInput.className = `form-control form-control-sm text-center fw-bold border-2 ${stockValue <= 0 ? 'border-danger text-danger' : 'border-success text-success'}`;

            setTimeout(() => {
                btn.classList.replace('btn-success', 'btn-primary');
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }, 1500);
        } else {
            alert("Error: " + data.message);
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }
    } catch (err) {
        alert("Server error!");
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
}
window.onload = fetchAll;

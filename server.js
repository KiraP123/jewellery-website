require('dotenv').config(); // Ye line .env file se saari details load kar degi
const express = require('express');
const mysql = require('mysql2'); 
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const app = express();
// const PORT = 3000;
const PORT = process.env.PORT || 3000;

// app.use(cors()); 
// app.use(cors({
//     origin: ["https://your-frontend-website.com", "http://localhost:5500"] // Apni live site ka link yahan daalein
// }));



app.use(cors({
    origin: "*", // Sabhi ko allow karo
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));




app.use(express.json());
app.use('/images', express.static('images'));

// const db = mysql.createConnection({
//     host: '127.0.0.1', 
//     user: 'root',
//     password: '', 
//     database: 'ramesh_jewellers_db',
//     port: 3308 
// });
const db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', 
    database: process.env.DB_NAME || 'ramesh_jewellers_db',
    port: process.env.DB_PORT || 3308 
});

db.connect(err => {
    if (err) console.error('❌ SQL Error:', err.message);
    else console.log('✅ MySQL Connected');
});

const storage = multer.diskStorage({
    destination: './images/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- 1. UPDATE RATES ---
app.post('/api/update-rates', (req, res) => {
    const { r995, r916, r750 } = req.body;
    const sql = "UPDATE settings SET rate_995=?, rate_916=?, rate_750=? WHERE id=1";
    db.query(sql, [r995, r916, r750], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Rates Updated Successfully" });
    });
});

// --- 2. GET PRODUCTS (RAW DATA ONLY) ---
// Yahan humne calculation frontend (common.js) ke liye chhod di hai
app.get('/api/products', (req, res) => {
    db.query("SELECT * FROM settings WHERE id=1", (err, rateResult) => {
        if (err) return res.status(500).json(err);
        const rates = rateResult[0];

        db.query("SELECT * FROM products ORDER BY id DESC", (err, products) => {
            if (err) return res.status(500).json(err);

            // Sirf database ka raw data aur current gold rates bhej rahe hain
            res.json({ products: products, rates: rates });
        });
    });
});

// // --- 1. UPDATE RATES ---
// app.post('/api/update-rates', (req, res) => {
//     const { r995, r916, r750 } = req.body;
//     const sql = "UPDATE settings SET rate_995=?, rate_916=?, rate_750=? WHERE id=1";
//     db.query(sql, [r995, r916, r750], (err) => {
//         if (err) return res.status(500).json(err);
//         res.json({ message: "Rates Updated Successfully" });
//     });
// });

// --- 2. GET PRODUCTS (RAW DATA ONLY) ---
// Yahan humne calculation frontend (common.js) ke liye chhod di hai
app.get('/api/products', (req, res) => {
    db.query("SELECT * FROM settings WHERE id=1", (err, rateResult) => {
        if (err) return res.status(500).json(err);
        const rates = rateResult[0];

        db.query("SELECT * FROM products ORDER BY id DESC", (err, products) => {
            if (err) return res.status(500).json(err);

            // Sirf database ka raw data aur current gold rates bhej rahe hain
            res.json({ products: products, rates: rates });
        });
    });
});





// --- 3. ADD PRODUCT (UPDATED WITH STOCK) ---
app.post('/api/products', upload.single('productImage'), (req, res) => {
    // 1. req.body se stock_qty bhi nikaalein
    const { name, weight_gm, making_charge, purity, size, stock_qty } = req.body; 
    const image = req.file ? req.file.filename : null;

    // 2. SQL query mein 'stock_qty' column aur ek naya '?' jodein
    const sql = "INSERT INTO products (name, weight_gm, making_charge, purity, size, stock_qty, image) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    // 3. Array mein stock_qty ko sahi jagah (size aur image ke beech) dalo
    db.query(sql, [name, weight_gm, making_charge, purity, size, stock_qty, image], (err, result) => {
        if (err) {
            console.error("❌ DB Insert Error:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "Product added successfully with Stock!" });
    });
});


// --- 4. UPDATE PRODUCT (UPDATED WITH STOCK) ---
app.put('/api/products/:id', (req, res) => {
    const { name, weight_gm, making_charge, size, purity, stock_qty } = req.body;
    
    // Query mein stock_qty update karne ka logic joda
    const sql = "UPDATE products SET name=?, weight_gm=?, making_charge=?, size=?, purity=?, stock_qty=? WHERE id=?";
    
    db.query(sql, [name, weight_gm, making_charge, size, purity, stock_qty, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Updated Successfully" });
    });
});


app.delete('/api/:type/:id', (req, res) => {
    const { type, id } = req.params;
    
    // Sirf 'orders' aur 'products' table allow karne ke liye logic
    const tableName = type === 'orders' ? 'orders' : 'products';
    const sql = `DELETE FROM ${tableName} WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DB Error:", err);
            return res.status(500).send("Database error: " + err.message);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send("No data found in the database.");
        }
        res.send("Successfully deleted!");
    });
});

app.delete('/api/products/:id', (req, res) => {
    db.query("DELETE FROM products WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Deleted" });
    });
});

// --- 6. ORDERS ---
app.post('/api/orders', (req, res) => {
    const { user_email, customer_name, items, total_amount, address, phone } = req.body;
    const itemsStr = JSON.stringify(items);
    const sql = "INSERT INTO orders (user_email, customer_name, items, total_amount, address, phone) VALUES (?,?,?,?,?,?)";
    db.query(sql, [user_email, customer_name, itemsStr, total_amount, address, phone], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, orderId: result.insertId });
    });
});

app.get('/api/orders', (req, res) => {
    db.query("SELECT * FROM orders ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});



// --- ADMIN LOGIN VERIFICATION ---
app.post('/api/admin/verify', (req, res) => {
    const { user, pass } = req.body;
    
    // Database se match kar rahe hain
    const sql = "SELECT * FROM admin_users WHERE username = ? AND password = ?";
    
    db.query(sql, [user, pass], (err, result) => {
        if (err) {
            console.error("Auth Error:", err);
            return res.status(500).json({ success: false, message: "Database Error" });
        }
        
        if (result.length > 0) {
            // Agar match ho gaya
            res.json({ success: true, message: "Access Granted" });
        } else {
            // Agar galat hai
            res.status(401).json({ success: false, message: "Invalid Credentials" });
        }
    });
});



// --- CHANGE ADMIN PASSWORD ---
app.post('/api/admin/change-password', (req, res) => {
    const { oldPass, newPass, newUser } = req.body;

    // Pehle purana password verify karte hain
    const checkSql = "SELECT * FROM admin_users WHERE password = ?";
    db.query(checkSql, [oldPass], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "DB Error" });
        
        if (result.length > 0) {
            // Agar purana pass sahi hai, toh naya update karo
            const updateSql = "UPDATE admin_users SET username = ?, password = ? WHERE id = ?";
            db.query(updateSql, [newUser, newPass, result[0].id], (err2, result2) => {
                if (err2) return res.status(500).json({ success: false });
                res.json({ success: true, message: "Password Updated!" });
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password!" });
        }
    });
});





// --- USER REGISTER (Ramesh Jewellers Customers) ---
app.post('/api/user/register', (req, res) => {
    const { name, email, password, phone } = req.body;
    
    // 1. Check karo ki koi field khali toh nahi hai
    if (!name || !email || !password || !phone) {
        return res.status(400).json({ success: false, message: "Sabhi details bharna zaroori hai!" });
    }

    // 2. SQL Query (Yahan 'password' aur 'phone' ke beech comma lagaya hai aur columns check kiye hain)
    // Dhyan de: Aapki table mein columns ke naam 'full_name', 'email', 'password', 'phone' hone chahiye
    const sql = "INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [name, email, password, phone], (err, result) => {
        if (err) {
            console.error("❌ Registration Error:", err);
            
            // Duplicate Entry Check (Email ya Phone agar unique set hai toh)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ 
                    success: false, 
                    message: "Email ya Mobile number pehle se registered hai!" 
                });
            }
            return res.status(500).json({ success: false, message: "Server Error: Database mein save nahi ho paya." });
        }
        
        // Success Response
        res.json({ success: true, message: "Account created successfully! Welcome to Ramesh Jewellers." });
    });
});

// --- USER LOGIN ---
app.post('/api/user/login', (req, res) => {
    const { email, password } = req.body;
    
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Database Error" });
        
        if (result.length > 0) {
            // Login Success: User ka data bhej rahe hain (password chhod kar)
            const user = result[0];
            res.json({ 
                success: true, 
                message: "WELCOME!",
                user: {
                    id: user.id,
                    name: user.full_name,
                    email: user.email
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password!" });
        }
    });
});


// Update Limited Offer Status
app.put('/api/products/toggle-offer/:id', (req, res) => {
    const { is_limited_offer } = req.body;
    const { id } = req.params; 
    
    const sql = "UPDATE products SET is_limited_offer = ? WHERE id = ?";
    db.query(sql, [is_limited_offer, id], (err, result) => {
        if (err) {
            console.error("❌ Toggle Error:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "Offer status updated" });
    });
});












// // 1. POST: Enquiry aur Rating SAVE karne ke liye
// app.post('/api/enquiries', (req, res) => {
//     // Yahan 'rating' bhi add kiya hai
//     const { name, email, phone, subject, message, rating } = req.body;
    
//     // SQL query mein 'rating' column add karein
//     const sql = "INSERT INTO enquiries (name, email, phone, subject, message, rating, status) VALUES (?, ?, ?, ?, ?, ?, 'Pending')";
    
//     db.query(sql, [name, email, phone, subject, message, rating || 0], (err, result) => {
//         if (err) {
//             console.error("❌ SQL Insert Error:", err);
//             return res.status(500).json({ success: false, error: err.message });
//         }
//         res.json({ success: true, message: "Enquiry & Rating saved!" });
//     });
// });

// // 2. GET: Reviews ko Index Page par DIKHANE ke liye (Iske bina 404 aayega)
// app.get('/api/enquiries', (req, res) => {
//     const sql = "SELECT * FROM enquiries WHERE rating > 0 ORDER BY created_at DESC";
    
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error("❌ SQL Fetch Error:", err);
//             return res.status(500).json({ success: false, error: err.message });
//         }
//         res.json(results); // Ye frontend ko data bhejega
//     });
// });

// --- NEW: Public Enquiry Submission (For Contact Page) ---
app.post('/api/enquiries', (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    const sql = "INSERT INTO enquiries (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, 'Pending')";
    
    db.query(sql, [name, email, phone, subject, message], (err, result) => {
        if (err) {
            console.error("❌ SQL Insert Error:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Enquiry saved!" });
    });
});

// 1. Saari enquiries fetch karne ke liye
app.get('/api/admin/enquiries', (req, res) => {
    db.query("SELECT * FROM enquiries ORDER BY created_at DESC", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 2. Status update karne ke liye (Pending se Fixed karne ke liye)
app.post('/api/admin/update-enquiry-status', (req, res) => {
    const { id, status } = req.body;
    db.query("UPDATE enquiries SET status = ? WHERE id = ?", [status, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Status Updated" });
    });
});

// 3. Enquiry delete karne ke liye
app.delete('/api/admin/delete-enquiry/:id', (req, res) => {
    db.query("DELETE FROM enquiries WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Deleted" });
    });
});


// Orders ka status update karne ke liye route (Add this in server.js)
app.post('/api/orders/update-status', (req, res) => {
    const { id, status } = req.body;
    db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: "Order Status Updated" });
    });
});


// --- CAROUSEL UPDATE ROUTE ---
app.post('/api/update-carousel', upload.single('image'), (req, res) => {
    const { slide_num, title, description, tag } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    // Agar image upload nahi ki, toh sirf text update karne ke liye logic
    if (!imagePath) {
        const sql = "UPDATE carousel_slides SET title=?, description=?, tag=? WHERE id=?";
        db.query(sql, [title, description, tag, slide_num], (err, result) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true, message: "Text Updated" });
        });
    } else {
        // Agar image hai, toh poora replace karo
        const sql = "REPLACE INTO carousel_slides (id, image_path, tag, title, description, is_active) VALUES (?, ?, ?, ?, ?, 1)";
        db.query(sql, [slide_num, imagePath, tag, title, description], (err, result) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true, message: "Slide Fully Updated" });
        });
    }
});

// --- GET CAROUSEL FOR FRONTEND ---
app.get('/api/carousel', (req, res) => {
    // Sirf wahi slides bhej rahe hain jo 'is_active = 1' hain
    db.query("SELECT * FROM carousel_slides WHERE is_active = 1 ORDER BY id ASC", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});


// --- 1. ADMIN ORDER UPDATE (YE MISSING THA ISLIYE 500 ERROR AA RAHA THA) ---
app.put('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    const { status, tracking_id } = req.body;

    // Status aur Tracking dono ek saath update karne ke liye
    const sql = "UPDATE orders SET status = ?, tracking_id = ? WHERE id = ?";
    
    db.query(sql, [status, tracking_id, orderId], (err, result) => {
        if (err) {
            console.error("❌ SQL Update Error:", err.message);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Order updated successfully" });
    });
});


// --- 6. ORDERS (Ab Sirf Yehi Ek Rahega) ---
app.post('/api/orders', (req, res) => {
    const { user_email, customer_name, items, total_amount, address, phone , } = req.body;
    const itemsStr = JSON.stringify(items);

    // 1. 8-digit Random ID generate karein
    const customId = Math.floor(10000000 + Math.random() * 90000000); 

    // 2. Insert query mein custom_order_id shamil hai
    // Dhyan dein: Column ka naam DB mein 'custom_order_id' hi hona chahiye
    const sqlInsert = "INSERT INTO orders (user_email, customer_name, items, total_amount, address, phone, status, custom_order_id) VALUES (?,?,?,?,?,?,?,?)";
    
    db.query(sqlInsert, [user_email, customer_name, itemsStr, total_amount, address, phone, 'Order Placed', customId], (err, result) => {
        if (err) {
            console.error("❌ DB Insert Error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        console.log(`✅ Order Saved Successfully! ID: ${customId}`);

        // 3. Response jo Thank You page use karega
        res.json({ 
            success: true, 
            orderId: customId, 
            db_id: result.insertId 
        });
    });
});


app.post('/api/update-tracking', (req, res) => {
    const { orderId, trackingId, status } = req.body; // Status bhi le rahe hain
    
    // SQL query jo status aur tracking dono update karegi
    const sql = "UPDATE orders SET tracking_id = ?, status = ? WHERE id = ?";
    
    db.query(sql, [trackingId, status, orderId], (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});






app.post('/api/place-order', (req, res) => {
    const uniqueOrderId = Math.floor(10000000 + Math.random() * 90000000);
    const { user_email, pincode, customer_name, items, total_amount, address, phone } = req.body;
    
    // Items ko string mein badlein DB mein save karne ke liye
    const itemsStr = JSON.stringify(items || []);

    const sql = "INSERT INTO orders (user_email, pincode, customer_name, items, total_amount, address, phone, status, custom_order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [
        user_email || 'No Email', 
        pincode || 'no pincode',
        customer_name || 'Guest', 
        itemsStr, 
        total_amount || 0, 
        address || 'No Address', 
        phone || 'No Phone',
        'ORDER CONFIRM', 
        uniqueOrderId
    ], (err, result) => {
        if (err) {
            console.error("❌ SQL Insert Error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }

        // --- STOCK MINUS LOGIC START ---
        if (items && Array.isArray(items)) {
            items.forEach(item => {
                // Har product ki quantity 1 kam hogi (AND stock_qty > 0 taaki minus mein na jaye)
                const updateStockSql = "UPDATE products SET stock_qty = stock_qty - 1 WHERE id = ? AND stock_qty > 0";
                db.query(updateStockSql, [item.id], (err) => {
                    if (err) console.error("❌ Stock Minus Error for ID " + item.id + ":", err.message);
                });
            });
        }
        // --- STOCK MINUS LOGIC END ---

        console.log("✅ Order Saved & Stock Updated! ID:", uniqueOrderId);
        res.json({ success: true, orderId: uniqueOrderId });
    });
});


// Order Tracking ke liye status fetch karna
app.get('/api/order-status/:id', (req, res) => {
    const orderId = req.params.id;
    // Database query
    const sql = "SELECT * FROM orders WHERE custom_order_id = ? OR id = ?";
    
    db.query(sql, [orderId, orderId], (err, result) => {
        if (err) {
            console.error("❌ SQL Error:", err.message);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (result.length > 0) {
            // YAHAN DHAYAN DEIN: Hum 'success' aur 'order' dono bhej rahe hain
            res.json({ 
                success: true, 
                order: result[0] 
            }); 
        } else {
            // Agar record nahi mila
            res.status(404).json({ success: false, message: "Order not found in Database" });
        }
    });
});


app.get('/api/user-orders/:email', (req, res) => {
    const email = req.params.email;
    console.log("🔍 Checking orders for:", email);

    const sql = "SELECT * FROM orders WHERE user_email = ? ORDER BY id DESC";
    
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err.message);
            // Response dena zaroori hai warna loading chalti rahegi
            return res.status(500).json({ success: false, message: err.message });
        }
        
        // Response bhejna hi bhejna hai, chahe array khali ho
        console.log(`✅ Success! Found ${results.length} orders`);
        res.json({ success: true, orders: results });
    });
});

// --- CANCEL ORDER API (WITH AUTOMATIC STOCK RESTORE) ---
app.put('/api/cancel-order/:id', (req, res) => {
    const orderId = req.params.id;

    // Step 1: Pehle check karo ki order cancel hone layak hai ya nahi aur uske items nikaalo
    const checkSql = "SELECT items, status FROM orders WHERE id = ?";
    
    db.query(checkSql, [orderId], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (rows.length === 0) return res.status(404).json({ success: false, message: "Order not found" });

        const order = rows[0];
        const currentStatus = order.status.toUpperCase();
        
        // Step 2: Sirf inhi status par cancel allow karein
        const allowableStatuses = ['ORDER CONFIRM', 'QUALITY CHECK', 'ORDER PLACED'];
        
        if (!allowableStatuses.includes(currentStatus)) {
            return res.status(400).json({ 
                success: false, 
                message: `Order cannot be cancelled because it is already '${order.status}'` 
            });
        }

        // Step 3: Status ko 'Cancelled' mein update karein
        const updateSql = "UPDATE orders SET status = 'Cancelled' WHERE id = ?";
        
        db.query(updateSql, [orderId], (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err.message });

            if (result.affectedRows > 0) {
                // Step 4: AGAR SUCCESSFUL CANCEL HUA, TOH STOCK WAPAS PLUS KARO
                try {
                    const items = JSON.parse(order.items || "[]");
                    items.forEach(item => {
                        const restoreStockSql = "UPDATE products SET stock_qty = stock_qty + 1 WHERE id = ?";
                        db.query(restoreStockSql, [item.id], (err) => {
                            if (err) console.error(`❌ Restore Stock Error for ID ${item.id}:`, err.message);
                        });
                    });
                    console.log(`✅ Order ${orderId} cancelled and stock restored.`);
                    res.json({ success: true, message: "Order cancelled and stock updated!" });
                } catch (parseErr) {
                    console.error("❌ JSON Parse Error:", parseErr);
                    res.json({ success: true, message: "Order cancelled but stock restore failed (Data Error)" });
                }
            }
        });
    });
});

const cron = require('node-cron');

// --- AUTOMATIC CLEANUP: Har ghante check karega ---
// Logic: Agar status 'Cancelled' hai aur usey 24 ghante se zyada ho gaye hain toh delete kar do
cron.schedule('0 * * * *', () => {
    console.log("Running Cleanup: Checking for old cancelled orders...");
    
    // SQL Query: status 'Cancelled' ho aur updated_at time 24 ghante purana ho
    const sql = `
        DELETE FROM orders 
        WHERE status = 'Cancelled' 
        AND updated_at < NOW() - INTERVAL 24 HOUR
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error("❌ Cleanup Error:", err.message);
        } else if (result.affectedRows > 0) {
            console.log(`✅ Cleaned up ${result.affectedRows} old cancelled orders.`);
        }
    });
});




app.post('/api/admin/update-order-status', (req, res) => {
    const { orderId, status, trackingId } = req.body;

    const sqlUpdate = "UPDATE orders SET status = ?, tracking_id = ? WHERE id = ?";
    
    db.query(sqlUpdate, [status, trackingId, orderId], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        if (status === 'Delivered') {
            // Step 1: Pehle 'orders' table se custom_order_id nikaalein taaki report mein check kar sakein
            db.query("SELECT custom_order_id FROM orders WHERE id = ?", [orderId], (err, orderResult) => {
                if (err || orderResult.length === 0) return;
                
                const customID = orderResult[0].custom_order_id;

                // Step 2: Sales report mein check karein ki ye Custom ID pehle se toh nahi hai?
                db.query("SELECT * FROM sales_report WHERE order_id = ?", [customID], (err, rows) => {
                    if (rows && rows.length === 0) {
                        // Step 3: Agar nahi hai, toh custom_order_id ke saath insert karein
                        const sqlInsert = `
                            INSERT INTO sales_report (order_id, customer_name, email, phone, address, items, total_amount, created_at)
                            SELECT custom_order_id, customer_name, user_email, phone, address, items, total_amount, NOW()
                            FROM orders WHERE id = ?`;
                        
                        db.query(sqlInsert, [orderId], (err) => {
                            if (err) console.error("❌ Sync Error:", err.message);
                            else console.log("✅ Data synced with Custom ID: " + customID);
                        });
                    }
                });
            });
        }
        res.json({ success: true, message: "Status updated!" });
    });
});

// 1. Sales Report Fetch Karne Ke Liye
app.get('/api/admin/sales-report', (req, res) => {
    // Database table 'sales_report' se data nikaalna
    const sql = "SELECT * FROM sales_report ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Sales Report Se Record Delete Karne Ke Liye (Status 404 fix)
app.delete('/api/admin/delete-sales-record/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM sales_report WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Record deleted successfully" });
    });
});






// 1. Pehle ye line check karein (Sirf ek baar honi chahiye top par)
const googleClient = new OAuth2Client('1074517545758-4ijdnhe0tkbjoervpd1810q2hkva3pkp.apps.googleusercontent.com');

// 2. Sirf ye EK Google Login Route rakhein (Baki sab delete kar dein)
app.post('/api/user/google-login', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: '1074517545758-4ijdnhe0tkbjoervpd1810q2hkva3pkp.apps.googleusercontent.com',
        });
        
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;
        const authorizedAdminEmail = "ramesh.jewellers@gmail.com"; 

        // Check if the user is Admin
        const isAdmin = (email === authorizedAdminEmail);

        // Database Check: User ko register ya login karna
        const checkSql = "SELECT * FROM users WHERE email = ?";
        db.query(checkSql, [email], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: "DB Error" });

            if (result.length > 0) {
                // User already exists
                const user = result[0];
                res.json({
                    success: true,
                    isAdmin: isAdmin,
                    user: { id: user.id, name: user.full_name, email: user.email, picture: picture },
                    message: isAdmin ? "Welcome Admin!" : "Login Successful!"
                });
            } else {
                // New User: Register them
                const insertSql = "INSERT INTO users (full_name, email, password) VALUES (?, ?, 'GOOGLE_USER')";
                db.query(insertSql, [name, email], (err2, insertResult) => {
                    if (err2) return res.status(500).json({ success: false });
                    res.json({
                        success: true,
                        isAdmin: isAdmin,
                        user: { id: insertResult.insertId, name: name, email: email, picture: picture },
                        message: "Account created and logged in!"
                    });
                });
            }
        });

    } catch (error) {
        console.error("❌ Google Auth Error:", error);
        res.status(401).json({ success: false, message: "Invalid Google Token" });
    }
});


app.post('/update-phone', (req, res) => {
    const { email, phoneNumber } = req.body;
    const query = "UPDATE users SET phone = ? WHERE email = ?";
    db.query(query, [phoneNumber, email], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ status: 'Success' });
    });
});



// Check kijiye ki route ka naam 'update-product-row' hi hai
app.put('/api/update-product-row', (req, res) => {
    const { id, weight, stock } = req.body;

    // Database query
    const sql = `UPDATE products SET weight_gm = ?, stock_qty = ? WHERE id = ?`;
    
    db.query(sql, [weight, stock, id], (err, result) => {
        if (err) {
            console.error("DB Error:", err); // Ye aapke terminal mein error dikhayega
            return res.status(500).json({ success: false, message: "Database Error" });
        }
        res.json({ success: true, message: "Updated successfully" });
    });
});

// app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
// सुनिश्चित करें कि 'Order' मॉडल की फ़ाइल का पथ सही हो
const Order = require('./models/Order'); 

const app = express();
const PORT = 3000;

// 🚨 अपनी MongoDB Atlas URI यहाँ डालें 🚨
// यह आपकी पिछली URI है, अगर यह काम कर रही है तो इसे ही इस्तेमाल करें।
const DB_URI = "mongodb+srv://sammyfisk555_db_user:RMPU6vqO51pQSjDB@rameshjewellersdb.dur3yqw.mongodb.net/?appName=RameshJewellersDB";


// Middlewares
app.use(cors()); 
app.use(express.json()); // JSON data को प्रोसेस करने के लिए

// MongoDB connection
mongoose.connect(DB_URI)
    .then(() => console.log('✅ MongoDB Connected successfully!'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Order Submission Endpoint
app.post('/api/orders', async (req, res) => {
    try {
        // Front-end (script.js) से आने वाली keys को Destructure करें
        // इसमें user, items, total, और shippingDetails शामिल हैं
        const { user, items, total, shippingDetails } = req.body; 
        
        console.log(`\n--- New Order Received ---`);
        console.log(`User: ${user}`);
        console.log(`Shipping To: ${shippingDetails.firstName} ${shippingDetails.lastName}`);
        console.log(`Total Amount: ₹ ${total.toLocaleString('en-IN')}`);

        // DB में save करने के लिए naya order banayein
        const newOrder = new Order({
            // 'user' को 'userEmail' Schema field में मैप किया गया है
            userEmail: user, 
            items: items, // इसमें weight_gm और design_type शामिल हैं
            // 'total' को 'totalAmount' Schema field में मैप किया गया है
            totalAmount: total,
            shippingDetails: shippingDetails // Checkout फ़ॉर्म की सारी जानकारी
        });
        
        await newOrder.save(); // डेटाबेस में सेव करें

        console.log(`✅ Order Saved to MongoDB. ID: ${newOrder._id}`);
        
        // Front-end को सफलता का जवाब भेजें जिसमें orderId शामिल हो
        res.status(201).json({ 
            message: 'Order placed successfully!', 
            orderId: newOrder._id 
        });

    } catch (error) {
        console.error("\n==================================");
        console.error("❌ Fatal Error placing order (500):", error.message);
        
        if (error.name === 'ValidationError') {
            // Validation Error होने पर console में स्पष्ट जानकारी दें
            console.error("--- MONGODB VALIDATION FAILED ---");
            for (const field in error.errors) {
                console.error(`Field Missing/Invalid: ${field} (Reason: ${error.errors[field].message})`);
            }
        } 
        console.error("==================================\n");

        res.status(500).json({ error: 'Could not process order.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
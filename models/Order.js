// models/Order.js

const mongoose = require('mongoose');

const ShippingSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    address2: String, // Optional
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
});

const ItemSchema = new mongoose.Schema({
    id: Number,
    name: String,
    price: Number,
    quantity: Number,
    weight_gm: Number, // वज़न
    design_type: String // डिज़ाइन
});

const OrderSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    items: [ItemSchema], // सभी प्रोडक्ट डिटेल्स
    totalAmount: { type: Number, required: true },
    shippingDetails: ShippingSchema, // Checkout फ़ॉर्म की सारी जानकारी
    orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
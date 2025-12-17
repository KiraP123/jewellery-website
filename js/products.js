// // --- CONSTANTS FOR PRICE CALCULATION (SIMULATED) ---
// const LIVE_GOLD_RATE_PER_GM = 6500; 
// const MAKING_CHARGE_PERCENT_LOW = 0.10; 
// const MAKING_CHARGE_PERCENT_HIGH = 0.15; 
// const GST_RATE_PERCENT = 0.03; 

// // --- PRICE CALCULATION FUNCTION ---
// function calculateRealPrice(product) {
//     // NOTE: Mid design ko Simple rate (0.10) par rakha gaya hai
//     const makingChargeRate = (product.design === 'Heavy') ? MAKING_CHARGE_PERCENT_HIGH : MAKING_CHARGE_PERCENT_LOW;
//     
//     let basePrice = product.weight_gm * LIVE_GOLD_RATE_PER_GM;
//     let makingCharge = basePrice * makingChargeRate;
//     let subtotal = basePrice + makingCharge;
//     let gst = subtotal * GST_RATE_PERCENT;
//     product.real_price = Math.round((subtotal + gst) / 10) * 10;
//     return product.real_price;
// }

// // --- PRODUCT DATA ---
// const productData = [
//     { id: 1, name: "Classic Plain Kada", weight_gm: 10.5, design: 'Simple', image: 'bangle-01.jpg'},
//     { id: 2, name: "Everyday Thread Bangle", weight_gm: 8.2, design: 'Simple', image: 'bangle-02.jpg' },
//     { id: 3, name: "Matte Finish Gold Bracelet", weight_gm: 12.0, design: 'Simple', image: 'bangle-03.jpg' },
//     { id: 4, name: "Sleek Line Bangle (Set of 2)", weight_gm: 15.0, design: 'Simple', image: 'bangle-04.jpg' },
//     { id: 5, name: "Twisted Rope Design Bangle", weight_gm: 9.8, design: 'Simple', image: 'bangle-05.jpg' },
//     { id: 6, name: "Diamond Cut Edge Bangle", weight_gm: 11.5, design: 'Simple', image: 'bangle-06.jpg' },
//     { id: 7, name: "Flexible Gold Mesh Bangle", weight_gm: 13.5, design: 'Simple', image: 'bangle-07.jpg' },
//     { id: 8, name: "Open Cuff Style Bangle", weight_gm: 10.1, design: 'Simple', image: 'bangle-08.jpg' },
//     { id: 9, name: "Geometric Square Bangle", weight_gm: 14.2, design: 'Simple', image: 'bangle-09.jpg' },
//     { id: 10, name: "Hammered Finish Bangle", weight_gm: 9.5, design: 'Simple', image: 'bangle-10.jpg' },
//     // 11-20: Antique & Filigree Designs (Mid Weight/Charge)
//     { id: 11, name: "Filigree Floral Bangle", weight_gm: 16.5, design: 'Mid', image: 'bangles1.jpg' },
//     { id: 12, name: "Antique Temple Design Kada", weight_gm: 20.0, design: 'Mid', image: 'bangle-12.jpg' },
//     { id: 13, name: "Peacock Motif Bangle", weight_gm: 18.8, design: 'Mid', image: 'bangle-13.jpg' },
//     { id: 14, name: "Rajwadi Engraved Bangle", weight_gm: 17.5, design: 'Mid', image: 'bangle-14.jpg' },
//     { id: 15, name: "Victorian Style Carved Bangle", weight_gm: 19.2, design: 'Mid', image: 'bangle-15.jpg' },
//     { id: 16, name: "Intricate Jaali Work Bangle", weight_gm: 15.8, design: 'Mid', image: 'bangle-16.jpg' },
//     { id: 17, name: "Ghungroo Detailed Bangle", weight_gm: 21.0, design: 'Mid', image: 'bangle-17.jpg' },
//     { id: 18, name: "Half-Round Polished Bangle", weight_gm: 14.5, design: 'Mid', image: 'bangle-18.jpg' },
//     { id: 19, name: "Meenakari Accent Bangle", weight_gm: 22.5, design: 'Mid', image: 'bangle-19.jpg' },
//     { id: 20, name: "Traditional Coin Bangle", weight_gm: 16.9, design: 'Mid', image: 'bangle-20.jpg' },
//     // 21-30: Wedding & Kundan Designs (Higher Weight/Charge)
//     { id: 21, name: "Heavy Bridal Kada", weight_gm: 25.5, design: 'Heavy', image: 'bangle-21.jpg' },
//     { id: 22, name: "Kundan Work Diamond Bangle", weight_gm: 28.0, design: 'Heavy', image: 'bangle-22.jpg' },
//     { id: 23, name: "Pachi Work Gemstone Bangle", weight_gm: 30.0, design: 'Heavy', image: 'bangle-23.jpg' },
//     { id: 24, name: "Gold Chura Set (Single Piece)", weight_gm: 32.5, design: 'Heavy', image: 'bangle-24.jpg' },
//     { id: 25, name: "Jadau Pearl Drop Kada", weight_gm: 26.8, design: 'Heavy', image: 'bangle-25.jpg' },
//     { id: 26, name: "Wide Band Engraved Kada", weight_gm: 35.0, design: 'Heavy', image: 'bangle-26.jpg' },
//     { id: 27, name: "Three-Row Filigree Bangle", weight_gm: 24.0, design: 'Heavy', image: 'bangle-27.jpg' },
//     { id: 28, name: "Emerald & Gold Inlay Bangle", weight_gm: 29.5, design: 'Heavy', image: 'bangle-28.jpg' },
//     { id: 29, name: "Ornate Ganesha Design Kada", weight_gm: 31.0, design: 'Heavy', image: 'bangle-29.jpg' },
//     { id: 30, name: "Grand Marriage Ceremony Kada", weight_gm: 33.5, design: 'Heavy', image: 'bangle-30.jpg' },
// ];

// productData.forEach(calculateRealPrice);
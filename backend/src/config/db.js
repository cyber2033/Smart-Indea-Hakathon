/**
 * Resilient Database Layer for Hackathon Reliability
 * Connects to MongoDB Atlas if URI is provided;
 * Automatically falls back to high-speed in-memory store so the demo NEVER crashes.
 */
let isMongoConnected = false;

const inMemoryDB = {
  users: [
    {
      id: "farmer-01",
      phone: "9876543210",
      name: "Ramrao Patil",
      village: "Dindori",
      district: "Nashik",
      state: "Maharashtra",
      preferredLanguage: "mr",
      crops: ["Tomato", "Cotton", "Grapes"]
    }
  ],
  scans: [
    {
      id: "scan-init-01",
      farmerId: "farmer-01",
      crop: "Tomato",
      diseaseName: "Tomato Early Blight",
      diseaseKey: "Tomato___Early_blight",
      confidence: 94.2,
      severity: "Moderate",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      location: "Nashik, MH"
    }
  ],
  procurementTokens: [
    {
      id: "TOKEN-MH-2026-081",
      farmerId: "farmer-01",
      farmerName: "Ramrao Patil",
      centerId: "apmc-nsk-01",
      centerName: "Nashik APMC Cotton & Grain Market Yard",
      commodity: "Soybean",
      quantityQuintals: 25,
      slotTime: "10:30 AM - 12:00 PM",
      slotDate: "Tomorrow",
      status: "CONFIRMED",
      estimatedWaitMinutes: 40,
      createdAt: new Date().toISOString()
    }
  ]
};

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.trim() !== "") {
    try {
      const mongoose = require("mongoose");
      await mongoose.connect(uri);
      isMongoConnected = true;
      console.log("[✓] Connected to MongoDB Atlas successfully.");
      return;
    } catch (err) {
      console.warn("[-] MongoDB connection error:", err.message);
      console.log("[*] Switching seamlessly to In-Memory Zero-Crash Database.");
    }
  } else {
    console.log("[*] No MONGODB_URI found. Running with In-Memory Storage Engine.");
  }
}

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  inMemoryDB
};

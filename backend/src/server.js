require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db");

const scanRoutes = require("./routes/scanRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const procurementRoutes = require("./routes/procurementRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (5173) and production
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount API Routes
app.use("/api/scan", scanRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "online",
    platform: "SIH 2026 Smart Krishi AI & Procurement Platform",
    modules: ["SIH26131-DiseaseDetection", "SIH26032-ProcurementTracking", "WeatherPreventionEngine"],
    time: new Date().toISOString()
  });
});

// Start Server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🌾 SIH 2026 Krishi Backend running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🔬 Disease Scan API: http://localhost:${PORT}/api/scan`);
    console.log(`🌦️ Weather Risk API: http://localhost:${PORT}/api/weather/risk`);
    console.log(`📦 Procurement API: http://localhost:${PORT}/api/procurement/centers`);
    console.log(`====================================================`);
  });
}

startServer();

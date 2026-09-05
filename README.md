# 🌾 स्मार्ट कृषी (Smart Krishi AI) — SIH 2026 Platform
> **Core Problem Statement**: SIH26131 — Crop Disease & Pest Detection (Govt of Maharashtra)  
> **Bonus Differentiator**: SIH26032 — APMC Procurement Schedule & Wait-Time Tracking  
> **Team Structure**: 6 Members (Web/App Full-Stack + AI/ML Specialist)

---

## 🚀 Key Winning Innovations & Differentiation Layers

| Layer | Feature | What It Does | Why Judges Love It |
|---|---|---|---|
| **Layer 1** | **Core AI Disease Detection** | EfficientNetB0 transfer learning diagnosing leaf diseases with **Confidence %** & **Severity Rating** (Early / Moderate / Severe). | Gives actionable clinical triage instead of just a raw label. |
| **Layer 2** | **Proactive Weather Prevention** | OpenWeatherMap + rule-based epidemiological engine tracking humidity & temp to alert farmers **before** fungal outbreaks occur. | "Prevention is cheaper than cure" — saves harvests before damage. |
| **Layer 3** | **APMC Procurement Module** | Complete "Sowing to Selling" journey. Live wait-time tracking, mandi queues, and digital slot token booking. | Unprecedented differentiator in SIH agricultural categories. |
| **Layer 4** | **Offline Mode via TensorFlow Lite** | In-browser / on-device edge execution without internet connection. | Demonstrates live in front of judges with WiFi switched OFF. |
| **Layer 5** | **Multilingual Regional Voice UI** | Native Web Speech API supporting **मराठी (Marathi)**, **हिंदी (Hindi)**, and **English** for both speech-to-text and voice readout. | Extreme empathy & accessibility for rural Indian farmers. |

---

## 🛠️ Complete Tech Stack

- **ML / AI Model**: Python 3.10+, TensorFlow 2.15, Keras EfficientNetB0, PlantVillage + Indian Crop Augmentations, Quantized TFLite export (`model.tflite`).
- **Backend API**: Node.js v24, Express.js, Multer for image processing, Axios, Dual-mode Database (MongoDB Atlas + In-Memory zero-crash fallback).
- **Frontend App**: React 18, Vite, Tailwind CSS 3.x, Lucide Icons, Canvas Confetti, Web Speech API (SpeechRecognition & SpeechSynthesis).
- **Target Crops**: Tomato, Potato, Cotton (Pink Bollworm & Black Arm), Sugarcane (Red Rot), Soybean (Rust & Blight), Chilli (Bacterial Spot).

---

## 📂 Project Structure

```
SIH/
├── frontend/                     # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # ScanCamera, ScanResult, WeatherAlerts, ProcurementModule, VoiceAssistantModal, Navbar
│   │   ├── context/              # LanguageContext (मराठी / हिंदी / English)
│   │   ├── services/             # speechService (Web Speech API), apiService (with offline fallback)
│   │   └── data/                 # Multilingual translation dictionary
│   └── vite.config.js
│
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/               # Resilient DB layer + Weather Epidemiology Rules
│   │   ├── controllers/          # scanController, weatherController, procurementController, authController
│   │   ├── routes/               # scan, weather, procurement, auth routes
│   │   └── server.js             # Main server entry (Port 5000)
│   └── package.json
│
├── ml_model/                     # Python & TensorFlow ML Pipeline
│   ├── notebooks/                # Google Colab Training Notebook (GPU ready)
│   ├── scripts/                  # download_dataset.py, preprocess.py, train.py, export_tflite.py
│   ├── data/                     # class_labels.json, disease_kb.json
│   └── requirements.txt
│
└── docs/
    ├── HACKATHON_DEMO_SCRIPT.md  # 5-minute winning presentation script for judges
    └── JUDGES_QA_PLAYBOOK.md     # Pre-engineered answers for tough technical questions
```

---

## ⚡ Quick Start: Running Locally

### 1. Start the Backend API (Port 5000)
```powershell
cd backend
npm start
```
*Health check available at: `http://localhost:5000/api/health`*

### 2. Start the Frontend Web App (Port 5173)
```powershell
cd frontend
npm run dev
```
*Open `http://localhost:5173` in Google Chrome.*

---

## 🏆 Presentation Playbook
For demo preparation and script, see:
- [`docs/HACKATHON_DEMO_SCRIPT.md`](file:///c:/Users/jdeor/Desktop/Smart%20indea%20Hakathon/SIH/docs/HACKATHON_DEMO_SCRIPT.md)
- [`docs/JUDGES_QA_PLAYBOOK.md`](file:///c:/Users/jdeor/Desktop/Smart%20indea%20Hakathon/SIH/docs/JUDGES_QA_PLAYBOOK.md)

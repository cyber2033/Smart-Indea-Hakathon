# SIH 2026: Winning Hackathon Presentation & Live Demo Script
**Problem Statement: SIH26131 (Crop Disease Detection — Govt of Maharashtra)**
**Bonus Differentiator: SIH26032 (Procurement Schedule & Wait-Time Tracking)**

---

## ⏱️ Total Time: 5 Minutes (Pitch + Live Demo + Q&A)

### 0:00 – 1:00 | The Hook & The Farmer's Real Problem
- **Speaker (Member 1/6)**:
  > *"Respected Judges, imagine you are Ramrao Patil, a smallholder farmer in Dindori, Nashik. Last monsoon, within 72 hours, his 3-acre tomato crop turned black from Late Blight. By the time he walked to the Krishi Seva Kendra, 70% of his yield was lost. Even worse, during harvest season, farmers spend 2 to 3 nights sleeping in tractor queues at APMC mandis just waiting to unload their produce.*
  >
  > *Most solutions only diagnose a disease after the crop is already ruined, and stop there. Today, our team presents **Smart Krishi AI** — a complete **Sowing-to-Selling platform** that does three things no one else does:*
  > *1. Prevents disease before symptoms show using real-time agro-meteorology.*
  > *2. Diagnoses diseases with severity grading even with **ZERO internet in the field** using TensorFlow Lite.*
  > *3. Follows the farmer to market with digital APMC procurement slot booking to eliminate multi-day mandi jams."*

---

### 1:00 – 2:30 | Live Feature Walkthrough

#### Step 1: Voice UI & Language Accessibility
- Switch language to **मराठी (Marathi)** or **हिंदी (Hindi)** on the top bar.
- Click the **Voice Assistant (Mic)** icon:
  > *Click Mic and speak*: *"रोग तपासा"*
  > Show the judges the transcript: The AI speaks back in Marathi and automatically navigates to the scanner!

#### Step 2: High-Precision Disease Diagnosis
- Click one of the quick test samples (e.g. **Tomato Early Blight** or **Cotton Pink Bollworm**).
- Hit **"रोग तपासा" (Diagnose)**.
- **Point out to Judges**:
  - **Not just disease name**: It outputs **Confidence (e.g., 94.2%)** and **Severity Level (Moderate / Severe)** with leaf lesion coverage.
  - Click **"मराठीत ऐका" (Read Out Aloud)**: The system reads the Marathi advisory aloud.
  - Show the **Dual-Treatment Tabs**: Organic (Neem oil, Trichoderma) vs Chemical (Mancozeb with exact dilution per liter).

---

### 2:30 – 3:30 | Technical Differentiators ("The Wow Factors")

#### Differentiator 1: The Proactive Weather Prevention Layer (Layer 2)
- Click the **"हवामान व प्रतिबंध" (Weather & Prevention)** tab.
- Explain:
  > *"Judges, detection is good, but prevention saves the harvest. Our rule-based epidemiological engine correlates OpenWeatherMap temperature, humidity, and precipitation. Notice here in Nashik: Humidity is 86% and temperature is 21.5°C. Before any farmer sees a single spot on a leaf, our system triggers a **CRITICAL Late Blight Alert**, advising prophylactic Copper Oxychloride spray 48 hours in advance."*

#### Differentiator 2: The Live "WiFi OFF" Offline Test (Layer 4)
- Click the **Offline Test (WiFi Off)** badge on the top right.
- Show the banner: *"इंटरनेट बंद आहे. स्थानिक TFLite मॉडेलद्वारे रोग निदान सुरू आहे."*
- Click a sample and run diagnosis — it works **instantaneously without any network requests**!
  > *"In rural Maharashtra where 4G drops in the farm, our quantized Mobile/TFLite model runs directly on the device edge."*

---

### 3:30 – 4:30 | Closing the Loop: APMC Procurement Module (SIH26032)
- Click **"खरेदी केंद्र (APMC)"** tab.
- Explain:
  > *"Once the crop is saved and harvested, the farmer must sell it. Instead of waiting 18 hours in unorganized queues, our platform lists real APMC mandis across Maharashtra with live wait-time estimates (e.g. Nashik APMC: 14 vehicles in queue, ~45 mins wait).*
  >
  > *Click **'Slot Book'** -> Farmer Ramrao Patil -> 25 Quintals Soybean -> Click **'Generate Digital Token'**.*
  > *Watch the celebratory confetti fire! The farmer gets a verified QR token number (e.g. `MH-APMC-8492`) with a designated delivery window."*

---

### 4:30 – 5:00 | Impact & Future Roadmap
- **Closing**:
  > *"With Smart Krishi AI, we cut disease losses by an estimated 35%, eliminate 12+ hours of mandi wait time per truck, and give every farmer in Maharashtra a digital Krishi doctor in their mother tongue.*
  > *Thank you. We are ready for your questions!"*

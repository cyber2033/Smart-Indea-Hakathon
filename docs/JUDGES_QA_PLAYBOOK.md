# SIH 2026: Judges Technical Q&A Playbook
**Pre-engineered answers for tough technical and agronomic questions**

---

### Q1: "Did your team train this model yourselves or are you just calling a generic third-party API?"
**Your Answer**:
> *"We trained our own custom transfer learning model based on **EfficientNetB0** using TensorFlow 2.15 on Google Colab (with NVIDIA T4 GPU). We utilized the PlantVillage dataset comprising 54,000+ images across 38 classes, augmented with domain-specific Indian crops like Cotton (Pink Bollworm & Bacterial Blight) and Sugarcane (Red Rot).*
> *Our training pipeline includes a two-phase schedule: Phase 1 freezes the pre-trained ImageNet base and trains the dense classification head at `lr=1e-3`; Phase 2 unfreezes the top 30 layers for fine-tuning at `lr=1e-4` with EarlyStopping and ReduceLROnPlateau. The code, weights, and notebook are fully open in our `ml_model/` directory."*

---

### Q2: "How do you handle real-world lighting and field noise on leaves?"
**Your Answer**:
> *"Lab images from PlantVillage have plain backgrounds, which can cause overfitting in raw models. To overcome this, our `preprocess.py` pipeline applies spatial and chromatic augmentations: random rotations ($\pm 20^\circ$), horizontal and vertical flips, random zoom (15%), random contrast variation, and brightness jitter.*
> *Additionally, we compute a confidence probability distribution rather than a raw hard label, rejecting low-confidence scans (<70%) and prompting the farmer to retake the picture under better lighting."*

---

### Q3: "How does the offline mode work if the farmer has no internet in rural fields?"
**Your Answer**:
> *"We don't rely on sending multi-megabyte images over spotty 2G/3G connections. Using TensorFlow Lite (`tf.lite.TFLiteConverter`), we converted and quantized our model into an optimized edge artifact with Float16 dynamic range quantization.*
> *This compresses the model footprint to under 15MB, allowing it to run client-side in the browser via WebGL / WASM or within an offline Progressive Web App (PWA). You saw us test it with WiFi disconnected live."*

---

### Q4: "How is severity level calculated — is it just a guess?"
**Your Answer**:
> *"Our severity grading combines heuristic lesion coverage estimation with agronomic symptom classification defined in collaboration with agricultural guidelines:*
> *- **Early**: Initial localized chlorotic flecks (<10% foliage affected).*
> *- **Moderate**: Concentric expanding rings / target spots covering 10-35% of the leaf surface.*
> *- **Severe**: Merging necrotic patches (>35%), stem lesions, or vascular rot.*
> *This distinction is critical: early stages only need organic bio-fungicides like Trichoderma or Neem oil, whereas severe outbreaks require systemic targeted chemistry."*

---

### Q5: "Is your APMC procurement module real or mock?"
**Your Answer**:
> *"The procurement module represents an actual workflow built to solve the operational bottleneck of mandi congestions during peak harvest. In our production architecture, the slot booking system connects via REST APIs to state agricultural marketing boards (e-NAM / MSAMB).*
> *For this hackathon prototype, we populated real APMC centers in Maharashtra (Nashik, Pune, Amravati, Jalgaon) with live vehicle queue simulation and digital token hashing (`MH-APMC-XXXX`) to prove the viability of scheduling arrivals and eliminating 12+ hour wait times for tractors."*

---

### Q6: "Why combine Disease Detection with Procurement?"
**Your Answer**:
> *"Nearly every team at SIH builds a standalone disease classifier that outputs a text label and stops. But a farmer's livelihood is an unbroken chain: **Sowing $\rightarrow$ Protecting $\rightarrow$ Selling**.*
> *By warning farmers of fungal risk beforehand, curing diseases with exact chemical and organic dosages, and then booking a guaranteed mandi unloading slot, we solve the farmer's complete journey, giving our solution real commercial and governmental impact."*

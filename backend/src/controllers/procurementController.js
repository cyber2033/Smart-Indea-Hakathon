const { inMemoryDB } = require("../config/db");

const PROCUREMENT_CENTERS = [
  {
    id: "apmc-nsk-01",
    name: "Nashik APMC Grain & Cotton Yard (नाशिक कृषी उत्पन्न बाजार समिती)",
    district: "Nashik",
    location: "Dindori Road, Panchavati, Nashik",
    contact: "+91 253 2512345",
    activeCommodities: [
      { name: "Soybean", mspRate: "₹4,892 / Quintal", openTime: "08:00 AM - 05:00 PM" },
      { name: "Cotton (Medium Staple)", mspRate: "₹7,121 / Quintal", openTime: "09:00 AM - 06:00 PM" },
      { name: "Tomato", marketRate: "₹1,850 - ₹2,400 / Quintal", openTime: "06:00 AM - 02:00 PM" },
      { name: "Onion", marketRate: "₹1,450 - ₹2,100 / Quintal", openTime: "06:00 AM - 04:00 PM" }
    ],
    queueStatus: {
      vehiclesInQueue: 14,
      estimatedWaitMinutes: 45,
      capacityPerDay: 120,
      todayProcessed: 78,
      statusBadge: "MODERATE_WAIT"
    }
  },
  {
    id: "apmc-pune-02",
    name: "Pune APMC Market Yard (गुलटेकडी मार्केट यार्ड, पुणे)",
    district: "Pune",
    location: "Gultekdi, Pune",
    contact: "+91 20 24267890",
    activeCommodities: [
      { name: "Soybean", mspRate: "₹4,892 / Quintal", openTime: "08:00 AM - 05:00 PM" },
      { name: "Paddy / Rice (Common)", mspRate: "₹2,300 / Quintal", openTime: "09:00 AM - 05:00 PM" },
      { name: "Vegetables & Chilli", marketRate: "₹2,800 - ₹3,600 / Quintal", openTime: "05:00 AM - 01:00 PM" }
    ],
    queueStatus: {
      vehiclesInQueue: 6,
      estimatedWaitMinutes: 20,
      capacityPerDay: 150,
      todayProcessed: 110,
      statusBadge: "LOW_WAIT"
    }
  },
  {
    id: "apmc-amr-03",
    name: "Amravati Cotton Federation Procurement Hub (अमरावती कापूस खरेदी केंद्र)",
    district: "Amravati",
    location: "Badnera Road, Amravati",
    contact: "+91 721 2671234",
    activeCommodities: [
      { name: "Cotton (Long Staple)", mspRate: "₹7,521 / Quintal", openTime: "08:30 AM - 06:30 PM" },
      { name: "Soybean", mspRate: "₹4,892 / Quintal", openTime: "08:30 AM - 05:30 PM" },
      { name: "Tur / Pigeon Pea", mspRate: "₹7,550 / Quintal", openTime: "09:00 AM - 05:00 PM" }
    ],
    queueStatus: {
      vehiclesInQueue: 28,
      estimatedWaitMinutes: 110,
      capacityPerDay: 90,
      todayProcessed: 42,
      statusBadge: "HIGH_WAIT"
    }
  },
  {
    id: "apmc-jlg-04",
    name: "Jalgaon APMC & Cotton Yard (जळगाव कृषी उत्पन्न बाजार समिती)",
    district: "Jalgaon",
    location: "Navi Peth, Jalgaon",
    contact: "+91 257 2223456",
    activeCommodities: [
      { name: "Cotton (Medium Staple)", mspRate: "₹7,121 / Quintal", openTime: "08:00 AM - 06:00 PM" },
      { name: "Maize (Corn)", mspRate: "₹2,225 / Quintal", openTime: "08:00 AM - 05:00 PM" },
      { name: "Banana", marketRate: "₹1,200 - ₹1,800 / Quintal", openTime: "07:00 AM - 03:00 PM" }
    ],
    queueStatus: {
      vehiclesInQueue: 11,
      estimatedWaitMinutes: 35,
      capacityPerDay: 100,
      todayProcessed: 65,
      statusBadge: "MODERATE_WAIT"
    }
  }
];

exports.getCenters = (req, res) => {
  const district = req.query.district;
  let centers = PROCUREMENT_CENTERS;
  if (district) {
    centers = centers.filter(c => c.district.toLowerCase() === district.toLowerCase());
  }
  return res.status(200).json({
    success: true,
    count: centers.length,
    data: centers
  });
};

exports.bookSlot = (req, res) => {
  const { farmerName, phone, centerId, commodity, quantityQuintals, vehicleNumber, requestedDate, requestedSlot } = req.body;
  
  if (!farmerName || !centerId || !commodity || !quantityQuintals) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing: farmerName, centerId, commodity, quantityQuintals"
    });
  }

  const center = PROCUREMENT_CENTERS.find(c => c.id === centerId) || PROCUREMENT_CENTERS[0];
  const tokenNumber = `MH-APMC-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBooking = {
    id: `token-${Date.now()}`,
    tokenNumber,
    farmerName,
    phone: phone || "9876543210",
    centerId: center.id,
    centerName: center.name,
    commodity,
    quantityQuintals: parseFloat(quantityQuintals),
    vehicleNumber: vehicleNumber || "MH-15-AB-4321",
    slotDate: requestedDate || "Tomorrow",
    slotTime: requestedSlot || "10:00 AM - 11:30 AM",
    status: "CONFIRMED",
    estimatedWaitMinutes: center.queueStatus.estimatedWaitMinutes,
    qrPayload: `SIH2026:${tokenNumber}:${center.id}:${quantityQuintals}Q`,
    createdAt: new Date().toISOString()
  };

  inMemoryDB.procurementTokens.unshift(newBooking);

  return res.status(201).json({
    success: true,
    message: "Procurement delivery slot booked successfully! Digital token generated.",
    data: newBooking
  });
};

exports.getTokens = (req, res) => {
  return res.status(200).json({
    success: true,
    data: inMemoryDB.procurementTokens
  });
};

exports.getTokenById = (req, res) => {
  const token = inMemoryDB.procurementTokens.find(
    t => t.tokenNumber === req.params.tokenId || t.id === req.params.tokenId
  );
  if (!token) {
    return res.status(404).json({ success: false, message: "Token not found" });
  }
  return res.status(200).json({ success: true, data: token });
};

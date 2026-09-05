/**
 * Agricultural Weather Risk Engine (Prevention Layer)
 * Translates temperature, humidity, rainfall into early warning alerts for Indian crops.
 */

const WEATHER_EPIDEMIOLOGY_RULES = [
  {
    id: "late_blight_alert",
    name: "Late Blight High Risk Warning (बटाटा/टोमॅटो उशिराचा करपा धोका)",
    targetCrops: ["Tomato", "Potato"],
    condition: (temp, humidity, rain) => humidity >= 80 && temp >= 14 && temp <= 24,
    riskLevel: "CRITICAL",
    color: "red",
    advisory: {
      en: "Sustained humidity (>80%) and cool temperatures (14-24°C) favor severe Phytophthora fungal outbreak. Spray prophylactic Copper Oxychloride (3g/L) before leaf symptoms develop.",
      mr: "सलग दमट हवामान (>80% आर्द्रता) आणि 14-24°C तापमानामुळे करपा रोगाचा तीव्र फैलाव होऊ शकतो. पानांवर डाग येण्यापूर्वीच कॉपर ऑक्सीक्लोराईड (3 ग्रॅम/लिटर) ची प्रतिबंधक फवारणी करा.",
      hi: "लगातार 80% से अधिक नमी और 14-24°C तापमान से पछेती झुलसा का भारी खतरा है। लक्षण दिखने से पहले कॉपर ऑक्सीक्लोराइड (3 ग्राम/लीटर) का छिड़काव करें।"
    }
  },
  {
    id: "powdery_mildew_alert",
    name: "Powdery Mildew Fungal Risk (भुरी रोग पूर्वसूचना)",
    targetCrops: ["Grapes", "Chilli", "Tomato"],
    condition: (temp, humidity) => humidity >= 65 && humidity <= 85 && temp >= 22 && temp <= 30,
    riskLevel: "MODERATE",
    color: "amber",
    advisory: {
      en: "Warm days with high relative humidity accelerate Powdery Mildew spore germination. Apply Wettable Sulphur 80% WP @ 2g/L.",
      mr: "उबदार दिवस आणि मध्यम-जास्त आर्द्रतेमुळे भुरी रोगाचे बीजाणू वाढतात. प्रतिबंधात्मक विद्राव्य गंधक (Sulfur 80% WP) 2 ग्रॅम/लिटर फवारा.",
      hi: "गर्म दिनों और अधिक आर्द्रता के कारण चूर्णिल आसिता (भूरी) का प्रकोप हो सकता है। सल्फर 80% WP (2 ग्राम/लीटर) का छिड़काव करें।"
    }
  },
  {
    id: "bollworm_pest_flare",
    name: "Pest & Bollworm Flare Warning (बोंडअळी व रसशोषक कीड पूर्वसूचना)",
    targetCrops: ["Cotton", "Soybean"],
    condition: (temp, humidity) => temp >= 31 && humidity <= 60,
    riskLevel: "HIGH",
    color: "orange",
    advisory: {
      en: "High daytime temperatures combined with dry spells stimulate rapid bollworm egg hatching and sucking pest reproduction. Install yellow sticky & pheromone traps immediately.",
      mr: "जास्त तापमान आणि कोरडे हवामान यामुळे बोंडअळीची अंडी उबवणे व रसशोषक किडींचे प्रमाण झपाट्याने वाढते. शेतात त्वरित कामगंध व पिवळे चिकट सापळे लावा.",
      hi: "अधिक तापमान और शुष्क मौसम के कारण बोंडअळी और रसचूसक कीटों में वृद्धि हो सकती है। तुरंत फेरोमोन ट्रैप लगाएं।"
    }
  },
  {
    id: "waterlogging_rootrot",
    name: "Excess Soil Moisture & Root Rot (पाणथळ व मूळकुज धोका)",
    targetCrops: ["Soybean", "Cotton", "Sugarcane"],
    condition: (temp, humidity, rain) => rain >= 25,
    riskLevel: "WARNING",
    color: "blue",
    advisory: {
      en: "Excessive precipitation predicted. Prepare drainage channels to prevent water stagnation and root suffocation / fungal wilt.",
      mr: "मुसळधार पावसाचा अंदाज. शेतात पाणी साचून मूळकुज होऊ नये म्हणून पाण्याचा निचरा करण्यासाठी चारी काढा.",
      hi: "भारी वर्षा का अनुमान है। खेत में जलभराव रोकने के लिए तुरंत जलनिकासी नालियां बनाएं।"
    }
  }
];

function evaluateWeatherRisk(temp, humidity, rain = 0) {
  const activeAlerts = [];
  
  for (const rule of WEATHER_EPIDEMIOLOGY_RULES) {
    if (rule.condition(temp, humidity, rain)) {
      activeAlerts.push({
        id: rule.id,
        name: rule.name,
        crops: rule.targetCrops,
        riskLevel: rule.riskLevel,
        color: rule.color,
        advisory: rule.advisory
      });
    }
  }
  
  // If no specific outbreak rule triggered, return safe condition
  if (activeAlerts.length === 0) {
    activeAlerts.push({
      id: "safe_growth_conditions",
      name: "Favorable Growing Conditions (पीक वाढीस अनुकूल हवामान)",
      crops: ["All Crops"],
      riskLevel: "LOW",
      color: "green",
      advisory: {
        en: "Current weather parameters are within normal safe range. Continue standard intercultural operations and soil mulching.",
        mr: "सध्याचे हवामान पिकांसाठी अनुकूल आहे. नियमित मशागत व सिंचन सुरू ठेवा.",
        hi: "वर्तमान मौसम फसलों के लिए अनुकूल है। सामान्य कृषि कार्य जारी रखें।"
      }
    });
  }

  return activeAlerts;
}

module.exports = {
  WEATHER_EPIDEMIOLOGY_RULES,
  evaluateWeatherRisk
};

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { speechService } from '../services/speechService';
import { 
  CheckCircle, 
  AlertTriangle, 
  Volume2, 
  ShieldCheck, 
  Beaker, 
  Sprout, 
  ArrowRight, 
  Activity, 
  Calendar, 
  RotateCcw, 
  Sparkles,
  Info,
  Bug,
  CloudSun
} from 'lucide-react';

export default function ScanResult({ result, onReset, onNavigateToProcurement }) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('organic');
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!result) return null;

  // Disease name based on current language
  const displayName = language === 'mr' 
    ? (result.name_mr || result.name_en)
    : (language === 'hi' 
        ? (result.name_hi || result.name_en) 
        : (language === 'ml' ? (result.name_ml || result.name_en) : result.name_en));
        
  const displayCrop = language === 'mr' 
    ? (result.crop_mr || result.crop) 
    : (language === 'hi' 
        ? (result.crop_hi || result.crop) 
        : (language === 'ml' ? (result.crop_ml || result.crop) : result.crop));

  // Localized pathogen
  const displayPathogen = language === 'mr'
    ? (result.pathogen_mr || result.pathogen)
    : (language === 'hi' ? (result.pathogen_hi || result.pathogen) : result.pathogen);

  // Localized spread factors
  const displaySpreadFactors = language === 'mr'
    ? (result.spreadFactors_mr || result.spreadFactors)
    : (language === 'hi' ? (result.spreadFactors_hi || result.spreadFactors) : result.spreadFactors);

  // Localized severity description
  const displaySeverityDescription = language === 'mr'
    ? (result.severityDescription_mr || result.severityDescription)
    : (language === 'hi' ? (result.severityDescription_hi || result.severityDescription) : result.severityDescription);

  // Localized treatments extraction
  const getTreatments = () => {
    const tr = result.treatments || {};
    if (activeTab === 'organic') {
      if (language === 'mr' && tr.organic_mr) return tr.organic_mr;
      if (language === 'hi' && tr.organic_hi) return tr.organic_hi;
      return tr.organic || [];
    }
    if (activeTab === 'chemical') {
      if (language === 'mr' && tr.chemical_mr) return tr.chemical_mr;
      if (language === 'hi' && tr.chemical_hi) return tr.chemical_hi;
      return tr.chemical || [];
    }
    if (activeTab === 'cultural') {
      if (language === 'mr' && tr.cultural_mr) return tr.cultural_mr;
      if (language === 'hi' && tr.cultural_hi) return tr.cultural_hi;
      return tr.cultural || [];
    }
    return [];
  };

  // Severity color calculation
  const getSeverityStyle = (sev) => {
    switch ((sev || '').toLowerCase()) {
      case 'early':
        return { 
          bg: 'bg-amber-50', 
          text: 'text-amber-900', 
          border: 'border-amber-200', 
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: t('severityEarly'),
          iconColor: 'text-amber-600'
        };
      case 'moderate':
        return { 
          bg: 'bg-orange-50', 
          text: 'text-orange-900', 
          border: 'border-orange-200', 
          badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
          label: t('severityModerate'),
          iconColor: 'text-orange-600'
        };
      case 'severe':
        return { 
          bg: 'bg-red-50', 
          text: 'text-red-900', 
          border: 'border-red-200', 
          badgeBg: 'bg-red-100 text-red-900 border-red-300',
          label: t('severitySevere'),
          iconColor: 'text-red-600'
        };
      default:
        return { 
          bg: 'bg-emerald-50', 
          text: 'text-emerald-900', 
          border: 'border-emerald-200', 
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          label: 'Healthy (निरोगी)',
          iconColor: 'text-emerald-600'
        };
    }
  };

  const sevStyle = getSeverityStyle(result.severity);

  // Read out aloud in Marathi/Hindi/Malayalam/English
  const handleVoiceReadout = () => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    let speechText = "";
    const primaryCure = getTreatments()[0] || "";
    if (language === 'mr') {
      speechText = `पिकाचे नाव ${displayCrop}. संभाव्य रोग निदान: ${displayName}. AI जुळणी संभाव्यता ${result.confidence} टक्के. तीव्रता: ${sevStyle.label}. मुख्य उपाय: ${primaryCure}.`;
    } else if (language === 'hi') {
      speechText = `फसल का नाम ${displayCrop}. संभावित रोग निदान: ${displayName}. AI मिलान संभाव्यता ${result.confidence} प्रतिशत. गंभीरता: ${sevStyle.label}. मुख्य उपाय: ${primaryCure}.`;
    } else if (language === 'ml') {
      speechText = `വിള: ${displayCrop}. സാധ്യമായ രോഗനിർണ്ണയം: ${displayName}. AI സാധ്യത: ${result.confidence} ശതമാനം. തീവ്രത: ${sevStyle.label}.`;
    } else {
      speechText = `Crop: ${result.crop}. Probable Diagnosis: ${result.name_en}. AI Match Score: ${result.confidence} percent. Severity: ${result.severity}.`;
    }

    setIsSpeaking(true);
    speechService.speakText(speechText, language, () => {
      setIsSpeaking(false);
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 transition-all animate-fadeIn">
      
      {/* 1. TOP RESULT HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-gray-100 gap-6">
        
        {/* Left: Crop, Badges & Disease Title */}
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-agri-100 text-agri-900 border border-agri-300 uppercase tracking-wide">
              🌿 {displayCrop}
            </span>
            
            {/* Severity Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-xs ${sevStyle.badgeBg}`}>
              <AlertTriangle className={`w-3.5 h-3.5 ${sevStyle.iconColor}`} />
              <span>{t('severity')}: {sevStyle.label}</span>
            </span>

            {result.isOfflineMode && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                ⚡ TFLite Offline Edge AI
              </span>
            )}
          </div>

          {/* Large Clear Disease Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight">
            {displayName}
          </h2>

          {/* Pathogen & Spread Environment Sub-line */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-gray-600 font-medium">
            <span className="flex items-center gap-1 text-gray-800 font-bold">
              <Bug className="w-3.5 h-3.5 text-agri-700" />
              {displayPathogen}
            </span>
            {displaySpreadFactors && (
              <>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="flex items-center gap-1 text-gray-600">
                  <CloudSun className="w-3.5 h-3.5 text-amber-600" />
                  {displaySpreadFactors}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Modern AI Metric Box & Voice Readout */}
        <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
          
          {/* AI Match Score Gauge */}
          <div className="flex items-center gap-3 bg-gradient-to-br from-agri-50 to-emerald-50 px-4 py-3 rounded-2xl border border-agri-200 shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-3 border-agri-600 shadow-inner shrink-0">
              <span className="text-sm font-black text-agri-950">
                {result.confidence}%
              </span>
            </div>
            <div className="text-left">
              <span className="text-[10px] sm:text-[11px] text-gray-600 font-bold uppercase tracking-wider block">
                {t('confidence')}
              </span>
              <span className="text-xs text-agri-800 font-bold flex items-center gap-1 mt-0.5 whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 text-agri-600" />
                {t('confidenceSubtitle') || 'AI अंदाज (Advisory)'}
              </span>
            </div>
          </div>

          {/* Voice Readout Button */}
          <button
            onClick={handleVoiceReadout}
            className={`px-4 py-3 rounded-2xl border transition-all shadow-md flex items-center gap-2 active:scale-95 ${
              isSpeaking
                ? 'bg-amber-500 border-amber-600 text-white animate-pulse shadow-amber-500/30'
                : 'bg-agri-700 hover:bg-agri-800 text-white border-agri-800 shadow-agri-700/20'
            }`}
            title={t('listenAudio')}
          >
            <Volume2 className="w-5 h-5 text-amber-300 shrink-0" />
            <span className="text-xs font-bold whitespace-nowrap">
              {isSpeaking ? t('speaking') : t('listenAudio')}
            </span>
          </button>
        </div>

      </div>

      {/* 2. SEVERITY & SYMPTOM ANALYSIS BOX */}
      {displaySeverityDescription && (
        <div className={`mt-5 p-4 rounded-2xl border flex items-start gap-3 ${sevStyle.bg} ${sevStyle.border}`}>
          <AlertTriangle className={`w-5 h-5 ${sevStyle.iconColor} shrink-0 mt-0.5`} />
          <div>
            <span className={`text-xs font-black uppercase tracking-wider ${sevStyle.text} block mb-0.5`}>
              {t('analysisTitle') || 'तीव्रता व लक्षण विश्लेषण'}:
            </span>
            <p className={`text-xs sm:text-sm ${sevStyle.text} font-semibold leading-relaxed`}>
              {displaySeverityDescription}
            </p>
          </div>
        </div>
      )}

      {/* 3. STEP-BY-STEP CURATIVE & PREVENTION GUIDE */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {t('treatments')}
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            (Step-by-step Curative & Prevention Guide)
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100/90 rounded-2xl border border-gray-200 mb-5">
          
          <button
            onClick={() => setActiveTab('organic')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'organic'
                ? 'bg-white text-agri-900 shadow-md border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>{t('organicTreatments')}</span>
          </button>

          <button
            onClick={() => setActiveTab('chemical')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'chemical'
                ? 'bg-white text-agri-900 shadow-md border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Beaker className="w-4 h-4 text-amber-600" />
            <span>{t('chemicalTreatments')}</span>
          </button>

          <button
            onClick={() => setActiveTab('cultural')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'cultural'
                ? 'bg-white text-agri-900 shadow-md border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span>{t('culturalPractices')}</span>
          </button>

        </div>

        {/* Treatments List Content */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 border border-gray-200">
          <ul className="space-y-3">
            {getTreatments().map((cure, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-800 bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-agri-100 text-agri-900 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 border border-agri-300">
                  {idx + 1}
                </span>
                <span className="font-medium leading-relaxed">{cure}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* 4. SCIENTIFIC AI ADVISORY DISCLAIMER */}
      <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-bold block mb-0.5 text-amber-900">
            {t('advisoryNote') || 'कृषी सल्ला सूचना (Advisory Note)'}:
          </strong>
          <span className="text-amber-900/90 font-medium">
            {t('advisoryText') || 'सदर निदान हे AI व्हिजन मॉडेल विश्लेषणावर आधारित संभाव्य अंदाज आहे. शेतात रासायनिक फवारणी किंवा महत्त्वाचा निर्णय घेण्यापूर्वी स्थानिक कृषी सहाय्यक किंवा तज्ज्ञांचा सल्ला घ्यावा.'}
          </span>
        </div>
      </div>

      {/* 5. ACTION BUTTONS: New Scan + Differentiator APMC Procurement Module */}
      <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('scanAnother') || 'पुढील पान तपासा (Scan Another)'}</span>
        </button>

        {onNavigateToProcurement && (
          <button
            onClick={onNavigateToProcurement}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-agri-700 to-agri-800 hover:from-agri-800 hover:to-agri-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-agri-700/20 transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>{t('goToProcurement') || 'मंडी खरेदी केंद्र व टोकन नोंदणी'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
}

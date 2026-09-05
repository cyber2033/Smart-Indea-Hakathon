import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { speechService } from '../services/speechService';
import { CheckCircle, AlertTriangle, Volume2, ShieldCheck, Beaker, Sprout, ArrowRight, Activity, Calendar } from 'lucide-react';

export default function ScanResult({ result, onReset, onNavigateToProcurement }) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('organic');
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!result) return null;

  // Disease name based on current language
  const displayName = language === 'mr' 
    ? result.name_mr 
    : (language === 'hi' 
        ? result.name_hi 
        : (language === 'ml' ? (result.name_ml || result.name_en) : result.name_en));
  const displayCrop = language === 'mr' 
    ? result.crop_mr 
    : (language === 'hi' 
        ? result.crop_hi 
        : (language === 'ml' ? (result.crop_ml || result.crop) : result.crop));

  // Severity color calculation
  const getSeverityStyle = (sev) => {
    switch ((sev || '').toLowerCase()) {
      case 'early':
        return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', label: t('severityEarly') };
      case 'moderate':
        return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', label: t('severityModerate') };
      case 'severe':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', label: t('severitySevere') };
      default:
        return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', label: 'Healthy' };
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
    if (language === 'mr') {
      speechText = `पिकाचे नाव ${displayCrop}. रोग निदान: ${displayName}. खात्री प्रमाण ${result.confidence} टक्के. तीव्रता: ${sevStyle.label}. मुख्य सेंद्रिय उपाय: ${result.treatments?.organic?.[0] || 'नियमित काळजी घ्या'}.`;
    } else if (language === 'hi') {
      speechText = `फसल का नाम ${displayCrop}. रोग निदान: ${displayName}. सटीकता ${result.confidence} प्रतिशत. गंभीरता: ${sevStyle.label}. मुख्य जैविक उपचार: ${result.treatments?.organic?.[0] || 'नियमित देखभाल करें'}.`;
    } else if (language === 'ml') {
      speechText = `വിള: ${displayCrop}. രോഗനിർണ്ണയം: ${displayName}. കൃത്യത: ${result.confidence} ശതമാനം. തീവ്രത: ${sevStyle.label}. പ്രധാന ജൈവ ചികിത്സ: ${result.treatments?.organic?.[0] || 'വിള നിരീക്ഷിക്കുക'}.`;
    } else {
      speechText = `Crop: ${result.crop}. Diagnosis: ${result.name_en}. Confidence: ${result.confidence} percent. Severity: ${result.severity}. Recommended organic treatment: ${result.treatments?.organic?.[0] || 'Monitor crop'}.`;
    }

    setIsSpeaking(true);
    speechService.speakText(speechText, language, () => {
      setIsSpeaking(false);
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 transition-all animate-fadeIn">
      
      {/* Top Banner: Diagnosis Result + Confidence Meter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-6">
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-agri-100 text-agri-800 border border-agri-200 uppercase">
              {displayCrop}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}>
              {sevStyle.label}
            </span>
            {result.isOfflineMode && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                TFLite Offline
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {displayName}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            {result.pathogen} • {result.spreadFactors}
          </p>
        </div>

        {/* Confidence Ring & Voice Readout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-agri-50 border-4 border-agri-600">
              <span className="text-sm font-black text-agri-900">
                {result.confidence}%
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-semibold block">{t('confidence')}</span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> High Precision
              </span>
            </div>
          </div>

          {/* Voice Readout Button */}
          <button
            onClick={handleVoiceReadout}
            className={`p-3.5 rounded-2xl border transition-all shadow-sm flex flex-col items-center justify-center gap-1 ${
              isSpeaking
                ? 'bg-amber-100 border-amber-400 text-amber-800 animate-pulse'
                : 'bg-agri-700 hover:bg-agri-800 text-white border-agri-700 shadow-agri-700/20'
            }`}
            title={t('listenAudio')}
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-[10px] font-bold whitespace-nowrap">
              {isSpeaking ? t('speaking') : t('listenAudio')}
            </span>
          </button>
        </div>

      </div>

      {/* Severity Indicator Description */}
      {result.severityDescription && (
        <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-amber-900 block">{t('severity')} विश्लेषण:</span>
            <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
              {result.severityDescription}
            </p>
          </div>
        </div>
      )}

      {/* Treatments Section */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-agri-700" />
          {t('treatments')}
        </h3>

        {/* Treatment Tabs */}
        <div className="flex border-b border-gray-200 mb-5">
          <button
            onClick={() => setActiveTab('organic')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'organic'
                ? 'border-agri-700 text-agri-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-600" />
            {t('organicTreatments')}
          </button>

          <button
            onClick={() => setActiveTab('chemical')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'chemical'
                ? 'border-agri-700 text-agri-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Beaker className="w-4 h-4 text-blue-600" />
            {t('chemicalTreatments')}
          </button>

          <button
            onClick={() => setActiveTab('cultural')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'cultural'
                ? 'border-agri-700 text-agri-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-harvest-600" />
            {t('culturalPractices')}
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200">
          {activeTab === 'organic' && (
            <ul className="space-y-3">
              {(result.treatments?.organic || []).map((cure, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{cure}</span>
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'chemical' && (
            <ul className="space-y-3">
              {(result.treatments?.chemical || []).map((cure, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{cure}</span>
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'cultural' && (
            <ul className="space-y-3">
              {(result.treatments?.cultural || [
                "Ensure proper plant spacing for sunlight penetration.",
                "Avoid overhead irrigation during high humidity hours.",
                "Burn or deeply bury infected residues after harvest."
              ]).map((cure, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                  <span className="w-5 h-5 rounded-full bg-harvest-100 text-harvest-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{cure}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* Differentiator Action: Connect to SIH26032 Procurement Module */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm transition-all"
        >
          ← नवीन पान तपासा (Scan Another)
        </button>

        <button
          onClick={onNavigateToProcurement}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-700/20 transition-all"
        >
          <Calendar className="w-4 h-4" />
          <span>शेतातून बाजारात: खरेदी केंद्राची वेळ नोंदवा (Procurement)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}

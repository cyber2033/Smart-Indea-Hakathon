import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { speechService } from '../services/speechService';
import { Mic, MicOff, Volume2, X, Sparkles, ArrowRight } from 'lucide-react';

export default function VoiceAssistantModal({ isOpen, onClose, onActionTrigger }) {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [recognitionObj, setRecognitionObj] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionObj) {
        try { recognitionObj.abort(); } catch (e) {}
      }
      setIsListening(false);
      setTranscript('');
      setAssistantReply('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startVoiceInput = () => {
    setTranscript('');
    setAssistantReply('');
    setIsListening(true);

    const rec = speechService.startListening({
      lang: language,
      onResult: (text) => {
        setTranscript(text);
        handleVoiceCommand(text);
      },
      onError: (err) => {
        setIsListening(false);
        console.warn('Voice recognition error:', err);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    setRecognitionObj(rec);
  };

  const handleVoiceCommand = (rawText) => {
    const text = rawText.toLowerCase();
    let reply = '';
    let action = null;

    if (text.includes('रोग') || text.includes('पान') || text.includes('तपास') || text.includes('scan') || text.includes('disease') || text.includes('जांच') || text.includes('രോഗ') || text.includes('ഇല') || text.includes('പരിശോധിക്ക')) {
      reply = language === 'mr' 
        ? 'कॅमेरा उघडत आहे, कृपया रोगट पानाचा फोटो दाखवा.' 
        : (language === 'hi' 
            ? 'कैमरा शुरू किया जा रहा है, कृपया संक्रमित पत्ता दिखाएं।' 
            : (language === 'ml' ? 'ക്യാമറ തുറക്കുന്നു, ദയവായി രോഗബാധിതമായ ഇല കാണിക്കുക.' : 'Opening scanner, please position the leaf.'));
      action = 'scan';
    } else if (text.includes('हवामान') || text.includes('weather') || text.includes('पाऊस') || text.includes('मौसम') || text.includes('കാലാവസ്ഥ') || text.includes('മഴ')) {
      reply = language === 'mr' 
        ? 'हवामान आणि बुरशी जोखीम अहवाल दाखवत आहे.' 
        : (language === 'hi' 
            ? 'मौसम एवं बीमारी रोकथाम रिपोर्ट दिखाई जा रही है।' 
            : (language === 'ml' ? 'കാലാവസ്ഥയും രോഗസാധ്യതാ മുൻകരുതലും കാണിക്കുന്നു.' : 'Showing weather-based epidemic prevention advisory.'));
      action = 'weather';
    } else if (text.includes('खरेदी') || text.includes('मंडी') || text.includes('बाजार') || text.includes('apmc') || text.includes('market') || text.includes('procurement') || text.includes('സംഭരണ') || text.includes('മാർക്കറ്റ്')) {
      reply = language === 'mr' 
        ? 'जवळचे शासकीय खरेदी केंद्र आणि रांगेची वेळ उघडत आहे.' 
        : (language === 'hi' 
            ? 'नजदीकी मंडी और टोकन बुकिंग स्क्रीन दिखाई जा रही है।' 
            : (language === 'ml' ? 'സമീപത്തെ സംഭരണ കേന്ദ്രവും ക്യൂ വിവരങ്ങളും തുറക്കുന്നു.' : 'Opening APMC procurement yard tracker.'));
      action = 'procurement';
    } else {
      reply = language === 'mr' 
        ? `समजले: "${rawText}". मी तुम्हाला रोग तपासणी, हवामान अंदाज किंवा खरेदी केंद्र पाहण्यास मदत करू शकतो.` 
        : (language === 'hi'
            ? `समझ गया: "${rawText}". आप रोग जांच, मौसम रिपोर्ट या खरीद केंद्र की जानकारी ले सकते हैं।`
            : (language === 'ml' 
                ? `മനസ്സിലായി: "${rawText}". വിള രോഗ പരിശോധന, കാലാവസ്ഥ, സംഭരണ കേന്ദ്രങ്ങൾ എന്നിവ ചോദിക്കാം.`
                : `Understood: "${rawText}". You can ask to check crop disease, weather alerts, or procurement mandis.`));
    }

    setAssistantReply(reply);
    speechService.speakText(reply, language);

    if (action) {
      setTimeout(() => {
        onActionTrigger(action);
        onClose();
      }, 2400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-center relative overflow-hidden">
        
        {/* Background glow circle */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-agri-100 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-50 border border-agri-200 text-agri-800 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-harvest-500" />
          {t('voiceModalTitle')}
        </div>

        <h3 className="text-xl font-bold text-gray-900">
          {language === 'mr' 
            ? 'बोला, मी ऐकत आहे...' 
            : (language === 'hi' 
                ? 'बोलिए, मैं सुन रहा हूँ...' 
                : (language === 'ml' ? 'സംസാരിക്കൂ, ഞാൻ കേൾക്കുന്നു...' : 'Speak, I am listening...'))}
        </h3>

        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
          {t('voiceInstructions')}
        </p>

        {/* Central Mic Button with Pulsing Wave */}
        <div className="my-8 flex items-center justify-center">
          <div className="relative">
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-agri-500/20 animate-ping"></span>
                <span className="absolute -inset-4 rounded-full bg-agri-400/10 animate-pulse"></span>
              </>
            )}
            <button
              onClick={startVoiceInput}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 ${
                isListening
                  ? 'bg-red-500 shadow-red-500/40 animate-pulse'
                  : 'bg-gradient-to-tr from-agri-700 to-agri-600 hover:from-agri-800 hover:to-agri-700 shadow-agri-700/30'
              }`}
            >
              {isListening ? (
                <Mic className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8 text-harvest-200" />
              )}
            </button>
          </div>
        </div>

        {/* Status indicator */}
        <span className="text-xs font-bold text-gray-600 block">
          {isListening ? t('listening') : t('startSpeaking')}
        </span>

        {/* Spoken Transcript Bubble */}
        {transcript && (
          <div className="mt-4 p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 font-semibold">
            🗣️ "{transcript}"
          </div>
        )}

        {/* Assistant Response Bubble */}
        {assistantReply && (
          <div className="mt-3 p-3.5 rounded-2xl bg-agri-50 border border-agri-200 text-xs text-agri-900 font-bold flex items-center gap-2 text-left">
            <Volume2 className="w-4 h-4 text-agri-700 shrink-0" />
            <span>{assistantReply}</span>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap justify-center gap-2 text-[11px]">
          <button
            onClick={() => handleVoiceCommand(language === 'mr' ? 'रोग तपासा' : (language === 'ml' ? 'രോഗം പരിശോധിക്കുക' : 'Check disease'))}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all"
          >
            {language === 'mr' ? '"रोग तपासा"' : (language === 'ml' ? '"രോഗം പരിശോധിക്കുക"' : '"Check disease"')}
          </button>
          <button
            onClick={() => handleVoiceCommand(language === 'mr' ? 'हवामान अंदाज' : (language === 'ml' ? 'കാലാവസ്ഥ' : 'Weather risk'))}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all"
          >
            {language === 'mr' ? '"हवामान अंदाज"' : (language === 'ml' ? '"കാലാവസ്ഥ"' : '"Weather risk"')}
          </button>
          <button
            onClick={() => handleVoiceCommand(language === 'mr' ? 'खरेदी केंद्र' : (language === 'ml' ? 'സംഭരണ കേന്ദ്രം' : 'Procurement center'))}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all"
          >
            {language === 'mr' ? '"खरेदी केंद्र"' : (language === 'ml' ? '"സംഭരണ കേന്ദ്രം"' : '"Procurement center"')}
          </button>
        </div>

      </div>
    </div>
  );
}

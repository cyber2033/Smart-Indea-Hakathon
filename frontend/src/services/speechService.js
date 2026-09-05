/**
 * Web Speech API Service
 * Supports SpeechRecognition (STT) and SpeechSynthesis (TTS)
 * for Marathi (mr-IN), Hindi (hi-IN), and English (en-IN).
 */

const LANG_CODES = {
  mr: 'mr-IN',
  hi: 'hi-IN',
  ml: 'ml-IN',
  en: 'en-IN'
};

export const speechService = {
  isSTTSupported: () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  isTTSSupported: () => {
    return 'speechSynthesis' in window;
  },

  startListening: ({ lang = 'mr', onResult, onError, onEnd }) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANG_CODES[lang] || 'mr-IN';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      recognition.start();
      return recognition;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      if (onError) onError(e.message);
      return null;
    }
  },

  speakText: (text, lang = 'mr', onEnd) => {
    if (!window.speechSynthesis) return;

    // Cancel ongoing speech
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = LANG_CODES[lang] || 'mr-IN';
    utterance.rate = 0.95; // Slightly measured for easy farmer comprehension
    utterance.pitch = 1.0;

    // Pick best available voice matching locale
    const voices = window.speechSynthesis.getVoices();
    const targetCode = LANG_CODES[lang];
    const matchingVoice = voices.find(v => v.lang.includes(targetCode) || v.lang.startsWith(lang));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking: () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
};

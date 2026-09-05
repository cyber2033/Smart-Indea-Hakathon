import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, Wifi, WifiOff, Mic, CloudSun, Calendar, History, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isOffline, setIsOffline, onOpenVoiceModal }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('scan')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-agri-600 to-agri-800 flex items-center justify-center text-white shadow-md shadow-agri-700/20">
              <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-agri-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-agri-900">
                  {t('appTitle')}
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-harvest-100 text-harvest-700 border border-harvest-400/30">
                  {t('sihTag')}
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block font-medium">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-gray-100/80 p-1.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'scan'
                  ? 'bg-white text-agri-800 shadow-sm'
                  : 'text-gray-600 hover:text-agri-700'
              }`}
            >
              <Leaf className="w-4 h-4" />
              <span>{t('navScan')}</span>
            </button>

            <button
              onClick={() => setActiveTab('weather')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'weather'
                  ? 'bg-white text-agri-800 shadow-sm'
                  : 'text-gray-600 hover:text-agri-700'
              }`}
            >
              <CloudSun className="w-4 h-4 text-harvest-500" />
              <span>{t('navWeather')}</span>
            </button>

            <button
              onClick={() => setActiveTab('procurement')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'procurement'
                  ? 'bg-white text-agri-800 shadow-sm'
                  : 'text-gray-600 hover:text-agri-700'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{t('navProcurement')}</span>
              <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                Differentiator
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-agri-800 shadow-sm'
                  : 'text-gray-600 hover:text-agri-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span>{t('navHistory')}</span>
            </button>
          </nav>

          {/* Right Controls: Offline Simulation, Voice Assistant, Language Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Offline Simulation Toggle Badge (Killer for Judges Demo) */}
            <button
              onClick={() => setIsOffline(!isOffline)}
              title={isOffline ? "Switch to Online Mode" : "Simulate Offline Mode (WiFi OFF)"}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                isOffline
                  ? 'bg-amber-500/10 text-amber-700 border-amber-400 animate-pulse'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">{t('offline')}</span>
                  <span className="sm:hidden">Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">{t('online')}</span>
                </>
              )}
            </button>

            {/* Voice Assistant Trigger */}
            <button
              onClick={onOpenVoiceModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-agri-700 to-agri-800 text-white hover:from-agri-800 hover:to-agri-900 shadow-sm transition-all active:scale-95"
              title="Speak with Voice Assistant"
            >
              <Mic className="w-4 h-4 text-harvest-400 animate-bounce" />
              <span className="text-xs font-semibold hidden md:inline">{t('voiceAssistant')}</span>
            </button>

            {/* Language Selector: Marathi / Hindi / English */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-800 text-xs sm:text-sm font-semibold rounded-lg focus:ring-agri-500 focus:border-agri-500 block py-1.5 px-2.5 cursor-pointer shadow-sm"
              >
                <option value="mr">मराठी</option>
                <option value="hi">हिंदी</option>
                <option value="ml">മലയാളം</option>
                <option value="en">English</option>
              </select>
            </div>

          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-gray-100 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${
              activeTab === 'scan' ? 'bg-agri-700 text-white font-bold' : 'text-gray-600'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>{t('navScan')}</span>
          </button>

          <button
            onClick={() => setActiveTab('weather')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${
              activeTab === 'weather' ? 'bg-agri-700 text-white font-bold' : 'text-gray-600'
            }`}
          >
            <CloudSun className="w-3.5 h-3.5" />
            <span>{t('navWeather')}</span>
          </button>

          <button
            onClick={() => setActiveTab('procurement')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${
              activeTab === 'procurement' ? 'bg-blue-700 text-white font-bold' : 'text-gray-600'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('navProcurement')}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${
              activeTab === 'history' ? 'bg-agri-700 text-white font-bold' : 'text-gray-600'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t('navHistory')}</span>
          </button>
        </div>

      </div>
    </header>
  );
}

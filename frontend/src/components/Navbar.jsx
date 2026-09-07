import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, Wifi, WifiOff, Mic, CloudSun, Calendar, History, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isOffline, setIsOffline, onOpenVoiceModal }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-2.5 cursor-pointer flex-shrink-0" onClick={() => setActiveTab('scan')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agri-700 to-agri-900 flex items-center justify-center text-white shadow-md shadow-agri-900/15 flex-shrink-0">
              <Leaf className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-gray-900 whitespace-nowrap">
                  {t('appTitle')}
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300/60">
                  {t('sihTag')}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden xl:block font-medium truncate max-w-[200px]">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Clean segmented control) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-gray-100/90 p-1 rounded-xl border border-gray-200/80 flex-shrink-0">
            
            {/* Scan Tab */}
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'scan'
                  ? 'bg-white text-agri-900 shadow-sm'
                  : 'text-gray-600 hover:text-agri-800'
              }`}
            >
              <Leaf className="w-4 h-4 text-agri-700" />
              <span>{t('navScan')}</span>
            </button>

            {/* Weather Tab */}
            <button
              onClick={() => setActiveTab('weather')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'weather'
                  ? 'bg-white text-agri-900 shadow-sm'
                  : 'text-gray-600 hover:text-agri-800'
              }`}
            >
              <CloudSun className="w-4 h-4 text-amber-500" />
              <span>{t('navWeather')}</span>
              <span className="text-[9px] uppercase font-black bg-amber-100 text-amber-900 px-1 py-0.2 rounded border border-amber-300/60">
                {t('tagProactiveAI')}
              </span>
            </button>

            {/* Procurement Tab */}
            <button
              onClick={() => setActiveTab('procurement')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'procurement'
                  ? 'bg-white text-agri-900 shadow-sm'
                  : 'text-gray-600 hover:text-agri-800'
              }`}
            >
              <Calendar className="w-4 h-4 text-agri-700" />
              <span>{t('navProcurement')}</span>
              <span className="text-[9px] uppercase font-black bg-amber-100 text-amber-900 px-1 py-0.2 rounded border border-amber-300/60">
                {t('tagMspTracker')}
              </span>
            </button>

            {/* History Tab */}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-agri-900 shadow-sm'
                  : 'text-gray-600 hover:text-agri-800'
              }`}
            >
              <History className="w-4 h-4 text-gray-500" />
              <span>{t('navHistory')}</span>
            </button>
          </nav>

          {/* Right Controls: Offline / Online Toggle, Voice Assistant, Language Dropdown */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            
            {/* Offline Simulation Toggle Button */}
            <button
              onClick={() => setIsOffline(!isOffline)}
              title={isOffline ? "Offline Edge AI Active - Scans work 100% locally" : "Simulate Offline Mode (WiFi OFF)"}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isOffline
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/20 animate-pulse'
                  : 'bg-emerald-50/80 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-white" />
                  <span className="whitespace-nowrap">{t('offlineStatusActive')}</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline whitespace-nowrap">{t('online')}</span>
                  <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-900 px-1 py-0.2 rounded border border-amber-300/60 hidden md:inline">
                    {t('tagOfflineCapable')}
                  </span>
                </>
              )}
            </button>

            {/* Voice Assistant Trigger */}
            <button
              onClick={onOpenVoiceModal}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-agri-700 to-agri-800 text-white hover:from-agri-800 hover:to-agri-900 shadow-sm transition-all active:scale-95 flex-shrink-0"
              title="Voice Assistant"
            >
              <Mic className="w-4 h-4 text-amber-300 animate-bounce" />
              <span className="text-xs font-bold hidden sm:inline">{t('voiceAssistant')}</span>
            </button>

            {/* Language Selector: Hindi (Main) / Marathi / English */}
            <div className="relative flex-shrink-0">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm font-bold rounded-xl focus:ring-amber-500 focus:border-amber-500 block py-1.5 px-2 cursor-pointer shadow-sm"
              >
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
                <option value="en">English</option>
                <option value="ml">മലയാളം</option>
              </select>
            </div>

          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-gray-100 overflow-x-auto text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
              activeTab === 'scan' ? 'bg-agri-700 text-white font-bold' : 'text-gray-600'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>{t('navScan')}</span>
          </button>

          <button
            onClick={() => setActiveTab('weather')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
              activeTab === 'weather' ? 'bg-agri-700 text-white font-bold' : 'text-gray-600'
            }`}
          >
            <CloudSun className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('navWeather')}</span>
          </button>

          <button
            onClick={() => setActiveTab('procurement')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
              activeTab === 'procurement' ? 'bg-agri-700 text-white font-bold' : 'text-gray-600'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('navProcurement')}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
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

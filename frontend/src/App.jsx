import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import ScanCamera from './components/ScanCamera';
import ScanResult from './components/ScanResult';
import WeatherAlerts from './components/WeatherAlerts';
import ProcurementModule from './components/ProcurementModule';
import ScanHistory from './components/ScanHistory';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import { apiService } from './services/api';
import { WifiOff, Sparkles, Heart } from 'lucide-react';

function MainApp() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('scan');
  const [isOffline, setIsOffline] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Scan handler
  const handleScanComplete = async (formData, sampleKey) => {
    const response = await apiService.analyzeScan(formData, isOffline, sampleKey);
    if (response.success && response.data) {
      setScanResult(response.data);
    }
  };

  const handleResetScan = () => {
    setScanResult(null);
  };

  const handleActionFromVoice = (action) => {
    setActiveTab(action);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex flex-col justify-between">
      
      {/* Offline Alert Banner if offline simulated */}
      {isOffline && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-4 h-4 animate-bounce" />
          <span>{t('offlineNotice')}</span>
        </div>
      )}

      {/* Header & Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-grow w-full">
        
        {/* TAB 1: Scan & Diagnosis */}
        {activeTab === 'scan' && (
          <div className="max-w-4xl mx-auto">
            {!scanResult ? (
              <ScanCamera
                onScanComplete={handleScanComplete}
                isOffline={isOffline}
              />
            ) : (
              <ScanResult
                result={scanResult}
                onReset={handleResetScan}
                onNavigateToProcurement={() => setActiveTab('procurement')}
              />
            )}
          </div>
        )}

        {/* TAB 2: Weather & Prevention */}
        {activeTab === 'weather' && (
          <div className="max-w-5xl mx-auto">
            <WeatherAlerts />
          </div>
        )}

        {/* TAB 3: Procurement & Mandi Wait Time (Differentiator) */}
        {activeTab === 'procurement' && (
          <div className="max-w-5xl mx-auto">
            <ProcurementModule />
          </div>
        )}

        {/* TAB 4: Scan History */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto">
            <ScanHistory
              onSelectHistoricalScan={(item) => {
                setScanResult(item);
                setActiveTab('scan');
              }}
            />
          </div>
        )}

      </main>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onActionTrigger={handleActionFromVoice}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1 font-semibold text-gray-700">
            <span>🌾 {t('appTitle')}</span>
            <span>•</span>
            <span className="text-agri-700">{t('sihTag')}</span>
          </div>
          <div>
            Built with ❤️ for Indian Farmers • Govt of Maharashtra (SIH26131 + SIH26032)
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}

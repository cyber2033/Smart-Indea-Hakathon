import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import { speechService } from '../services/speechService';
import { CloudSun, Droplets, Thermometer, Wind, AlertCircle, ShieldAlert, Volume2, Calendar, MapPin, RefreshCw } from 'lucide-react';

export default function WeatherAlerts() {
  const { language, t } = useLanguage();
  const [district, setDistrict] = useState('nashik');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fetchWeather = async (targetDistrict) => {
    setLoading(true);
    try {
      const data = await apiService.getWeatherAndRisk(targetDistrict);
      setWeatherData(data);
    } catch (err) {
      console.error('Weather load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(district);
  }, [district]);

  const handleReadAdvisory = () => {
    if (!weatherData || !weatherData.diseaseAlerts?.length) return;
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const firstAlert = weatherData.diseaseAlerts[0];
    const text = firstAlert.advisory[language] || firstAlert.advisory.en;
    setIsSpeaking(true);
    speechService.speakText(text, language, () => setIsSpeaking(false));
  };

  return (
    <div className="space-y-6">
      
      {/* Title & District Selector */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-2">
              Layer 2: Prevention, Not Just Detection
            </span>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CloudSun className="w-6 h-6 text-harvest-500" />
              {t('weatherAlertTitle')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('weatherSub')}
            </p>
          </div>

          {/* District Dropdown */}
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-agri-700" />
            <span className="text-xs font-bold text-gray-700">{t('selectDistrict')}</span>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="text-xs sm:text-sm font-semibold border border-gray-300 rounded-xl py-2 px-3 bg-gray-50 text-gray-800 focus:ring-agri-500 shadow-sm"
            >
              <option value="nashik">Nashik (नाशिक - Grape/Tomato)</option>
              <option value="pune">Pune (पुणे - Veg/Soybean)</option>
              <option value="amravati">Amravati (अमरावती - Cotton/Soybean)</option>
              <option value="jalgaon">Jalgaon (जळगाव - Banana/Cotton)</option>
              <option value="kolhapur">Kolhapur (कोल्हापूर - Sugarcane)</option>
              <option value="nagpur">Nagpur (नागपूर - Orange/Cotton)</option>
            </select>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-agri-600" />
            <p className="text-sm font-semibold">हवामान व शेती धोक्याचे मोजमाप सुरू आहे...</p>
          </div>
        )}

        {/* Weather Metrics Dashboard */}
        {!loading && weatherData && (
          <div className="mt-6">
            
            {/* Real-time Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
                <div className="flex items-center justify-between text-orange-700 mb-1">
                  <span className="text-xs font-bold uppercase">{t('temp')}</span>
                  <Thermometer className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900">
                  {weatherData.weather?.temperature}°C
                </div>
                <span className="text-[11px] text-gray-500">
                  वातावरण: {weatherData.weather?.description}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200">
                <div className="flex items-center justify-between text-blue-700 mb-1">
                  <span className="text-xs font-bold uppercase">{t('humidity')}</span>
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900">
                  {weatherData.weather?.humidity}%
                </div>
                <span className={`text-[11px] font-bold ${weatherData.weather?.humidity > 80 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {weatherData.weather?.humidity > 80 ? '⚠️ उच्च बुरशी धोका' : 'सामान्य स्थिती'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
                <div className="flex items-center justify-between text-indigo-700 mb-1">
                  <span className="text-xs font-bold uppercase">{t('rainfall')}</span>
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900">
                  {weatherData.weather?.rainfall || 0} mm
                </div>
                <span className="text-[11px] text-gray-500">
                  precipitation telemetry
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                <div className="flex items-center justify-between text-emerald-700 mb-1">
                  <span className="text-xs font-bold uppercase">Telemetry Source</span>
                  <Wind className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-gray-800 line-clamp-1">
                  {weatherData.weather?.source}
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Live Agricultural Rule Engine
                </span>
              </div>

            </div>

            {/* Active Proactive Outbreak Alerts */}
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-bold uppercase text-gray-700 tracking-wider">
                सक्रिय रोग पूर्वसूचना व फवारणी सल्ला (Active Outbreak Advisories):
              </h3>

              {(weatherData.diseaseAlerts || []).map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    alert.riskLevel === 'CRITICAL'
                      ? 'bg-red-50/80 border-red-200'
                      : (alert.riskLevel === 'HIGH' ? 'bg-orange-50/80 border-orange-200' : 'bg-emerald-50/80 border-emerald-200')
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ShieldAlert className={`w-6 h-6 shrink-0 mt-0.5 ${
                      alert.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-base">
                          {alert.name}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          alert.riskLevel === 'CRITICAL' ? 'bg-red-200 text-red-900' : 'bg-orange-200 text-orange-900'
                        }`}>
                          {alert.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-800 mt-1 font-medium">
                        {alert.advisory[language] || alert.advisory.en}
                      </p>
                      <div className="mt-2 text-[11px] text-gray-600">
                        <span className="font-bold">संवेदनशील पिके: </span>
                        {alert.crops.join(', ')}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleReadAdvisory}
                    className="self-start md:self-center px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 shrink-0 transition-all"
                  >
                    <Volume2 className="w-4 h-4 text-agri-700" />
                    <span>{isSpeaking ? t('speaking') : t('listenAudio')}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* 5-Day Outbreak Vulnerability Forecast Table */}
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase text-gray-700 tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-agri-700" />
                {t('forecast5Days')}
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">दिवस (Day)</th>
                      <th className="p-3.5">तापमान (Max / Min)</th>
                      <th className="p-3.5">आर्द्रता (Humidity)</th>
                      <th className="p-3.5">पावसाची शक्यता</th>
                      <th className="p-3.5">रोग जोखीम (Epidemic Risk)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {(weatherData.forecast || []).map((day, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-gray-900">{day.day}</td>
                        <td className="p-3.5 text-gray-700">{day.tempMax}°C / {day.tempMin}°C</td>
                        <td className="p-3.5 text-gray-700 font-semibold">{day.humidity}%</td>
                        <td className="p-3.5 text-blue-600 font-semibold">{day.rainProb}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            day.risk.includes('High') ? 'bg-red-100 text-red-800' : (day.risk === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                          }`}>
                            {day.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import confetti from 'canvas-confetti';
import { Calendar, Clock, Truck, CheckCircle2, QrCode, Printer, MapPin, Search, ChevronRight, X, RefreshCw, Navigation, TrendingUp, Phone, Store, AlertCircle } from 'lucide-react';

const DISTRICT_OPTIONS = [
  { value: 'all', label: 'सर्व जिल्हे / सर्व मंडई (All Mandis)', state: 'All' },
  { value: 'nashik', label: 'Nashik / Lasalgaon (नाशिक / लासलगाव)', state: 'Maharashtra' },
  { value: 'pune', label: 'Pune (पुणे मार्केट यार्ड)', state: 'Maharashtra' },
  { value: 'nagpur', label: 'Nagpur (नागपूर कळमना मंडी)', state: 'Maharashtra' },
  { value: 'jalgaon', label: 'Jalgaon (जळगाव कापूस व केळी मंडी)', state: 'Maharashtra' },
  { value: 'amravati', label: 'Amravati (अमरावती कापूस केंद्र)', state: 'Maharashtra' },
  { value: 'kolhapur', label: 'Kolhapur (कोल्हापूर गुळ व धान्य)', state: 'Maharashtra' },
  { value: 'sambhajinagar', label: 'Chh. Sambhajinagar (संभाजीनगर)', state: 'Maharashtra' },
  { value: 'solapur', label: 'Solapur (सोलापूर कांदा व डाळिंब मंडी)', state: 'Maharashtra' },
  { value: 'indore', label: 'Indore (इंदूर चोईथराम मंडी)', state: 'Madhya Pradesh' },
  { value: 'jaipur', label: 'Jaipur (जयपूर मुहाना मंडी)', state: 'Rajasthan' },
  { value: 'lucknow', label: 'Lucknow (लखनौ दुबग्गा मंडी)', state: 'Uttar Pradesh' },
  { value: 'delhi', label: 'Delhi (आझादपूर मंडी - Asia Market)', state: 'Delhi NCR' }
];

export default function ProcurementModule() {
  const { t, language } = useLanguage();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmedToken, setConfirmedToken] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Form State
  const [formData, setFormData] = useState({
    farmerName: 'Ramrao Patil',
    phone: '9876543210',
    commodity: 'Soybean',
    quantityQuintals: '25',
    vehicleNumber: 'MH-15-AB-4321',
    requestedDate: 'उद्या (Tomorrow)',
    requestedSlot: '10:30 AM - 12:00 PM'
  });

  const loadCenters = async (district = selectedDistrict) => {
    setLoading(true);
    try {
      const res = await apiService.getProcurementCenters(district === 'all' ? '' : district);
      if (res && res.data) {
        setCenters(res.data);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to load APMC centers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCenters(selectedDistrict);
  }, [selectedDistrict]);

  const handleDistrictChange = (e) => {
    setIsGpsActive(false);
    setSelectedDistrict(e.target.value);
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsActive(true);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Auto-select nearest district based on coordinates (sample heuristic)
        if (latitude > 25) setSelectedDistrict('delhi');
        else if (latitude > 23) setSelectedDistrict('indore');
        else if (longitude > 78) setSelectedDistrict('nagpur');
        else if (latitude < 17) setSelectedDistrict('kolhapur');
        else setSelectedDistrict('nashik');
        setLoading(false);
      },
      (err) => {
        console.warn('GPS failed, defaulting to Maharashtra hubs:', err);
        setSelectedDistrict('nashik');
        setLoading(false);
      },
      { timeout: 5000 }
    );
  };

  const openBookingModal = (center) => {
    setSelectedCenter(center);
    const firstComm = center.activeCommodities?.[0]?.name || 'Soybean';
    setFormData((prev) => ({ ...prev, commodity: firstComm }));
    setIsModalOpen(true);
    setConfirmedToken(null);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCenter) return;

    try {
      const res = await apiService.bookProcurementSlot({
        ...formData,
        centerId: selectedCenter.id,
        centerName: selectedCenter.name
      });

      if (res.success && res.data) {
        setConfirmedToken(res.data);
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      alert('Error booking slot: ' + err.message);
    }
  };

  // Filter centers by search query if farmer searches
  const filteredCenters = centers.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || 
           c.location.toLowerCase().includes(q) || 
           (c.activeCommodities || []).some(comm => comm.name.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      
      {/* Banner Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
        
        {/* Title and Subtitle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                ⭐ SIH26032 Differentiator: Sowing to Selling Journey
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 animate-pulse">
                🔴 Live e-NAM & APMC Sync
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2.5">
              <Store className="w-7 h-7 text-agri-600" />
              {t('procurementTitle')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('procurementSub')}
            </p>
          </div>

          {/* Quick Refresh & Last Sync Badge */}
          <div className="flex items-center gap-3 self-start lg:self-center">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">ताजी स्थिती अपडेट (Live Status)</span>
              <span className="text-xs font-bold text-gray-700">आजचे {lastUpdated}</span>
            </div>
            <button
              onClick={() => loadCenters(selectedDistrict)}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 border border-gray-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-agri-700 ${loading ? 'animate-spin' : ''}`} />
              <span>ताजे भाव रीफ्रेश करा (Refresh)</span>
            </button>
          </div>
        </div>

        {/* Location & District Filter Bar */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-agri-50/70 via-emerald-50/50 to-blue-50/60 border border-agri-200">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
            
            {/* District Dropdown */}
            <div className="flex-1">
              <label className="text-xs font-bold text-agri-900 block mb-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-agri-700" />
                आपला जिल्हा / मंडई निवडा (Select Mandi Location):
              </label>
              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  className="w-full pl-3 pr-8 py-2.5 bg-white border-2 border-agri-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-agri-500 focus:border-agri-500 shadow-sm"
                >
                  {DISTRICT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* GPS Auto-Detect Button */}
            <div className="md:w-auto self-end">
              <button
                onClick={handleDetectGps}
                disabled={loading}
                className={`w-full md:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border shadow-sm transition-all active:scale-95 ${
                  isGpsActive 
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/30' 
                    : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}
              >
                <Navigation className={`w-4 h-4 ${isGpsActive ? 'text-white animate-pulse' : 'text-emerald-600'}`} />
                <span>{isGpsActive ? '📍 GPS लोकेशन सक्रिय' : '📍 माझे जवळचे केंद्र (Auto GPS)'}</span>
              </button>
            </div>

            {/* Keyword Search */}
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-700 block mb-1">
                मंडई किंवा पिकाचे नाव शोधा (Search Crop / APMC):
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="उदा. कांदा, सोयाबीन, Tomato, Nashik..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:ring-2 focus:ring-agri-500 shadow-sm"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
              </div>
            </div>

          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-600">
            <span>✨ निवडलेल्या क्षेत्रातील सर्व शासकीय हमीभाव (MSP) व आजचे ताजे बाजार लिलाव भाव थेट दर्शविले आहेत.</span>
            <span className="font-bold text-agri-800">{filteredCenters.length} मंडई उपलब्ध</span>
          </div>
        </div>

        {/* APMC Centers Grid */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase text-gray-800 tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              {t('activeAPMC')} (सक्रिय कृषी उत्पन्न बाजार समित्या):
            </h3>
            <span className="text-xs text-gray-500 font-medium">आजचे थेट वाहन व प्रतीक्षा वेळ ट्रॅकर</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500">
              <RefreshCw className="w-8 h-8 text-agri-600 animate-spin mx-auto mb-2" />
              <p className="font-bold text-sm">स्थानिक मंडई व थेट बाजारभाव लोड होत आहेत...</p>
            </div>
          ) : filteredCenters.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="font-bold text-gray-800 text-sm">या फिल्टरसाठी मंडई उपलब्ध नाही.</p>
              <p className="text-xs text-gray-500 mt-1">कृपया जिल्हा बदला किंवा 'सर्व जिल्हे' निवडा.</p>
              <button
                onClick={() => { setSelectedDistrict('all'); setSearchQuery(''); }}
                className="mt-3 px-4 py-1.5 bg-agri-700 text-white rounded-lg text-xs font-bold"
              >
                सर्व मंडई पहा
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredCenters.map((center) => (
                <div
                  key={center.id}
                  className="p-5 rounded-3xl border border-gray-200 bg-white hover:border-agri-400 hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Subtle top indicator bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-agri-500 via-emerald-400 to-amber-500"></div>

                  <div>
                    {/* Center Header */}
                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 mb-1 border border-gray-200">
                          📍 {center.districtLabel || center.district}
                        </span>
                        <h4 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-agri-900 transition-colors">
                          {center.name}
                        </h4>
                      </div>

                      {/* Wait Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase shrink-0 border shadow-xs ${
                        center.queueStatus?.statusBadge === 'LOW_WAIT'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : (center.queueStatus?.statusBadge === 'MODERATE_WAIT' 
                              ? 'bg-amber-50 text-amber-800 border-amber-300' 
                              : 'bg-red-50 text-red-800 border-red-300')
                      }`}>
                        ⏱️ {center.queueStatus?.estimatedWaitMinutes || 25} मिनिटे प्रतीक्षा
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-agri-600 shrink-0" />
                      <span>{center.location}</span>
                    </p>

                    {/* Live Queue Telemetry Metrics */}
                    <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-2xl bg-gradient-to-br from-gray-50 to-emerald-50/40 border border-gray-200 text-xs">
                      
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-blue-100 text-blue-800 shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">{t('vehiclesInQueue')}</span>
                          <span className="font-black text-gray-900 text-sm">
                            {center.queueStatus?.vehiclesInQueue || 12} वाहने
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-x border-gray-200 px-2">
                        <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">{t('estimatedWait')}</span>
                          <span className="font-black text-gray-900 text-sm">
                            ~{center.queueStatus?.estimatedWaitMinutes || 35} mins
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-1">
                        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">आजची आवक/क्षमता</span>
                          <span className="font-bold text-gray-800 text-xs">
                            {center.queueStatus?.todayProcessed || 65}/{center.queueStatus?.capacityPerDay || 120} वाहने
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Live Today's Rates & Govt MSP */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          आजचे ताजे लिलाव व शासकीय हमीभाव (Today's Live Modal & MSP Rates):
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          आजचे थेट दर
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {(center.activeCommodities || []).map((comm, cIdx) => (
                          <div 
                            key={cIdx} 
                            className="p-2 rounded-xl bg-gray-50 hover:bg-agri-50/50 border border-gray-200 flex items-center justify-between gap-2 text-xs transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-800 text-xs sm:text-sm">
                                {comm.name}
                              </span>
                              {comm.openTime && (
                                <span className="text-[10px] text-gray-400 hidden sm:inline">
                                  ({comm.openTime})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                <span className="text-xs sm:text-sm font-black text-agri-800 block">
                                  {comm.dailyPrice || comm.mspRate}
                                </span>
                                <span className="text-[9px] text-gray-500 block">
                                  {comm.mspRate?.includes('MSP') ? 'शासकीय हमीभाव (Govt MSP)' : 'बाजार लिलाव भाव'}
                                </span>
                              </div>
                              {comm.trend && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  comm.trend.includes('↑') ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {comm.trend}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact & Hours Info */}
                    {center.contact && (
                      <p className="text-[11px] text-gray-500 mt-3 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>हेल्पलाइन / माहिती: <strong className="text-gray-700">{center.contact}</strong></span>
                      </p>
                    )}

                  </div>

                  {/* Booking Button */}
                  <button
                    onClick={() => openBookingModal(center)}
                    className="mt-5 w-full py-3 px-4 rounded-2xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-agri-700/20 active:scale-98 transition-all group-hover:bg-agri-800"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>शेतमाल नोंदणी व डिजिटल टोकन मिळवा ({t('bookSlotBtn')})</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {confirmedToken ? t('bookingSuccess') : t('bookingModalTitle')}
                </h3>
                <p className="text-xs text-agri-700 font-semibold">
                  {selectedCenter?.name}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Token Confirmed */}
            {confirmedToken ? (
              <div className="mt-6 space-y-5 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-bold uppercase">{t('tokenNumber')}</span>
                  <div className="text-3xl font-black text-gray-900 tracking-wider text-agri-800 mt-1">
                    {confirmedToken.tokenNumber}
                  </div>
                  <p className="text-xs text-emerald-700 font-bold mt-1">
                    ✓ शेतमाल खरेदी स्लॉट व वेळ निश्चित झाली!
                  </p>
                </div>

                {/* Simulated QR Code Pass */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">शेतकऱ्याचे नाव:</span>
                    <span className="font-bold text-gray-800">{confirmedToken.farmerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">शेतमाल / वजन:</span>
                    <span className="font-bold text-gray-800">{confirmedToken.commodity} ({confirmedToken.quantityQuintals} क्विंटल)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">खरेदी केंद्र:</span>
                    <span className="font-bold text-agri-900">{confirmedToken.centerName || selectedCenter?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">तारीख व वेळ:</span>
                    <span className="font-bold text-blue-700">{confirmedToken.slotDate} ({confirmedToken.slotTime})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">वाहन क्रमांक:</span>
                    <span className="font-bold text-gray-800">{confirmedToken.vehicleNumber}</span>
                  </div>
                  {confirmedToken.reportingGate && (
                    <div className="flex justify-between border-t pt-1 border-gray-200">
                      <span className="text-gray-500">प्रवेश द्वार:</span>
                      <span className="font-bold text-emerald-700">{confirmedToken.reportingGate}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl text-xs flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    {t('printToken')}
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-xl text-xs"
                  >
                    पूर्ण झाले (Done)
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleBookingSubmit} className="mt-5 space-y-4 text-left">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">{t('farmerName')}</label>
                  <input
                    type="text"
                    required
                    value={formData.farmerName}
                    onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                    className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-agri-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">{t('phone')}</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-agri-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">{t('commodity')}</label>
                    <select
                      value={formData.commodity}
                      onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                      className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-agri-500"
                    >
                      {selectedCenter?.activeCommodities?.map((c, i) => (
                        <option key={i} value={c.name}>
                          {c.name} ({c.dailyPrice || c.mspRate})
                        </option>
                      )) || (
                        <>
                          <option value="Soybean">Soybean (सोयाबीन)</option>
                          <option value="Cotton">Cotton (कापूस)</option>
                          <option value="Tomato">Tomato (टोमॅटो)</option>
                          <option value="Onion">Onion (कांदा)</option>
                          <option value="Paddy">Paddy / Rice (धान)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">{t('quantity')}</label>
                    <input
                      type="number"
                      required
                      value={formData.quantityQuintals}
                      onChange={(e) => setFormData({ ...formData, quantityQuintals: e.target.value })}
                      className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-agri-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">{t('vehicleNo')}</label>
                    <input
                      type="text"
                      required
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-agri-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">{t('slotDate')}</label>
                    <input
                      type="text"
                      value={formData.requestedDate}
                      onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                      className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-agri-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">{t('slotTime')}</label>
                    <input
                      type="text"
                      value={formData.requestedSlot}
                      onChange={(e) => setFormData({ ...formData, requestedSlot: e.target.value })}
                      className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-agri-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-4 w-full py-3.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-md shadow-agri-700/20 active:scale-98 transition-all"
                >
                  {t('confirmBooking')}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

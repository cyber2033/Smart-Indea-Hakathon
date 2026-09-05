import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import confetti from 'canvas-confetti';
import { Calendar, Clock, Truck, CheckCircle2, QrCode, Printer, MapPin, Search, ChevronRight, X } from 'lucide-react';

export default function ProcurementModule() {
  const { t } = useLanguage();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmedToken, setConfirmedToken] = useState(null);

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

  const loadCenters = async () => {
    setLoading(true);
    try {
      const res = await apiService.getProcurementCenters();
      if (res.success && res.data) {
        setCenters(res.data);
      }
    } catch (err) {
      console.error('Failed to load APMC centers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCenters();
  }, []);

  const openBookingModal = (center) => {
    setSelectedCenter(center);
    setIsModalOpen(true);
    setConfirmedToken(null);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCenter) return;

    try {
      const res = await apiService.bookProcurementSlot({
        ...formData,
        centerId: selectedCenter.id
      });

      if (res.success && res.data) {
        setConfirmedToken(res.data);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      alert('Error booking slot: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-2">
              SIH26032 Bonus Differentiator: Sowing to Selling Journey
            </span>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              {t('procurementTitle')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('procurementSub')}
            </p>
          </div>
        </div>

        {/* APMC Centers Grid */}
        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase text-gray-700 tracking-wider mb-4">
            {t('activeAPMC')} (महाराष्ट्र शासन मान्यताप्राप्त हमीभाव केंद्रे):
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {centers.map((center) => (
              <div
                key={center.id}
                className="p-5 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-gray-900 text-base">
                      {center.name}
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase shrink-0 ${
                      center.queueStatus?.statusBadge === 'LOW_WAIT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : (center.queueStatus?.statusBadge === 'MODERATE_WAIT' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')
                    }`}>
                      {center.queueStatus?.estimatedWaitMinutes} मिनिटे प्रतीक्षा
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {center.location}
                  </p>

                  {/* Queue Metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-white border border-gray-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="text-gray-500 block text-[10px]">{t('vehiclesInQueue')}</span>
                        <span className="font-bold text-gray-900 text-sm">
                          {center.queueStatus?.vehiclesInQueue || 8} वाहने
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-harvest-600" />
                      <div>
                        <span className="text-gray-500 block text-[10px]">{t('estimatedWait')}</span>
                        <span className="font-bold text-gray-900 text-sm">
                          ~{center.queueStatus?.estimatedWaitMinutes || 30} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active MSP Rates */}
                  <div className="mt-3">
                    <span className="text-[11px] font-bold text-gray-600 block mb-1">
                      सध्याचे शासकीय हमीभाव (Active MSP Rates):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(center.activeCommodities || []).map((comm, cIdx) => (
                        <span key={cIdx} className="text-[11px] font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                          {comm.name}: {comm.mspRate || comm.marketRate}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Booking Button */}
                <button
                  onClick={() => openBookingModal(center)}
                  className="mt-5 w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-blue-700/20 active:scale-98 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t('bookSlotBtn')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
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
                <p className="text-xs text-gray-500">
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
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-bold uppercase">{t('tokenNumber')}</span>
                  <div className="text-3xl font-black text-gray-900 tracking-wider text-agri-800 mt-1">
                    {confirmedToken.tokenNumber}
                  </div>
                  <p className="text-xs text-emerald-700 font-bold mt-1">
                    ✓ शेतमाल खरेदी स्लॉट निश्चित झाला
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
                    <span className="text-gray-500">तारीख व वेळ:</span>
                    <span className="font-bold text-blue-700">{confirmedToken.slotDate} ({confirmedToken.slotTime})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">वाहन क्रमांक:</span>
                    <span className="font-bold text-gray-800">{confirmedToken.vehicleNumber}</span>
                  </div>
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
                      <option value="Soybean">Soybean (सोयाबीन)</option>
                      <option value="Cotton">Cotton (कापूस)</option>
                      <option value="Tomato">Tomato (टोमॅटो)</option>
                      <option value="Onion">Onion (कांदा)</option>
                      <option value="Paddy">Paddy / Rice (धान)</option>
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
                  className="mt-4 w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-700/20 active:scale-98 transition-all"
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

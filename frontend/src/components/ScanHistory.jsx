import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import { History, ShieldCheck, Calendar, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function ScanHistory({ onSelectHistoricalScan }) {
  const { language, t } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiService.getScanHistory();
        if (res.success && res.data) {
          setHistory(res.data);
        }
      } catch (e) {
        console.error('History load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
      <div className="flex items-center justify-between pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6 text-agri-700" />
            {t('navHistory')}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            शेतकऱ्याने तपासलेल्या पिकांची व उपचारांची नोंद
          </p>
        </div>
      </div>

      <div className="mt-6">
        {history.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            अद्याप कोणताही इतिहास उपलब्ध नाही. नवीन पान तपासा!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((item, idx) => {
              const name = language === 'mr' ? item.name_mr : (language === 'hi' ? item.name_hi : item.name_en);
              const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent';
              return (
                <div
                  key={item.id || idx}
                  className="py-4 flex items-center justify-between hover:bg-gray-50/80 px-3 rounded-2xl transition-all cursor-pointer"
                  onClick={() => onSelectHistoricalScan && onSelectHistoricalScan(item)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-agri-50 border border-agri-200 flex items-center justify-center text-agri-700 font-black text-sm">
                      {item.confidence ? `${Math.round(item.confidence)}%` : '✓'}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-900">
                        {name || item.diseaseName || 'Crop Scan'}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-agri-700">{item.crop}</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                      {item.severity || 'Normal'}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-agri-700">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Camera, Upload, RefreshCw, Sparkles, Image as ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ScanCamera({ onScanComplete, isOffline }) {
  const { t } = useLanguage();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedSampleKey, setSelectedSampleKey] = useState(null);
  const [cropHint, setCropHint] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Start real webcam stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedSampleKey(null);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      alert('Camera access unavailable. You can upload an image or choose one of the instant demo leaf samples below.');
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture frame from video
  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(canvas.toDataURL('image/jpeg'));
      setSelectedSampleKey(null);
      stopCamera();
    }, 'image/jpeg', 0.92);
  };

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSelectedSampleKey(null);
      stopCamera();
    }
  };

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSelectedSampleKey(null);
      stopCamera();
    }
  };

  // Trigger quick demo samples
  const pickSample = (key, sampleName, mockImg) => {
    stopCamera();
    setSelectedSampleKey(key);
    setPreviewUrl(mockImg);
    setSelectedFile(new File(['mock'], `${key}.jpg`, { type: 'image/jpeg' }));
  };

  // Execute scan
  const handleDiagnose = async () => {
    if (!previewUrl && !selectedFile) {
      alert('Please take a photo, upload an image, or click one of the quick test samples.');
      return;
    }

    setIsScanning(true);
    const formData = new FormData();
    if (selectedFile) {
      formData.append('image', selectedFile);
    }
    if (cropHint) {
      formData.append('cropHint', cropHint);
    }

    try {
      await onScanComplete(formData, selectedSampleKey);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 transition-all">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-6 h-6 text-agri-700" />
            {t('navScan')}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('appSubtitle')}
          </p>
        </div>

        {/* Crop Selection Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">
            {t('selectCropHint')}:
          </label>
          <select
            value={cropHint}
            onChange={(e) => setCropHint(e.target.value)}
            className="text-xs sm:text-sm font-semibold border border-gray-300 rounded-lg py-1.5 px-3 bg-gray-50 text-gray-800 focus:ring-agri-500"
          >
            <option value="">{t('allCrops')}</option>
            <option value="Tomato">Tomato (टोमॅटो)</option>
            <option value="Potato">Potato (बटाटा)</option>
            <option value="Cotton">Cotton (कापूस)</option>
            <option value="Sugarcane">Sugarcane (ऊस)</option>
            <option value="Soybean">Soybean (सोयाबीन)</option>
            <option value="Chilli">Chilli / Pepper (मिरची)</option>
          </select>
        </div>
      </div>

      {/* Main Scanner Viewport Area */}
      <div className="mt-6">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center min-h-[320px] sm:min-h-[400px] transition-all ${
            dragActive ? 'border-agri-500 bg-agri-50/50' : 'border-gray-300 bg-gray-50/70'
          }`}
        >

          {/* Active Laser Line Animation when scanning */}
          {isScanning && (
            <div className="scanner-laser animate-scan-beam"></div>
          )}

          {/* 1. Live Video Stream Mode */}
          {isCameraActive && (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-black rounded-2xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-[360px] sm:h-[440px] object-cover"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
                <button
                  onClick={captureFrame}
                  className="px-6 py-2.5 bg-agri-600 hover:bg-agri-700 text-white font-bold rounded-full shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  {t('takePhoto')}
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-gray-800/80 hover:bg-gray-900 text-white font-medium rounded-full text-xs"
                >
                  रद्द करा (Cancel)
                </button>
              </div>
            </div>
          )}

          {/* 2. Photo Preview Mode */}
          {!isCameraActive && previewUrl && (
            <div className="relative w-full h-[340px] sm:h-[420px] flex items-center justify-center bg-gray-900 rounded-2xl overflow-hidden group">
              <img
                src={previewUrl}
                alt="Selected Leaf Sample"
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                {selectedSampleKey ? 'Sample Selected' : 'Photo Uploaded'}
              </div>
              <button
                onClick={() => { setPreviewUrl(null); setSelectedFile(null); setSelectedSampleKey(null); }}
                className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition-all"
              >
                बदला (Change)
              </button>
            </div>
          )}

          {/* 3. Empty State (Prompt for camera or upload) */}
          {!isCameraActive && !previewUrl && (
            <div className="p-6 text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-agri-100 text-agri-700 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {t('takePhoto')} / {t('uploadPhoto')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {t('dragDrop')}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {t('supportedFormats')}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex items-center gap-2 px-5 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-semibold rounded-xl text-sm shadow-md transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  {t('takePhoto')}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm border border-gray-300 shadow-sm transition-all"
                >
                  <Upload className="w-4 h-4" />
                  {t('uploadPhoto')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

        </div>

        {/* Quick Demo Test Samples (Essential for Judges to evaluate instantly) */}
        <div className="mt-5 p-4 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-harvest-500" />
              {t('quickSamples')}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">
              (हॅकेथॉन परीक्षकांसाठी त्वरित चाचणी नमुने)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            
            {/* Tomato Early Blight */}
            <button
              onClick={() => pickSample('tomato_blight', 'Tomato Early Blight', '/mock-samples/tomato_early_blight.jpg')}
              className={`p-2 rounded-xl text-left border transition-all ${
                selectedSampleKey === 'tomato_blight' ? 'border-agri-600 bg-agri-100/60 ring-2 ring-agri-500' : 'bg-white border-gray-200 hover:border-agri-400'
              }`}
            >
              <span className="text-xs font-bold text-gray-800 block truncate">🍅 {t('sampleTomatoBlight')}</span>
              <span className="text-[10px] text-gray-500">Alternaria solani</span>
            </button>

            {/* Cotton Pink Bollworm */}
            <button
              onClick={() => pickSample('cotton_bollworm', 'Cotton Bollworm', '/mock-samples/cotton_bollworm.jpg')}
              className={`p-2 rounded-xl text-left border transition-all ${
                selectedSampleKey === 'cotton_bollworm' ? 'border-agri-600 bg-agri-100/60 ring-2 ring-agri-500' : 'bg-white border-gray-200 hover:border-agri-400'
              }`}
            >
              <span className="text-xs font-bold text-gray-800 block truncate">🌾 {t('sampleCottonBollworm')}</span>
              <span className="text-[10px] text-gray-500">Pest Damage</span>
            </button>

            {/* Potato Blight */}
            <button
              onClick={() => pickSample('potato_blight', 'Potato Early Blight', '/mock-samples/potato_early_blight.jpg')}
              className={`p-2 rounded-xl text-left border transition-all ${
                selectedSampleKey === 'potato_blight' ? 'border-agri-600 bg-agri-100/60 ring-2 ring-agri-500' : 'bg-white border-gray-200 hover:border-agri-400'
              }`}
            >
              <span className="text-xs font-bold text-gray-800 block truncate">🥔 {t('samplePotatoBlight')}</span>
              <span className="text-[10px] text-gray-500">Alternaria</span>
            </button>

            {/* Sugarcane Red Rot */}
            <button
              onClick={() => pickSample('sugarcane_redrot', 'Sugarcane Red Rot', '/mock-samples/sugarcane_redrot.jpg')}
              className={`p-2 rounded-xl text-left border transition-all ${
                selectedSampleKey === 'sugarcane_redrot' ? 'border-agri-600 bg-agri-100/60 ring-2 ring-agri-500' : 'bg-white border-gray-200 hover:border-agri-400'
              }`}
            >
              <span className="text-xs font-bold text-gray-800 block truncate">🎋 {t('sampleSugarcane')}</span>
              <span className="text-[10px] text-gray-500">Colletotrichum</span>
            </button>

            {/* Healthy Leaf */}
            <button
              onClick={() => pickSample('healthy', 'Healthy Crop Leaf', '/mock-samples/healthy_leaf.jpg')}
              className={`p-2 rounded-xl text-left border transition-all ${
                selectedSampleKey === 'healthy' ? 'border-agri-600 bg-agri-100/60 ring-2 ring-agri-500' : 'bg-white border-gray-200 hover:border-agri-400'
              }`}
            >
              <span className="text-xs font-bold text-emerald-800 block truncate">🌿 {t('sampleHealthy')}</span>
              <span className="text-[10px] text-emerald-600">No Disease</span>
            </button>

          </div>
        </div>

        {/* Action Button: Diagnose Leaf */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleDiagnose}
            disabled={isScanning || (!previewUrl && !selectedFile)}
            className={`w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl transition-all ${
              isScanning || (!previewUrl && !selectedFile)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-agri-700 via-agri-600 to-agri-800 hover:from-agri-800 hover:to-agri-900 text-white active:scale-98 shadow-agri-700/30'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{t('scanning')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-harvest-400" />
                <span>{t('scanNow')}</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}

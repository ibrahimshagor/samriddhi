import React, { useState, useRef } from 'react';
import { useApp, FIXED_DEVELOPER_NAME, FIXED_DEVELOPER_POWERED_BY, FIXED_DEVELOPER_WEBSITE } from '../context/AppContext';
import {
  Settings,
  Save,
  ShieldAlert,
  Globe,
  Palette,
  CheckCircle2,
  Flame,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Cloud,
  HardDrive,
  Lock,
  ShieldCheck,
  ExternalLink,
  Code2,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react';
import { firebaseConfig } from '../lib/firebase';
import { GoogleDriveBackupModal } from '../components/GoogleDriveBackupModal';
import { getCachedGoogleUser, getActiveDriveToken } from '../lib/googleDriveBackup';

// Curated Banking & Finance SVG Presets
const LOGO_PRESETS = [
  {
    id: 'default_favicon',
    nameBn: 'ডিফল্ট সমৃদ্ধি গ্রোথ শিল্ড (সম Favicon)',
    nameEn: 'Default Samriddhi Growth Emblem',
    svgUrl: '/favicon.svg',
  },
  {
    id: 'golden_shield',
    nameBn: 'মডার্ন গোল্ডেন গ্রিন লায়ন শিল্ড',
    nameEn: 'Golden Emerald Shield Emblem',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><defs><linearGradient id="p1Grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#059669" /><stop offset="100%" stop-color="#064e3b" /></linearGradient><linearGradient id="p1Gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fbbf24" /><stop offset="100%" stop-color="#d97706" /></linearGradient></defs><rect width="512" height="512" rx="120" fill="url(#p1Grad)" /><circle cx="256" cy="256" r="180" fill="none" stroke="url(#p1Gold)" stroke-width="8" stroke-dasharray="24 12" opacity="0.6"/><path d="M 170 170 C 170 130 210 110 256 110 C 310 110 345 140 345 180 C 345 230 290 240 256 256 C 210 275 165 295 165 345 C 165 390 205 410 256 410 C 310 410 345 380 345 340" fill="none" stroke="url(#p1Gold)" stroke-width="36" stroke-linecap="round"/><circle cx="345" cy="180" r="20" fill="#fbbf24" /><circle cx="165" cy="345" r="20" fill="#34d399" /></svg>`,
  },
  {
    id: 'coop_bank',
    nameBn: 'সমবায় একাগ্রতা ও সঞ্চয় প্রতীক',
    nameEn: 'Cooperative Society & Trust Emblem',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><defs><linearGradient id="p2Bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#047857" /><stop offset="100%" stop-color="#065f46" /></linearGradient><linearGradient id="p2Gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a" /><stop offset="100%" stop-color="#eab308" /></linearGradient></defs><rect width="512" height="512" rx="120" fill="url(#p2Bg)" /><path d="M 256 90 L 390 190 L 390 400 L 122 400 L 122 190 Z" fill="#022c22" stroke="url(#p2Gold)" stroke-width="12" stroke-linejoin="round" /><circle cx="256" cy="240" r="60" fill="url(#p2Gold)" /><path d="M 180 370 C 180 300 332 300 332 370 Z" fill="#10b981" /><text x="256" y="252" font-family="system-ui, -apple-system, sans-serif" font-size="40" font-weight="900" fill="#064e3b" text-anchor="middle">সম</text></svg>`,
  },
];

export const WebsiteSettings: React.FC = () => {
  const {
    lang,
    settings,
    updateSettings,
    firebaseConnected,
    isFirebaseSyncing,
    syncAllDataToFirebase,
    checkFirebaseStatus,
    showToast,
  } = useApp();

  const [siteNameBn, setSiteNameBn] = useState(settings.siteNameBn);
  const [siteNameEn, setSiteNameEn] = useState(settings.siteNameEn);
  const [logoSvg, setLogoSvg] = useState<string>(settings.logoSvg || '/favicon.svg');
  const [noticeBannerBn, setNoticeBannerBn] = useState(settings.noticeBannerBn || '');
  const [demoMode, setDemoMode] = useState(settings.demoMode);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [checkingFirebase, setCheckingFirebase] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে একটি স্কয়ার .svg ফাইল নির্বাচন করুন' : 'Please select a square .svg file', 'error');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        if (result.trim().startsWith('<svg')) {
          // Raw SVG string -> encode to data URL
          const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(result)}`;
          setLogoSvg(encoded);
        } else {
          // Data URL
          setLogoSvg(result);
        }
        showToast(lang === 'bn' ? 'এসভিজি লোগো সফলভাবে লোড হয়েছে!' : 'SVG Logo loaded successfully!', 'success');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const driveUser = getCachedGoogleUser();
  const driveToken = getActiveDriveToken();

  const handleCheckConnection = async () => {
    setCheckingFirebase(true);
    const connected = await checkFirebaseStatus();
    setCheckingFirebase(false);
    showToast(
      connected
        ? (lang === 'bn' ? 'ফায়ারবেস সংযোগ সচল রয়েছে!' : 'Firebase connection is active!')
        : (lang === 'bn' ? 'ফায়ারবেস সংযোগ পরীক্ষা সম্পন্ন' : 'Firebase check complete'),
      connected ? 'success' : 'info'
    );
  };

  const [custModules, setCustModules] = useState({
    assetInvestments: settings.customerVisibleModules?.assetInvestments ?? false,
    institutionalBorrowings: settings.customerVisibleModules?.institutionalBorrowings ?? false,
    reportsAudit: settings.customerVisibleModules?.reportsAudit ?? false,
    packageSchemes: settings.customerVisibleModules?.packageSchemes ?? true,
    kycForm: settings.customerVisibleModules?.kycForm ?? true,
    adjustmentRequests: settings.customerVisibleModules?.adjustmentRequests ?? true,
    supportComplaints: settings.customerVisibleModules?.supportComplaints ?? true,
    paymentChannels: settings.customerVisibleModules?.paymentChannels ?? true,
    institutions: settings.customerVisibleModules?.institutions ?? true,
    branchManagement: settings.customerVisibleModules?.branchManagement ?? true,
  });

  const toggleCustModule = (key: keyof typeof custModules) => {
    setCustModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      siteNameBn,
      siteNameEn,
      logoSvg,
      developerName: FIXED_DEVELOPER_NAME,
      developerPoweredBy: FIXED_DEVELOPER_POWERED_BY,
      developerWebsite: FIXED_DEVELOPER_WEBSITE,
      noticeBannerBn,
      noticeBannerEn: noticeBannerBn,
      demoMode,
      customerVisibleModules: custModules,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>{lang === 'bn' ? '১৩. ওয়েবসাইট ও সিস্টেম সেটিংস' : '13. Website & System Settings'}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {lang === 'bn'
            ? 'ওয়েবসাইট নাম, ব্র্যান্ডিং, ডেভেলপার ক্রেডিট, গ্লোবাল নোটিশ ও ডেমো মোড কন্ট্রোল'
            : 'Branding, developer attribution, notice banner and demo toggle'}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-2xl text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{lang === 'bn' ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings updated successfully!'}</span>
        </div>
      )}

      {/* Firebase Cloud Connection Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-emerald-500/10 dark:from-amber-950/30 dark:to-emerald-950/30 rounded-3xl p-6 border border-amber-200/80 dark:border-amber-800/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'ফায়ারবেস ক্লাউড ডাটাবেস ও সার্ভিসেস' : 'Firebase Cloud Database & Services'}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  firebaseConnected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {firebaseConnected ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'কানেক্টেড' : 'Connected'}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'স্ট্যান্ডবাই' : 'Standby'}</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Project ID: <span className="font-bold text-amber-700 dark:text-amber-400">{firebaseConfig.projectId}</span> | Auth: <span className="font-bold">{firebaseConfig.authDomain}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCheckConnection}
              disabled={checkingFirebase}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingFirebase ? 'animate-spin' : ''}`} />
              <span>{lang === 'bn' ? 'কানেকশন টেস্ট' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={syncAllDataToFirebase}
              disabled={isFirebaseSyncing}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/20 active:scale-95 disabled:opacity-50"
            >
              <Database className={`w-3.5 h-3.5 ${isFirebaseSyncing ? 'animate-pulse' : ''}`} />
              <span>{isFirebaseSyncing ? (lang === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (lang === 'bn' ? 'সকল ডাটা সিঙ্ক করুন' : 'Sync All Data')}</span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-amber-100 dark:border-amber-900/50 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {lang === 'bn' ? '✓ ফায়ারবেস ক্লাউড সেবা সক্রিয়:' : '✓ Firebase Cloud Services Active:'}
          </p>
          <p className="leading-relaxed">
            {lang === 'bn'
              ? 'আপনার দেওয়া কনফিগারেশন কী দিয়ে Firebase App, Cloud Firestore ও Storage সফলভাবে কনফিগার করা হয়েছে। সমস্ত মেম্বার, ডিপোজিট, লোন ও ট্রানজেকশন ক্লাউডে সিঙ্ক করা সম্ভব।'
              : 'Firebase App, Cloud Firestore and Storage have been configured with your API credentials. All members, deposits, loans, and transactions can be synced to your cloud database.'}
          </p>
        </div>
      </div>

      {/* Google Drive Automatic Backup & Restore Card */}
      <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-emerald-500/10 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-3xl p-6 border border-blue-200/80 dark:border-blue-800/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Cloud className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'গুগল ড্রাইভ অটো ব্যাকআপ ও রিস্টোর' : 'Google Drive Auto-Backup & Restore'}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  driveUser
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {driveUser ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'কানেক্টেড' : 'Connected'}</span>
                    </>
                  ) : (
                    <span>{lang === 'bn' ? 'কানেক্ট করুন' : 'Setup Required'}</span>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {driveUser
                  ? (lang === 'bn' ? `সংযুক্ত একাউন্ট: ${driveUser.email}` : `Account: ${driveUser.email}`)
                  : (lang === 'bn' ? 'সুপার অ্যাডমিনের নিজস্ব গুগল ড্রাইভে প্রতিদিন স্বয়ংক্রিয় JSON ব্যাকআপ' : 'Automated daily JSON backups to your personal Google Drive account')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDriveModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer w-full sm:w-auto"
          >
            <HardDrive className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ড্রাইভ ব্যাকআপ ও রিস্টোর ম্যানেজার' : 'Manage Drive Backups'}</span>
          </button>
        </div>

        <div className="p-3 bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-blue-100 dark:border-blue-900/50 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {lang === 'bn' ? '✓ ড্রাইভ ব্যাকআপ সুবিধা:' : '✓ Google Drive Backup Highlights:'}
          </p>
          <p className="leading-relaxed">
            {lang === 'bn'
              ? 'গুগল একাউন্ট নির্বাচন করে কানেক্ট করার পর প্রতিদিন নির্দিষ্ট সময়ে সম্পূর্ণ ডাটাবেসের একটি JSON ফাইল Samriddhi_FMS_Backups ফোল্ডারে সেভ হবে। যেকোনো প্রয়োজনে তালিকা থেকে ১-ক্লিকে ডাটাবেস রিস্টোর করা যাবে।'
              : 'After connecting your Google Account, a full database JSON snapshot is uploaded automatically on schedule. You can restore your data at any time from your backup list.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'সোসাইটি / ব্যাংকের নাম (বাংলা)' : 'Site Name (Bangla)'}
            </label>
            <input
              type="text"
              value={siteNameBn}
              onChange={(e) => setSiteNameBn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'সোসাইটি / ব্যাংকের নাম (English)' : 'Site Name (English)'}
            </label>
            <input
              type="text"
              value={siteNameEn}
              onChange={(e) => setSiteNameEn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
              required
            />
          </div>
        </div>

        {/* Square SVG Logo Management Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-slate-50 dark:from-emerald-950/20 dark:to-slate-800/60 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'ব্র্যান্ডিং ও স্কয়ার লোগো ব্যবস্থাপনা (Square SVG Logo)' : 'Square SVG Logo & Branding'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    1:1 Square
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === 'bn'
                    ? 'এই লোগোটি উপরে হেডারের নামের পাশে এবং বাম পাশের নেভিগেশন ড্রয়ারে স্বয়ংক্রিয়ভাবে সেট হবে।'
                    : 'This logo is displayed in the Top Header, Sidebar Navigation Drawer, and Login Screen.'}
                </p>
              </div>
            </div>

            {logoSvg !== '/favicon.svg' && (
              <button
                type="button"
                onClick={() => setLogoSvg('/favicon.svg')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ডিফল্ট সম আইকনে রিসেট' : 'Reset to Default'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left: Drag & Drop / File Uploader */}
            <div className="lg:col-span-7 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 scale-[0.99]'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {lang === 'bn' ? 'এখানে স্কয়ার .SVG ফাইল ড্র্যাগ করুন অথবা ব্রাউজ করুন' : 'Drag & drop square .SVG file or browse'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {lang === 'bn' ? 'প্রস্তাবিত অনুপাত ১:১ (যেমন: 512x512 বা 256x256 স্কয়ার ভেক্টর)' : 'Recommended ratio 1:1 (Vector SVG, 512x512 max clarity)'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  {lang === 'bn' ? 'ফাইল সিলেক্ট করুন' : 'Select File'}
                </button>
              </div>

              {/* Ready-made SVG Presets */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'bn' ? 'তৈরি করা রেডিমেড ব্যাংকিং লোগো প্রিসেট:' : 'Curated Banking SVG Presets:'}</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {LOGO_PRESETS.map((preset) => {
                    const isSelected =
                      preset.svgUrl === logoSvg ||
                      (preset.svgData && logoSvg.includes(encodeURIComponent(preset.svgData.substring(0, 30))));
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          if (preset.svgUrl) {
                            setLogoSvg(preset.svgUrl);
                          } else if (preset.svgData) {
                            setLogoSvg(`data:image/svg+xml;utf8,${encodeURIComponent(preset.svgData)}`);
                          }
                          showToast(lang === 'bn' ? `${preset.nameBn} নির্বাচন করা হয়েছে` : 'Preset Selected', 'info');
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-emerald-800 flex items-center justify-center p-0.5">
                          <img
                            src={preset.svgUrl || `data:image/svg+xml;utf8,${encodeURIComponent(preset.svgData || '')}`}
                            alt={preset.nameEn}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {lang === 'bn' ? preset.nameBn : preset.nameEn}
                          </p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Live Preview Box */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block border-b border-slate-100 dark:border-slate-800 pb-2">
                👁️ {lang === 'bn' ? 'সরাসরি লাইভ প্রিভিউ (Live Preview)' : 'Live Preview'}
              </span>

              {/* Preview 1: Header */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                  {lang === 'bn' ? '১. টপ হেডার বার (Header Bar):' : '1. Top Header Bar:'}
                </span>
                <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-emerald-700 shrink-0">
                    <img
                      src={logoSvg}
                      alt="Header Logo Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {lang === 'bn' ? siteNameBn : siteNameEn}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">
                      {lang === 'bn' ? 'সমবায় সমিতি ও মাইক্রো-ব্যাংকিং' : 'Cooperative Society & Micro-Banking'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview 2: Sidebar Navigation Drawer */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                  {lang === 'bn' ? '২. সাইডবার নেভিগেশন (Sidebar Navigation):' : '2. Sidebar Navigation:'}
                </span>
                <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-emerald-700 shrink-0">
                    <img
                      src={logoSvg}
                      alt="Sidebar Logo Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {lang === 'bn' ? 'সমৃদ্ধি নেভিগেশন' : 'Samriddhi Navigation'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {lang === 'bn' ? '১৭টি সম্পূর্ণ মেনু সিস্টেম' : '17 Menu Systems'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permanent & Locked Developer Attribution Section */}
        <div className="pt-3 pb-1 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {lang === 'bn' ? 'সফটওয়্যার ডেভেলপার পরিচিতি ও ক্রেডিট' : 'Software Developer Attribution'}
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'ভেরিফাইড' : 'Verified'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-bold">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{lang === 'bn' ? 'স্থায়ী ও অপরিবর্তনযোগ্য' : 'Locked & Protected'}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {lang === 'bn'
                      ? 'কপিরাইট, সিস্টেম নিরাপত্তা ও ইন্টেলেকচুয়াল প্রপার্টি সুরক্ষার জন্য ডেভেলপার তথ্য সংরক্ষিত।'
                      : 'Developer attribution and official portfolio links are permanently locked for integrity & IP protection.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  {lang === 'bn' ? 'সফটওয়্যার ডেভেলপার' : 'Lead Developer'}
                </span>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block">
                  {FIXED_DEVELOPER_NAME}
                </span>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  {lang === 'bn' ? 'পাওয়ার্ড বাই / প্রতিষ্ঠান' : 'Powered By'}
                </span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  {FIXED_DEVELOPER_POWERED_BY}
                </span>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                    {lang === 'bn' ? 'অফিসিয়াল ওয়েবসাইট' : 'Official Website'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block">
                    {FIXED_DEVELOPER_WEBSITE}
                  </span>
                </div>
                <a
                  href={`https://${FIXED_DEVELOPER_WEBSITE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 transition-colors"
                  title="Visit Website"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            📢 {lang === 'bn' ? 'গ্লোবাল নোটিশ ব্যানার (হেডারে দৃশ্যমান)' : 'Header Notice Banner'}
          </label>
          <input
            type="text"
            value={noticeBannerBn}
            onChange={(e) => setNoticeBannerBn(e.target.value)}
            placeholder="যেমন: আগামী ১৬ই আগস্ট বার্ষিক সাধারণ সভা অনুষ্ঠিত হবে।"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
          />
        </div>

        {/* Customer Menu Access Controls (Super Admin Settings) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'bn' ? 'গ্রাহক (Customer) পোর্টাল ভিজিবিলিটি সেটিংস' : 'Customer Portal Access Settings'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? 'পোর্টাল থেকে গ্রাহকদের কোন কোন মেনু দেখাবেন এবং কোনগুলো হাইড করবেন তা নির্ধারণ করুন।'
                  : 'Choose which menu items are visible or hidden for customer accounts.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {[
              { key: 'inboxMessages', bn: 'ইনবক্স ও অফিশিয়াল বার্তা (Inbox & Messages)', en: 'Inbox & Official Messages' },
              { key: 'assetInvestments', bn: '৮. সম্পদ ও বিনিয়োগ ব্যবস্থাপনা', en: 'Asset & Investment' },
              { key: 'institutionalBorrowings', bn: '৯. প্রতিষ্ঠানের গৃহীত ঋণ', en: 'Institutional Borrowings' },
              { key: 'reportsAudit', bn: '১২. রিপোর্টস ও অডিট লগ', en: 'Reports & Audit Logs' },
              { key: 'packageSchemes', bn: '১০. প্যাকেজ ও স্কিম', en: 'Packages & Schemes' },
              { key: 'kycForm', bn: '১৬. কেওয়াইসি ফর্ম', en: 'KYC Form' },
              { key: 'adjustmentRequests', bn: '১৭. এডজাস্টমেন্ট রিকোয়েস্ট', en: 'Adjustment Request' },
              { key: 'supportComplaints', bn: '১১. অভিযোগ ও সাপোর্ট', en: 'Complaints & Support' },
              { key: 'paymentChannels', bn: '৭. পেমেন্ট চ্যানেল', en: 'Payment Channels' },
              { key: 'institutions', bn: '১. প্রতিষ্ঠান নির্দেশিকা', en: 'Institutions Info' },
            ].map((item) => {
              const k = item.key as keyof typeof custModules;
              const isVisible = custModules[k] !== false;
              return (
                <div
                  key={item.key}
                  onClick={() => toggleCustModule(k)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isVisible
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-70'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {lang === 'bn' ? item.bn : item.en}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {isVisible
                        ? (lang === 'bn' ? 'কাস্টমারের কাছে দৃশ্যমান (SHOW)' : 'Visible to Customer')
                        : (lang === 'bn' ? 'কাস্টমারের কাছে অদৃশ্য (HIDE)' : 'Hidden from Customer')}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                      isVisible ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'কুইক লগইন ও ডেমো মোড' : 'Quick Login Demo Mode'}
              </p>
              <p className="text-[10px] text-slate-500">
                লগইন পেজে ১-ক্লিকে সুপার এডমিন, ম্যানেজার, স্টাফ ও গ্রাহক ডেমো সুইচিং
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDemoMode(!demoMode)}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs shadow transition-all ${
              demoMode ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            {demoMode ? 'চালু (ON)' : 'বন্ধ (OFF)'}
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সেটিংস সংরক্ষণ করুন' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Google Drive Backup and Restore Modal */}
      <GoogleDriveBackupModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Save, ShieldAlert, Globe, Palette, CheckCircle2, Flame, Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { firebaseConfig } from '../lib/firebase';

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
  const [developerName, setDeveloperName] = useState(settings.developerName);
  const [developerWebsite, setDeveloperWebsite] = useState(settings.developerWebsite);
  const [noticeBannerBn, setNoticeBannerBn] = useState(settings.noticeBannerBn || '');
  const [demoMode, setDemoMode] = useState(settings.demoMode);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [checkingFirebase, setCheckingFirebase] = useState(false);

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
      developerName,
      developerWebsite,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'ডেভেলপার নাম (Developer Credit)' : 'Developer Name'}
            </label>
            <input
              type="text"
              value={developerName}
              onChange={(e) => setDeveloperName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold text-emerald-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'ডেভেলপার ওয়েবসাইট লিঙ্ক' : 'Developer Website URL'}
            </label>
            <input
              type="text"
              value={developerWebsite}
              onChange={(e) => setDeveloperWebsite(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-mono"
              required
            />
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
              const isVisible = custModules[k];
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
    </div>
  );
};

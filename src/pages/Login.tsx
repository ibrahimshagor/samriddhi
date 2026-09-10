import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QuickLoginPanel } from '../components/QuickLoginPanel';
import { Building2, Lock, User, UserPlus, Globe, Sun, Moon, ShieldCheck } from 'lucide-react';
import { resolveLogo, DEFAULT_SAMRIDDHI_LOGO_DATA_URI } from '../utils/logo';

export const Login: React.FC = () => {
  const { login, registerMember, lang, toggleLanguage, darkMode, toggleDarkMode, settings } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Registration Form State
  const [regNameBn, setRegNameBn] = useState('');
  const [regNameEn, setRegNameEn] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    login(username, password);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNameEn || !regMobile) return;
    registerMember(
      {
        nameBn: regNameBn || regNameEn,
        nameEn: regNameEn,
        mobile: regMobile,
        email: regEmail,
        username: regUsername || regMobile,
      },
      {}
    );
    setShowRegisterModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-between transition-colors font-sans p-4">
      {/* Top Bar with Language & Theme */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow">
            সম
          </div>
          <span className="font-extrabold text-sm text-slate-800 dark:text-white">
            {lang === 'bn' ? 'সমৃদ্ধি ফাইন্যান্স' : 'Samriddhi Finance'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-2xs"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-emerald-600/30 mb-3 mx-auto flex items-center justify-center bg-emerald-700">
              <img
                src={resolveLogo(settings?.logoSvg)}
                alt="Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_SAMRIDDHI_LOGO_DATA_URI;
                }}
              />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {lang === 'bn' ? settings.siteNameBn : settings.siteNameEn}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'bn'
                ? 'সমবায় সমিতি ও ক্ষুদ্র ব্যাংক অ্যাকাউন্ট লগইন করুন'
                : 'Login to Cooperative Society & Micro-Banking System'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'ইউজার আইডি / মোবাইল নম্বর' : 'User ID / Mobile Number'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. smfadmin, smfmanager..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer mt-2"
            >
              {lang === 'bn' ? 'লগইন করুন' : 'Sign In'}
            </button>
          </form>

          {/* Become a Member Button */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সদস্য হন (Become a Member)' : 'Become a Member'}</span>
            </button>
          </div>

          {/* Quick Login Section when Demo Mode is ON */}
          <QuickLoginPanel />
        </div>
      </div>

      {/* Footer Developer Credits */}
      <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 py-3">
        <p>
          {lang === 'bn' ? 'ডেভেলপার:' : 'Developer:'}{' '}
          <span className="font-bold text-emerald-600">{settings.developerName}</span> |{' '}
          {lang === 'bn' ? 'পাওয়ার্ড বাই:' : 'Powered by:'}{' '}
          <span className="font-bold">{settings.developerPoweredBy}</span> (
          <a
            href={`https://${settings.developerWebsite}`}
            target="_blank"
            rel="noreferrer"
            className="hover:underline text-emerald-600"
          >
            {settings.developerWebsite}
          </a>
          )
        </p>
      </div>

      {/* Become a Member Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                {lang === 'bn' ? 'নতুন সদস্য নিবন্ধন ফর্ম' : 'Member Registration Form'}
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পূর্ণ নাম (বাংলায়)' : 'Full Name (Bangla)'}
                </label>
                <input
                  type="text"
                  value={regNameBn}
                  onChange={(e) => setRegNameBn(e.target.value)}
                  placeholder="যেমন: মোঃ কামরুল ইসলাম"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পূর্ণ নাম (English)' : 'Full Name (English)'}
                </label>
                <input
                  type="text"
                  value={regNameEn}
                  onChange={(e) => setRegNameEn(e.target.value)}
                  placeholder="e.g. Md. Kamrul Islam"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                </label>
                <input
                  type="tel"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md mt-2"
              >
                {lang === 'bn' ? 'নিবন্ধন সম্পন্ন করুন' : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

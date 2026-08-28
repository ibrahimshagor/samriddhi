import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DigitalIdCard } from '../components/DigitalIdCard';
import { UserIcon, CreditCard, ShieldCheck, Mail, Phone, Lock, Save, Upload, Trash2, CheckCircle2 } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { currentUser, updateUser, lang, showToast } = useApp();

  const [nameBn, setNameBn] = useState(currentUser?.nameBn || '');
  const [nameEn, setNameEn] = useState(currentUser?.nameEn || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentUser) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast(lang === 'bn' ? 'ছবি ২ মেগাবাইটের চেয়ে ছোট হতে হবে' : 'Photo must be under 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      ...currentUser,
      nameBn,
      nameEn,
      email,
      mobile,
      avatar,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-emerald-600" />
          <span>{lang === 'bn' ? '১৪. প্রোফাইল ও ডিজিটাল আইডি সেটিংস' : '14. Profile & Digital ID Settings'}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {lang === 'bn'
            ? 'আপনার ছবি, নাম, মোবাইল নম্বর ও প্রোফাইল তথ্য পরিবর্তন করুন এবং ভিজিটিং আইডি কার্ড দেখুন।'
            : 'Update photo, contact info, and view your digital member visiting card.'}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-2xl text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{lang === 'bn' ? 'প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!'}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Info & Edit Form (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            {lang === 'bn' ? 'প্রোফাইল তথ্য পরিবর্তন ও ছবি আপলোড' : 'Edit Profile & Photo Upload'}
          </h3>

          {/* Photo Upload Section */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-20 rounded-xl bg-slate-200 dark:bg-slate-700 border-2 border-emerald-500 overflow-hidden flex items-center justify-center shrink-0">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-slate-500">{nameEn.charAt(0) || 'U'}</span>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                {lang === 'bn' ? 'সদস্যের ছবি যুক্ত / পরিবর্তন করুন' : 'Upload / Change Photo'}
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'ছবি নির্বাচন করুন' : 'Choose Photo'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                {avatar && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatar('');
                      showToast(
                        lang === 'bn' ? 'আপলোডকৃত ছবি মুছে ফেলা হয়েছে' : 'Uploaded photo removed',
                        'info'
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs inline-flex items-center gap-1 border border-rose-200 dark:border-rose-900 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'ছবি মুছুন' : 'Delete Photo'}</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">সর্বোচ্চ ২ মেগাবাইট (JPG, PNG)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                {lang === 'bn' ? 'নাম (বাংলা):' : 'Name (Bangla):'}
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                {lang === 'bn' ? 'Name (English):' : 'Name (English):'}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                {lang === 'bn' ? 'ইমেইল অ্যাড্রেস:' : 'Email Address:'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                {lang === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile Number:'}
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold outline-none"
                required
              />
            </div>

            <div>
              <span className="text-slate-400 font-bold block mb-1">মেম্বারশিপ আইডি:</span>
              <p className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-black text-emerald-600 text-xs">
                {currentUser.membershipId}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block mb-1">ইউজার পদবী / রোল:</span>
              <p className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 text-xs">
                {(currentUser.role || 'user').toUpperCase()}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{lang === 'bn' ? 'প্রোফাইল আপডেট সংরক্ষণ করুন' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

        {/* Digital ID Card Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between overflow-x-auto">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'bn' ? 'ডিজিটাল ভিজিটিং মেম্বার আইডি' : 'Digital Member Visiting Card'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              প্রোফাইল ছবি পরিবর্তন করলে ভিজিটিং আইডি কার্ডে রিয়েল-টাইমে আপডেট হবে।
            </p>
          </div>

          <div className="mt-4 flex justify-center overflow-x-auto">
            <DigitalIdCard user={currentUser} />
          </div>
        </div>
      </div>
    </div>
  );
};

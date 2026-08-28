import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { User } from '../types';
import { useApp } from '../context/AppContext';
import { Download, ShieldCheck, Building2, Calendar, Phone, Hash } from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface DigitalIdCardProps {
  user: User;
  onClose?: () => void;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ user, onClose }) => {
  const { lang, institutions, branches, showToast } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);

  const inst = (institutions || []).find((i) => i.id === user?.institutionId) || (institutions || [])[0] || {
    nameBn: 'সমৃদ্ধি সঞ্চয় ও ঋণদান সমবায় সমিতি',
    nameEn: 'Samriddhi Finance Co-operative',
    registrationNo: 'REG-100234',
  };
  const branch = (branches || []).find((b) => b.id === user?.branchId) || (branches || [])[0] || {
    nameBn: 'প্রধান শাখা',
    nameEn: 'Main Branch',
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      // Use pixelRatio: 3 for ultra-crisp, high-definition (HD) image output
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        quality: 1.0,
      });
      const link = document.createElement('a');
      link.download = `Member_ID_${user.membershipId || user.username}.png`;
      link.href = dataUrl;
      link.click();
      showToast(
        lang === 'bn' ? 'এইচডি কোয়ালিটি কার্ড সফলভাবে ডাউনলোড হয়েছে!' : 'HD Digital ID Card downloaded successfully!',
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast(lang === 'bn' ? 'আইডি কার্ড ডাউনলোডে সমস্যা হয়েছে' : 'Failed to download ID Card', 'error');
    }
  };

  const roleTitleBn =
    user.role === 'super_admin'
      ? 'সুপার এডমিন'
      : user.role === 'branch_manager'
      ? 'শাখা ম্যানেজার'
      : user.role === 'branch_staff'
      ? 'শাখা স্টাফ'
      : 'সম্মানিত সদস্য / গ্রাহক';

  const roleTitleEn =
    user.role === 'super_admin'
      ? 'Super Admin'
      : user.role === 'branch_manager'
      ? 'Branch Manager'
      : user.role === 'branch_staff'
      ? 'Branch Staff'
      : 'Honorable Customer';

  return (
    <div className="flex flex-col items-center gap-4 p-2">
      {/* Compact CR80 Proportion Digital Member ID Card */}
      <div
        ref={cardRef}
        className="w-[400px] h-[245px] bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-2xl shadow-2xl p-4 border-2 border-emerald-500/40 relative overflow-hidden font-sans flex flex-col justify-between shrink-0"
      >
        {/* Background Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-emerald-700/50 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shrink-0">
              সম
            </div>
            <div>
              <h3 className="font-black text-xs text-emerald-300 tracking-tight leading-none">
                {lang === 'bn' ? inst.nameBn : inst.nameEn}
              </h3>
              <p className="text-[8.5px] text-emerald-200/70 font-medium pt-0.5">
                {lang === 'bn' ? 'ডিজিটাল সদস্য পরিচিতি কার্ড' : 'Digital Member Identity Card'}
              </p>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[8px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs shrink-0">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> {lang === 'bn' ? 'যাচাইকৃত' : 'VERIFIED'}
          </span>
        </div>

        {/* Middle Body - Image & Information Only */}
        <div className="my-1.5 grid grid-cols-12 gap-3 items-center relative z-10">
          {/* Member Photo */}
          <div className="col-span-4 flex flex-col items-center">
            <div className="w-20 h-24 rounded-xl bg-slate-800 border-2 border-emerald-400/80 overflow-hidden flex items-center justify-center shadow-md">
              {user.avatar ? (
                <img src={user.avatar} alt={user.nameEn} className="w-full h-full object-cover" />
              ) : (
                <div className="text-2xl font-black text-emerald-400">
                  {(user.nameEn || 'U').charAt(0)}
                </div>
              )}
            </div>
            <span className="mt-1 text-[7.5px] font-mono font-black text-emerald-400 tracking-widest uppercase">
              ACTIVE MEMBER
            </span>
          </div>

          {/* Member Details */}
          <div className="col-span-8 space-y-1">
            <div>
              <h2 className="text-sm font-black text-white leading-tight truncate">
                {lang === 'bn' ? user.nameBn : user.nameEn}
              </h2>
              <p className="text-[10px] font-extrabold text-emerald-400 truncate">
                {lang === 'bn' ? roleTitleBn : roleTitleEn}
              </p>
            </div>

            <div className="pt-1 space-y-1 text-[9.5px] text-slate-300">
              <p className="flex items-center gap-1.5">
                <Hash className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-emerald-400 font-bold">মেম্বার আইডি:</span>
                <span className="font-mono font-black text-amber-300 text-xs">{user.membershipId}</span>
              </p>
              <p className="flex items-center gap-1.5 truncate">
                <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{lang === 'bn' ? branch.nameBn : branch.nameEn}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>যোগদানের তারিখ: {formatDate(user.joiningDate, lang)}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="font-mono">{user.mobile}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="pt-1.5 border-t border-emerald-700/50 flex items-center justify-between text-[8px] text-emerald-300/80 font-mono tracking-wider relative z-10">
          <span>REG: {inst.registrationNo}</span>
          <span className="text-amber-300 font-bold">SAMRIDDHI FINANCE</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          {lang === 'bn' ? 'এইচডি আইডি কার্ড ডাউনলোড (PNG)' : 'Download HD Card (PNG)'}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { OfficialNotice } from '../types';
import { useApp } from '../context/AppContext';
import {
  Printer,
  Download,
  Share2,
  X,
  Building2,
  Calendar,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Tag,
  AlertTriangle,
  Flame,
  Check,
  Eye,
  EyeOff,
  Stamp,
  Type,
} from 'lucide-react';

interface NoticeDocumentModalProps {
  notice: OfficialNotice;
  onClose: () => void;
  onEdit?: (notice: OfficialNotice) => void;
}

export const NoticeDocumentModal: React.FC<NoticeDocumentModalProps> = ({
  notice,
  onClose,
  onEdit,
}) => {
  const {
    lang,
    settings,
    institutions,
    branches,
    currentUser,
    markNoticeAsRead,
    showToast,
  } = useApp();

  const printAreaRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Local watermark toggling & customization
  const [showWatermark, setShowWatermark] = useState<boolean>(
    notice.showWatermark !== undefined ? notice.showWatermark : true
  );
  const [watermarkText, setWatermarkText] = useState<string>(
    notice.watermarkText || 'OFFICIAL NOTICE'
  );
  const [isEditingWatermark, setIsEditingWatermark] = useState<boolean>(false);

  // Auto mark as read on open
  React.useEffect(() => {
    if (notice && currentUser) {
      markNoticeAsRead(notice.id);
    }
  }, [notice?.id, currentUser?.id]);

  const targetInst = notice.institutionId
    ? institutions.find((i) => i.id === notice.institutionId)
    : institutions[0];

  const targetBranch = notice.branchId
    ? branches.find((b) => b.id === notice.branchId)
    : null;

  // Targeted branches in case of institution specific branch list
  const targetedBranchNames = React.useMemo(() => {
    if (notice.scope === 'institution' && notice.branchTargetMode === 'selected' && notice.targetBranchIds) {
      return branches
        .filter((b) => notice.targetBranchIds?.includes(b.id))
        .map((b) => (lang === 'bn' ? b.nameBn : b.nameEn));
    }
    return [];
  }, [notice, branches, lang]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const text = `[স্মারক নং: ${notice.memoNo}]\n${notice.titleBn}\n${notice.contentBn}\n- ${notice.signatoryName || notice.publishedBy}, ${notice.signatoryDesignation || ''}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast(lang === 'bn' ? 'বিজ্ঞপ্তির বিবরণ কপি করা হয়েছে' : 'Notice copied to clipboard', 'info');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isAuthorOrAdmin =
    currentUser?.role === 'super_admin' ||
    notice.publishedBy === currentUser?.nameBn ||
    notice.publishedBy === currentUser?.nameEn;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      {/* Modal Container */}
      <div className="bg-slate-100 dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[96vh] overflow-hidden print:max-h-none print:border-none print:shadow-none print:bg-white print:rounded-none">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold shrink-0">
              <FileText className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {lang === 'bn' ? 'অফিসিয়াল সার্কুলার / নোটিশ প্রিভিউ (A4 ফরম্যাট)' : 'Official Notice / Circular Preview (A4 Format)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {notice.memoNo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Watermark Toggle & Edit Button */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowWatermark(!showWatermark)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showWatermark
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={showWatermark ? (lang === 'bn' ? 'ওয়াটারমার্ক বন্ধ করুন' : 'Hide Watermark') : (lang === 'bn' ? 'ওয়াটারমার্ক চালু করুন' : 'Show Watermark')}
              >
                {showWatermark ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{lang === 'bn' ? (showWatermark ? 'ওয়াটারমার্ক: চালু' : 'ওয়াটারমার্ক: বন্ধ') : (showWatermark ? 'Watermark: ON' : 'Watermark: OFF')}</span>
              </button>

              {showWatermark && (
                <button
                  type="button"
                  onClick={() => setIsEditingWatermark(!isEditingWatermark)}
                  className="px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                  title={lang === 'bn' ? 'ওয়াটারমার্ক টেক্সট পরিবর্তন' : 'Edit Watermark Text'}
                >
                  <Type className="w-3 h-3" />
                  <span className="hidden sm:inline">{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
                </button>
              )}
            </div>

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={lang === 'bn' ? 'কপি করুন' : 'Copy Notice Text'}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? (lang === 'bn' ? 'কপিকৃত' : 'Copied') : (lang === 'bn' ? 'কপি' : 'Copy')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'bn' ? 'প্রিন্ট / PDF' : 'Print / PDF'}</span>
            </button>

            {isAuthorOrAdmin && onEdit && (
              <button
                onClick={() => onEdit(notice)}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer hidden md:flex items-center gap-1"
              >
                <span>{lang === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Watermark Editor Drawer if Open (Hidden on print) */}
        {isEditingWatermark && showWatermark && (
          <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3 text-xs print:hidden animate-fadeIn">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-bold text-amber-900 dark:text-amber-300 shrink-0">
                {lang === 'bn' ? 'ওয়াটারমার্ক লেখা:' : 'Watermark Text:'}
              </span>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="যেমন: OFFICIAL NOTICE / সার্কুলার / সমবায় সমিতি"
                className="px-3 py-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 flex-1 max-w-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsEditingWatermark(false)}
              className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold text-xs hover:bg-amber-700 cursor-pointer"
            >
              {lang === 'bn' ? 'সম্পন্ন' : 'Done'}
            </button>
          </div>
        )}

        {/* Scrollable Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center custom-scrollbar print:p-0 print:overflow-visible">
          {/* A4 Paper Container */}
          <div
            ref={printAreaRef}
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-12 shadow-xl border border-slate-200 rounded-2xl flex flex-col justify-between relative print:shadow-none print:border-none print:p-8 print:m-0 print:w-full print:min-h-0 print:rounded-none"
            style={{ fontFamily: "'Noto Serif Bengali', 'SolaimanLipi', Georgia, serif" }}
          >
            {/* Background Official Watermark */}
            {showWatermark && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none overflow-hidden">
                <span className="text-[90px] sm:text-[110px] font-black tracking-widest text-slate-900 uppercase rotate-[-30deg] text-center px-4 leading-tight">
                  {watermarkText || 'OFFICIAL NOTICE'}
                </span>
              </div>
            )}

            {/* Top Section */}
            <div>
              {/* Official Header / Letterhead - Perfectly Centered & Symmetrical */}
              <div className="text-center pb-5 border-b-2 border-emerald-800 flex flex-col items-center">
                {/* Logo Centered on Top */}
                <div className="mb-2">
                  {settings?.logoSvg ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-emerald-700 p-1 flex items-center justify-center shadow-sm">
                      <img
                        src={settings.logoSvg}
                        alt="Logo"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white font-black text-xl flex items-center justify-center shadow-sm">
                      SF
                    </div>
                  )}
                </div>

                {/* Institution Name */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tracking-tight text-center">
                  {targetInst ? (lang === 'bn' ? targetInst.nameBn : targetInst.nameEn) : (lang === 'bn' ? settings?.siteNameBn : settings?.siteNameEn)}
                </h1>

                {/* Subtitle / Govt Approval */}
                <p className="text-xs text-slate-600 font-sans tracking-wide mt-0.5 text-center">
                  {targetInst?.regNo ? `গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত • রেজিঃ নং: ${targetInst.regNo}` : 'ক্ষুদ্রঋণ ও সঞ্চয় কার্যক্রম সমবায় ফেডারেশন'}
                </p>

                {/* Sub Header / Branch & Central Address */}
                <p className="text-xs text-slate-700 font-sans font-medium mt-1.5 text-center">
                  {targetBranch ? `${targetBranch.nameBn} (${targetBranch.code}) | ${targetBranch.address}` : (targetInst?.address || 'প্রধান কার্যালয়: ঢাকা, বাংলাদেশ')}
                </p>

                {/* Contact line */}
                <p className="text-[11px] text-slate-500 font-sans mt-0.5 text-center">
                  ফোন: {targetInst?.phone || '০১৯১১-২২৩৩৪৪'} • ইমেইল: {targetInst?.email || 'contact@samriddhi-fms.org'} • ওয়েব: www.samriddhi-fms.org
                </p>
              </div>

              {/* Scope, Target Audience & Priority Badge Bar */}
              <div className="flex items-center justify-between my-3 text-[11px] font-sans flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Scope Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    notice.scope === 'global'
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : notice.scope === 'institution'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {notice.scope === 'global'
                      ? '👑 সার্বজনীন / গ্লোবাল'
                      : notice.scope === 'institution'
                      ? notice.branchTargetMode === 'selected' && targetedBranchNames.length > 0
                        ? `🏛️ প্রতিষ্ঠান: ${targetInst?.nameBn || ''} (${targetedBranchNames.length} শাখা)`
                        : `🏛️ প্রতিষ্ঠান ভিত্তিক (সকল শাখা)`
                      : `🏢 শাখা: ${targetBranch?.nameBn || 'নির্দিষ্ট শাখা'}`}
                  </span>

                  {/* Target Audience Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                    notice.targetAudience === 'staff'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : notice.targetAudience === 'customers'
                      ? 'bg-sky-100 text-sky-900 border border-sky-300'
                      : 'bg-slate-100 text-slate-800 border border-slate-300'
                  }`}>
                    {notice.targetAudience === 'staff'
                      ? '🔒 অভ্যন্তরীণ (কর্মকর্তা ও স্টাফ)'
                      : notice.targetAudience === 'customers'
                      ? '👥 সম্মানিত গ্রাহক ও সদস্যবৃন্দ'
                      : '🌐 সর্বসাধারণ ও কর্মকর্তা'}
                  </span>

                  {/* Priority Badge */}
                  {notice.priority === 'urgent' && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black uppercase tracking-wider animate-pulse">
                      🚨 জরুরি (Urgent)
                    </span>
                  )}
                  {notice.priority === 'high' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold uppercase">
                      ⚠️ উচ্চ অগ্রাধিকার
                    </span>
                  )}
                </div>

                <div className="text-slate-500 font-mono text-[11px]">
                  শ্রেণি (বিষয়): <span className="font-bold text-slate-800">{notice.category}</span>
                </div>
              </div>

              {/* Targeted branches listing if institution specific branches selected */}
              {notice.scope === 'institution' && notice.branchTargetMode === 'selected' && targetedBranchNames.length > 0 && (
                <div className="mb-3 px-3 py-1.5 bg-blue-50/80 rounded-lg border border-blue-200 text-[10px] text-blue-950 font-sans">
                  <span className="font-bold">আওতাভুক্ত শাখাসমূহ: </span>
                  {targetedBranchNames.join(', ')}
                </div>
              )}

              {/* Memo & Date Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-y border-slate-300 font-sans text-xs text-slate-800 mb-6 gap-1">
                <div>
                  <span className="font-bold text-slate-900">স্মারক নং: </span>
                  <span className="font-mono font-semibold">{notice.memoNo}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">তারিখ: </span>
                  <span>{notice.publishDate} খ্রিষ্টাব্দ</span>
                </div>
              </div>

              {/* Notice Title / Subject Header */}
              <div className="mb-6">
                <div className="bg-slate-50 border-l-4 border-emerald-700 p-3.5 rounded-r-xl">
                  <p className="text-xs font-bold text-emerald-900 uppercase font-sans">
                    বিষয়: {notice.titleBn}
                  </p>
                  {notice.titleEn && (
                    <p className="text-[11px] text-slate-500 font-sans italic mt-0.5">
                      Subject: {notice.titleEn}
                    </p>
                  )}
                </div>
              </div>

              {/* Formal Salutation */}
              <div className="text-sm font-semibold text-slate-800 mb-3">
                {notice.scope === 'global' ? 'সংশ্লিষ্ট সকল কর্মকর্তা, শাখা ব্যবস্থাপক, সম্মানিত সদস্য ও গ্রাহকবৃন্দের অবগতির জন্য,' : 'সম্মানিত গ্রাহক ও সংশ্লিষ্ট শাখা কর্মকর্তা কর্মচারীবৃন্দ,'}
              </div>

              {/* Notice Body Content */}
              <div className="text-slate-800 text-sm leading-relaxed text-justify space-y-4 whitespace-pre-line mb-8">
                {notice.contentBn}
              </div>

              {notice.contentEn && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 text-justify leading-relaxed whitespace-pre-line mb-6 font-sans">
                  <p className="font-bold text-slate-900 mb-1">Official English Transcript:</p>
                  {notice.contentEn}
                </div>
              )}
            </div>

            {/* Bottom Signatory / Seal Section */}
            <div className="pt-6 mt-8 border-t border-slate-200 font-sans">
              <div className="flex items-end justify-between gap-4">
                {/* Official QR & Security Stamp */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 border border-slate-300 rounded-lg p-1 flex flex-col items-center justify-center bg-slate-50 text-[8px] text-center text-slate-500 font-mono">
                    <ShieldCheck className="w-6 h-6 text-emerald-700 mb-0.5" />
                    <span>SFMS AUTH</span>
                    <span className="font-bold text-emerald-800">{notice.id.split('-')[0]?.toUpperCase() || 'VERIFIED'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    <p className="font-bold text-slate-800">ডিজিটাল ট্র্যাকিং ও অডিট ভেরিফিকেশন</p>
                    <p>সিস্টেম আইডি: <span className="font-mono font-bold text-emerald-900">{notice.id}</span></p>
                    <p>ইস্যুর সময়: {notice.createdAt || notice.publishDate}</p>
                  </div>
                </div>

                {/* Signatory Name, Signature Image & Designation */}
                <div className="text-right flex flex-col items-end">
                  {/* Uploaded Handwritten / Digital Signature or Cursive Font Fallback */}
                  {notice.signatureImageUrl ? (
                    <div className="pb-1 mb-1 max-w-[160px] flex justify-end">
                      <img
                        src={notice.signatureImageUrl}
                        alt="Signatory Signature"
                        className="h-14 max-w-[150px] object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="inline-block border-b border-dashed border-slate-400 pb-1 mb-1 px-4">
                      <span className="font-serif italic font-bold text-emerald-900 text-base">
                        {notice.signatoryName || notice.publishedBy}
                      </span>
                    </div>
                  )}

                  <p className="font-extrabold text-xs text-slate-900">
                    {notice.signatoryName || notice.publishedBy}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-semibold">
                    {notice.signatoryDesignation || (notice.scope === 'global' ? 'প্রধান নির্বাহী কর্মকর্তা (CEO)' : 'শাখা ব্যবস্থাপক')}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {notice.signatoryDepartment || (targetInst ? targetInst.nameBn : 'সমৃদ্ধি মাইক্রোফাইন্যান্স লিমিটেড')}
                  </p>
                </div>
              </div>

              {/* Document Disclaimer / Footer note */}
              <div className="mt-6 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                এটি একটি সিস্টেম জেনারেটেড অফিসিয়াল বিজ্ঞপ্তি। কোনো তথ্যের সত্যতা যাচাইয়ের জন্য প্রধান কার্যালয়ের নোটিশ বোর্ডের সাথে সমন্বয় করুন।
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { OfficialNotice, NoticeScope, NoticePriority } from '../types';
import { NoticeDocumentModal } from '../components/NoticeDocumentModal';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Printer,
  Calendar,
  Building2,
  GitBranch,
  Eye,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileText,
  Clock,
  Sparkles,
  Users,
  ShieldCheck,
  Check,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Upload,
  Image as ImageIcon,
  CheckSquare,
  Square,
  FileUp,
  XCircle,
} from 'lucide-react';

export const NoticeBoard: React.FC = () => {
  const {
    currentUser,
    lang,
    institutions,
    branches,
    notices,
    getAccessibleNotices,
    saveUserSignatureProfile,
    addNotice,
    updateNotice,
    deleteNotice,
    markNoticeAsRead,
    markAllNoticesAsRead,
    showToast,
  } = useApp();

  const [selectedNoticeForDoc, setSelectedNoticeForDoc] = useState<OfficialNotice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<OfficialNotice | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [viewOnlyUnread, setViewOnlyUnread] = useState<boolean>(false);

  // Search state inside Create/Edit Modal for branch selection
  const [modalBranchSearch, setModalBranchSearch] = useState<string>('');

  // Signature persistent save setting
  const [saveSignatureToProfile, setSaveSignatureToProfile] = useState<boolean>(true);

  // Form State for Create / Edit
  const [formData, setFormData] = useState<{
    titleBn: string;
    titleEn: string;
    contentBn: string;
    contentEn: string;
    scope: NoticeScope;
    institutionId: string;
    branchId: string;
    targetBranchIds: string[];
    branchTargetMode: 'all' | 'selected';
    targetAudience: 'all' | 'staff' | 'customers';
    category: string;
    priority: NoticePriority;
    publishDate: string;
    expiryDate: string;
    memoNo: string;
    signatoryName: string;
    signatoryDesignation: string;
    signatoryDepartment: string;
    showWatermark: boolean;
    watermarkText: string;
    signatureImageUrl: string;
    status: 'published' | 'draft';
  }>({
    titleBn: '',
    titleEn: '',
    contentBn: '',
    contentEn: '',
    scope: 'branch',
    institutionId: currentUser?.institutionId || 'inst-1',
    branchId: currentUser?.branchId || 'br-1',
    targetBranchIds: [],
    branchTargetMode: 'all',
    targetAudience: 'all',
    category: 'সার্কুলার',
    priority: 'normal',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    memoNo: '',
    signatoryName: currentUser?.savedSignatoryName || currentUser?.nameBn || currentUser?.nameEn || '',
    signatoryDesignation: currentUser?.savedSignatoryDesignation || (currentUser?.role === 'super_admin' ? 'প্রধান নির্বাহী কর্মকর্তা (CEO)' : 'শাখা ব্যবস্থাপক'),
    signatoryDepartment: currentUser?.savedSignatoryDepartment || (currentUser?.role === 'super_admin' ? 'প্রধান কার্যালয় প্রশাসন ও পরিচালনা পর্ষদ' : 'শাখা ব্যবস্থাপনা ও ঋণ বিভাগ'),
    showWatermark: true,
    watermarkText: 'OFFICIAL NOTICE',
    signatureImageUrl: currentUser?.savedSignatureUrl || '',
    status: 'published',
  });

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isBranchManager = currentUser?.role === 'branch_manager';
  const canPublishNotice = isSuperAdmin || isBranchManager;

  // Manager's allowed branches
  const userAssignedBranches = currentUser?.assignedBranchIds || (currentUser?.branchId ? [currentUser.branchId] : []);
  const availableBranchesForUser = isSuperAdmin
    ? branches
    : branches.filter((b) => userAssignedBranches.includes(b.id));

  // Branches belonging to the currently selected institution in form
  const branchesForSelectedInst = useMemo(() => {
    return branches.filter((b) => b.institutionId === formData.institutionId);
  }, [branches, formData.institutionId]);

  // Filtered branches for search inside modal
  const filteredBranchesForInstModal = useMemo(() => {
    if (!modalBranchSearch.trim()) return branchesForSelectedInst;
    const q = modalBranchSearch.toLowerCase().trim();
    return branchesForSelectedInst.filter(
      (b) =>
        b.nameBn?.toLowerCase().includes(q) ||
        b.nameEn?.toLowerCase().includes(q) ||
        b.code?.toLowerCase().includes(q) ||
        b.addressBn?.toLowerCase().includes(q) ||
        b.addressEn?.toLowerCase().includes(q)
    );
  }, [branchesForSelectedInst, modalBranchSearch]);

  // Get Accessible notices for current user
  const accessibleNotices = useMemo(() => {
    return getAccessibleNotices ? getAccessibleNotices(currentUser) : notices;
  }, [getAccessibleNotices, notices, currentUser]);

  // Filtered notices
  const filteredNotices = useMemo(() => {
    return accessibleNotices.filter((n) => {
      // Scope Filter
      if (selectedScope !== 'all' && n.scope !== selectedScope) return false;

      // Target Audience Filter
      if (selectedAudience !== 'all' && n.targetAudience && n.targetAudience !== selectedAudience) return false;

      // Category Filter
      if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;

      // Priority Filter
      if (selectedPriority !== 'all' && n.priority !== selectedPriority) return false;

      // Branch Filter
      if (selectedBranchId !== 'all') {
        if (n.scope === 'branch' && n.branchId !== selectedBranchId) return false;
        if (n.scope === 'institution' && n.branchTargetMode === 'selected' && n.targetBranchIds) {
          if (!n.targetBranchIds.includes(selectedBranchId)) return false;
        }
      }

      // Unread Filter
      if (viewOnlyUnread && currentUser) {
        if (n.readByUserIds?.includes(currentUser.id)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitleBn = n.titleBn?.toLowerCase().includes(q);
        const matchTitleEn = n.titleEn?.toLowerCase().includes(q);
        const matchMemo = n.memoNo?.toLowerCase().includes(q);
        const matchContent = n.contentBn?.toLowerCase().includes(q) || n.contentEn?.toLowerCase().includes(q);
        const matchSignatory = n.signatoryName?.toLowerCase().includes(q) || n.publishedBy?.toLowerCase().includes(q);
        if (!matchTitleBn && !matchTitleEn && !matchMemo && !matchContent && !matchSignatory) return false;
      }

      return true;
    });
  }, [
    accessibleNotices,
    selectedScope,
    selectedAudience,
    selectedCategory,
    selectedPriority,
    selectedBranchId,
    viewOnlyUnread,
    searchQuery,
    currentUser,
  ]);

  // Statistics counters
  const totalCount = accessibleNotices.length;
  const globalCount = accessibleNotices.filter((n) => n.scope === 'global').length;
  const instCount = accessibleNotices.filter((n) => n.scope === 'institution').length;
  const branchCount = accessibleNotices.filter((n) => n.scope === 'branch').length;
  const unreadCount = currentUser
    ? accessibleNotices.filter((n) => !n.readByUserIds?.includes(currentUser.id)).length
    : 0;

  const openCreateModal = () => {
    setEditingNotice(null);
    const defaultInstId = currentUser?.institutionId || institutions[0]?.id || 'inst-1';
    setFormData({
      titleBn: '',
      titleEn: '',
      contentBn: '',
      contentEn: '',
      scope: isSuperAdmin ? 'global' : 'branch',
      institutionId: defaultInstId,
      branchId: availableBranchesForUser[0]?.id || 'br-1',
      targetBranchIds: [],
      branchTargetMode: 'all',
      targetAudience: 'all',
      category: 'সার্কুলার',
      priority: 'normal',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      memoNo: '',
      signatoryName: currentUser?.savedSignatoryName || currentUser?.nameBn || currentUser?.nameEn || '',
      signatoryDesignation: currentUser?.savedSignatoryDesignation || (isSuperAdmin ? 'প্রধান নির্বাহী কর্মকর্তা (CEO)' : 'শাখা ব্যবস্থাপক'),
      signatoryDepartment: currentUser?.savedSignatoryDepartment || (isSuperAdmin ? 'প্রধান কার্যালয় প্রশাসন ও পরিচালনা পর্ষদ' : 'শাখা ব্যবস্থাপনা ও ঋণ বিভাগ'),
      showWatermark: true,
      watermarkText: 'OFFICIAL NOTICE',
      signatureImageUrl: currentUser?.savedSignatureUrl || '',
      status: 'published',
    });
    setShowCreateModal(true);
  };

  const openEditModal = (notice: OfficialNotice) => {
    setEditingNotice(notice);
    setFormData({
      titleBn: notice.titleBn,
      titleEn: notice.titleEn || '',
      contentBn: notice.contentBn,
      contentEn: notice.contentEn || '',
      scope: notice.scope,
      institutionId: notice.institutionId || institutions[0]?.id || 'inst-1',
      branchId: notice.branchId || 'br-1',
      targetBranchIds: notice.targetBranchIds || [],
      branchTargetMode: notice.branchTargetMode || 'all',
      targetAudience: (notice.targetAudience as any) || 'all',
      category: notice.category || 'সার্কুলার',
      priority: notice.priority,
      publishDate: notice.publishDate || notice.publishedDate || new Date().toISOString().split('T')[0],
      expiryDate: notice.expiryDate || '',
      memoNo: notice.memoNo,
      signatoryName: notice.signatoryName || notice.publishedBy,
      signatoryDesignation: notice.signatoryDesignation || '',
      signatoryDepartment: notice.signatoryDepartment || '',
      showWatermark: notice.showWatermark !== undefined ? notice.showWatermark : true,
      watermarkText: notice.watermarkText || 'OFFICIAL NOTICE',
      signatureImageUrl: notice.signatureImageUrl || '',
      status: notice.status,
    });
    setShowCreateModal(true);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে একটি ছবি ফাইল (PNG/JPG) আপলোড করুন' : 'Please upload an image file (PNG/JPG)', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast(lang === 'bn' ? 'ছবির সাইজ ২MB এর কম হতে হবে' : 'Signature image must be under 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const sigUrl = reader.result as string;
        setFormData((prev) => ({ ...prev, signatureImageUrl: sigUrl }));
        showToast(lang === 'bn' ? 'স্বাক্ষর সফলভাবে আপলোড হয়েছে! এটি ভবিষ্যতে ব্যবহারের জন্য প্রোফাইলে সংরক্ষিত থাকবে।' : 'Signature image uploaded and saved to profile!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSignatureProfilePermanently = () => {
    if (saveUserSignatureProfile) {
      saveUserSignatureProfile({
        savedSignatureUrl: formData.signatureImageUrl,
        savedSignatoryName: formData.signatoryName,
        savedSignatoryDesignation: formData.signatoryDesignation,
        savedSignatoryDepartment: formData.signatoryDepartment,
      });
      showToast(
        lang === 'bn'
          ? 'স্বাক্ষর ও পদবি সফলভাবে আপনার ইউজার প্রোফাইলে স্থায়ীভাবে সংরক্ষণ করা হয়েছে!'
          : 'Signature & Signatory details saved permanently to your profile!',
        'success'
      );
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleBn.trim() || !formData.contentBn.trim()) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে বিজ্ঞপ্তির শিরোনাম এবং বিস্তারিত বিবরণ লিখুন' : 'Please provide title and content', 'error');
      return;
    }

    if (formData.scope === 'institution' && formData.branchTargetMode === 'selected' && formData.targetBranchIds.length === 0) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে অন্তত একটি নির্দিষ্ট শাখা নির্বাচন করুন' : 'Please select at least one branch', 'error');
      return;
    }

    // Auto-save signature and signatory profile if requested
    if (saveSignatureToProfile && saveUserSignatureProfile) {
      saveUserSignatureProfile({
        savedSignatureUrl: formData.signatureImageUrl,
        savedSignatoryName: formData.signatoryName,
        savedSignatoryDesignation: formData.signatoryDesignation,
        savedSignatoryDepartment: formData.signatoryDepartment,
      });
    }

    if (editingNotice) {
      updateNotice({
        ...editingNotice,
        ...formData,
        targetAudience: formData.targetAudience,
        publishedBy: currentUser?.nameBn || currentUser?.nameEn || 'অফিস',
      });
    } else {
      addNotice({
        ...formData,
        targetAudience: formData.targetAudience,
        publishedBy: currentUser?.nameBn || currentUser?.nameEn || 'অফিস',
        scope: formData.scope,
        institutionId: formData.scope === 'global' ? undefined : formData.institutionId,
        branchId: formData.scope === 'branch' ? formData.branchId : undefined,
        targetBranchIds: formData.scope === 'institution' && formData.branchTargetMode === 'selected' ? formData.targetBranchIds : undefined,
        branchTargetMode: formData.scope === 'institution' ? formData.branchTargetMode : undefined,
      });
    }

    setShowCreateModal(false);
    setEditingNotice(null);
  };

  const handleDelete = (noticeId: string) => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত যে এই অফিসিয়াল নোটিশটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this notice?')) {
      deleteNotice(noticeId);
    }
  };

  const toggleBranchSelection = (branchId: string) => {
    setFormData((prev) => {
      const exists = prev.targetBranchIds.includes(branchId);
      return {
        ...prev,
        targetBranchIds: exists
          ? prev.targetBranchIds.filter((id) => id !== branchId)
          : [...prev.targetBranchIds, branchId],
      };
    });
  };

  const selectAllBranchesForInst = () => {
    setFormData((prev) => ({
      ...prev,
      targetBranchIds: branchesForSelectedInst.map((b) => b.id),
    }));
  };

  const deselectAllBranchesForInst = () => {
    setFormData((prev) => ({
      ...prev,
      targetBranchIds: [],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-2xl bg-white/20 backdrop-blur-md">
                <Megaphone className="w-6 h-6 text-white" />
              </span>
              <span className="text-xs font-black tracking-wider uppercase px-3 py-1 rounded-full bg-white/20">
                {lang === 'bn' ? 'অফিসিয়াল সার্কুলার ও নোটিশ পোর্টাল' : 'Official Circulars & Notice Portal'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {lang === 'bn' ? 'নোটিশ বোর্ড ও সাধারণ বিজ্ঞপ্তি' : 'Notice Board & Official Circulars'}
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
              {lang === 'bn'
                ? 'প্রধান কার্যালয়ের সার্বজনীন গ্লোবাল নোটিশ, প্রতিষ্ঠান ভিত্তিক পরিপত্র এবং শাখা কার্যালয়ের নির্দেশনাসমূহ এক নজরে দেখুন ও A4 ফরম্যাটে প্রিন্ট করুন।'
                : 'View official notices, institutional policies, and branch directives. View or print official circulars in clean A4 letterhead format.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={markAllNoticesAsRead}
                className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'bn' ? 'সব পঠিত করুন' : 'Mark All as Read'}</span>
              </button>
            )}

            {canPublishNotice && (
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 text-xs sm:text-sm font-black shadow-lg shadow-black/10 flex items-center gap-2 transition-all cursor-pointer transform active:scale-95"
              >
                <Plus className="w-4 h-4 text-amber-700" />
                <span>{lang === 'bn' ? '+ নতুন নোটিশ প্রকাশ করুন' : '+ Publish Notice'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scope Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Notices */}
        <div
          onClick={() => {
            setSelectedScope('all');
            setViewOnlyUnread(false);
          }}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            selectedScope === 'all' && !viewOnlyUnread
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-80">{lang === 'bn' ? 'মোট বিজ্ঞপ্তি' : 'Total Notices'}</span>
            <FileText className="w-4 h-4 opacity-70" />
          </div>
          <p className="text-2xl font-black mt-2">{totalCount}</p>
          <p className="text-[10px] opacity-75 mt-0.5">{lang === 'bn' ? 'সকল সক্রিয় বিজ্ঞপ্তি' : 'All active notices'}</p>
        </div>

        {/* Global Notices */}
        <div
          onClick={() => {
            setSelectedScope('global');
            setViewOnlyUnread(false);
          }}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            selectedScope === 'global'
              ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-80">{lang === 'bn' ? 'গ্লোবাল নোটিশ' : 'Global Notices'}</span>
            <Building2 className="w-4 h-4 opacity-70" />
          </div>
          <p className="text-2xl font-black mt-2">{globalCount}</p>
          <p className="text-[10px] opacity-75 mt-0.5">{lang === 'bn' ? 'প্রধান কার্যালয়ের সার্বজনীন' : 'Head Office Global'}</p>
        </div>

        {/* Branch Specific Notices */}
        <div
          onClick={() => {
            setSelectedScope('branch');
            setViewOnlyUnread(false);
          }}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            selectedScope === 'branch'
              ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-80">{lang === 'bn' ? 'শাখা ভিত্তিক নোটিশ' : 'Branch Notices'}</span>
            <GitBranch className="w-4 h-4 opacity-70" />
          </div>
          <p className="text-2xl font-black mt-2">{branchCount}</p>
          <p className="text-[10px] opacity-75 mt-0.5">{lang === 'bn' ? 'নির্দিষ্ট শাখার নোটিশ' : 'Branch Specific'}</p>
        </div>

        {/* Unread Notices */}
        <div
          onClick={() => setViewOnlyUnread(!viewOnlyUnread)}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            viewOnlyUnread
              ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-80">{lang === 'bn' ? 'অপঠিত নোটিশ' : 'Unread Notices'}</span>
            <Flame className="w-4 h-4 opacity-70" />
          </div>
          <p className="text-2xl font-black mt-2">{unreadCount}</p>
          <p className="text-[10px] opacity-75 mt-0.5">{lang === 'bn' ? 'নতুন ও অপঠিত বিজ্ঞপ্তি' : 'Needs attention'}</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'বিজ্ঞপ্তির শিরোনাম, স্মারক নং, বা বিষয়বস্তু খুঁজুন...' : 'Search notices by title, memo no, or keywords...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Scope Dropdown Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{lang === 'bn' ? '🌐 সকল নোটিশ স্কোপ' : '🌐 All Notice Scopes'}</option>
              <option value="global">{lang === 'bn' ? '👑 সুপার এডমিন গ্লোবাল নোটিশ' : '👑 Super Admin Global'}</option>
              <option value="institution">{lang === 'bn' ? '🏛️ প্রতিষ্ঠান ভিত্তিক নোটিশ' : '🏛️ Institution Notice'}</option>
              <option value="branch">{lang === 'bn' ? '🏢 শাখা ভিত্তিক নোটিশ' : '🏢 Branch Specific'}</option>
            </select>

            {/* Target Audience Filter */}
            <select
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{lang === 'bn' ? '👥 সকল গ্রাহক ও স্টাফ' : '👥 All Audiences'}</option>
              <option value="staff">{lang === 'bn' ? '🔒 শুধুমাত্র স্টাফ' : '🔒 Staff Only'}</option>
              <option value="customers">{lang === 'bn' ? '👤 শুধুমাত্র গ্রাহক' : '👤 Customers Only'}</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{lang === 'bn' ? '📂 সকল ক্যাটাগরি' : '📂 All Categories'}</option>
              <option value="সার্কুলার">সার্কুলার (Circular)</option>
              <option value="সাধারণ">সাধারণ বিজ্ঞপ্তি (General)</option>
              <option value="ছুটি">ছুটির নোটিশ (Holiday)</option>
              <option value="পলিসি ও বিধিমালা">পলিসি ও বিধিমালা (Policy)</option>
              <option value="সঞ্চয় ও ঋণ">সঞ্চয় ও ঋণ (Savings/Loan)</option>
              <option value="জরুরি">জরুরি নির্দেশনা (Emergency)</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{lang === 'bn' ? '⚡ সকল অগ্রাধিকার' : '⚡ All Priorities'}</option>
              <option value="urgent">{lang === 'bn' ? '🚨 জরুরি (Urgent)' : '🚨 Urgent'}</option>
              <option value="high">{lang === 'bn' ? '⚠️ উচ্চ অগ্রাধিকার (High)' : '⚠️ High'}</option>
              <option value="normal">{lang === 'bn' ? '📌 সাধারণ (Normal)' : '📌 Normal'}</option>
            </select>
          </div>
        </div>

        {/* Branch Filter if multi-branch or super admin */}
        {branches.length > 1 && (
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">
              {lang === 'bn' ? 'শাখা নির্বাচন:' : 'Branch Filter:'}
            </span>
            <button
              onClick={() => setSelectedBranchId('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                selectedBranchId === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {lang === 'bn' ? 'সকল শাখা' : 'All Branches'}
            </button>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBranchId(b.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                  selectedBranchId === b.id
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {b.nameBn}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notices Cards Grid */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'কোনো নোটিশ পাওয়া যায়নি' : 'No Notices Found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {lang === 'bn'
              ? 'আপনার নির্বাচিত ফিল্টার বা সার্চ অনুযায়ী কোনো সক্রিয় সার্কুলার নেই।'
              : 'There are no active circulars matching your search or filters.'}
          </p>
          {canPublishNotice && (
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'প্রথম নোটিশ প্রকাশ করুন' : 'Publish First Notice'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotices.map((notice) => {
            const isUnread = currentUser ? !notice.readByUserIds?.includes(currentUser.id) : false;
            const targetBranch = branches.find((b) => b.id === notice.branchId);
            const targetInst = institutions.find((i) => i.id === notice.institutionId);

            const isAuthorOrAdmin =
              currentUser?.role === 'super_admin' ||
              notice.publishedBy === currentUser?.nameBn ||
              notice.publishedBy === currentUser?.nameEn;

            return (
              <div
                key={notice.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between hover:shadow-lg relative overflow-hidden ${
                  isUnread
                    ? 'border-amber-400 dark:border-amber-600/80 shadow-md shadow-amber-500/5 ring-1 ring-amber-400/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Top Scope & Priority Strip */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Scope Badge */}
                      <span
                        className={`inline-flex items-center justify-center text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-center leading-normal ${
                          notice.scope === 'global'
                            ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : notice.scope === 'institution'
                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {notice.scope === 'global'
                          ? (lang === 'bn' ? '👑 গ্লোবাল' : '👑 Global')
                          : notice.scope === 'institution'
                          ? notice.branchTargetMode === 'selected' && notice.targetBranchIds?.length
                            ? (lang === 'bn' ? `🏛️ ${targetInst?.nameBn || 'প্রতিষ্ঠান'} (${notice.targetBranchIds.length} শাখা)` : `🏛️ ${targetInst?.nameEn || 'Inst'} (${notice.targetBranchIds.length} Branches)`)
                            : (lang === 'bn' ? `🏛️ ${targetInst?.nameBn || 'প্রতিষ্ঠান'}` : '🏛️ Institution')
                          : (lang === 'bn' ? `🏢 শাখা: ${targetBranch?.nameBn || 'নির্দিষ্ট শাখা'}` : `🏢 Branch: ${targetBranch?.nameEn || 'Branch'}`)}
                      </span>

                      {/* Audience Badge */}
                      {notice.targetAudience && notice.targetAudience !== 'all' && (
                        <span className={`inline-flex items-center justify-center text-[10px] font-bold px-2 py-0.5 rounded-full text-center leading-normal ${
                          notice.targetAudience === 'staff'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                        }`}>
                          {notice.targetAudience === 'staff' ? '🔒 স্টাফ' : '👥 গ্রাহক'}
                        </span>
                      )}

                      {/* Priority Badge */}
                      {notice.priority === 'urgent' && (
                        <span className="inline-flex items-center justify-center text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse text-center leading-normal">
                          {lang === 'bn' ? '🚨 জরুরি' : '🚨 Urgent'}
                        </span>
                      )}
                      {notice.priority === 'high' && (
                        <span className="inline-flex items-center justify-center text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-center leading-normal">
                          {lang === 'bn' ? 'উচ্চ অগ্রাধিকার' : 'High Priority'}
                        </span>
                      )}

                      {/* Category Tag */}
                      <span className="inline-flex items-center justify-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-center leading-normal">
                        {notice.category}
                      </span>
                    </div>

                    {/* Unread Pill */}
                    {isUnread && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        <span>{lang === 'bn' ? 'নতুন' : 'New'}</span>
                      </span>
                    )}
                  </div>

                  {/* Memo No & Date */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {notice.memoNo}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {notice.publishDate}
                    </span>
                  </div>

                  {/* Notice Title */}
                  <h3
                    onClick={() => setSelectedNoticeForDoc(notice)}
                    className="font-black text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
                  >
                    {lang === 'bn' ? notice.titleBn : notice.titleEn || notice.titleBn}
                  </h3>

                  {/* Content snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mt-2 leading-relaxed">
                    {lang === 'bn' ? notice.contentBn : notice.contentEn || notice.contentBn}
                  </p>
                </div>

                {/* Bottom Signatory Info & Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-[11px] min-w-0">
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate">
                      ✍️ {notice.signatoryName || notice.publishedBy}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 truncate text-[10px]">
                      {notice.signatoryDesignation || (notice.scope === 'global' ? 'প্রধান কার্যালয়' : 'শাখা অফিস')}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isAuthorOrAdmin && (
                      <>
                        <button
                          onClick={() => openEditModal(notice)}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={lang === 'bn' ? 'সম্পাদনা করুন' : 'Edit Notice'}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete Notice'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setSelectedNoticeForDoc(notice)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'A4 প্রিভিউ ও প্রিন্ট' : 'View & Print'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* A4 Document Preview Modal */}
      {selectedNoticeForDoc && (
        <NoticeDocumentModal
          notice={selectedNoticeForDoc}
          onClose={() => setSelectedNoticeForDoc(null)}
          onEdit={(n) => {
            setSelectedNoticeForDoc(null);
            openEditModal(n);
          }}
        />
      )}

      {/* Create / Edit Notice Modal Form */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[94vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-600 text-white shadow-md">
                  <Megaphone className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {editingNotice
                      ? (lang === 'bn' ? 'বিজ্ঞপ্তি সম্পাদনা করুন' : 'Edit Official Notice')
                      : (lang === 'bn' ? 'নতুন অফিসিয়াল নোটিশ জারি করুন' : 'Publish New Official Notice')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'bn'
                      ? 'সার্বজনীন গ্লোবাল অথবা শাখা ভিত্তিক নোটিশ প্রকাশ করুন'
                      : 'Create a global circular or branch directive'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
              {/* Scope Selection Box */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <label className="block text-xs font-black text-amber-900 dark:text-amber-200">
                  {lang === 'bn' ? '১. নোটিশের পরিধি ও এখতিয়ার (Notice Scope):' : '1. Notice Scope & Jurisdiction:'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* Global Scope (Only Super Admin) */}
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.scope === 'global'
                        ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-md'
                        : isSuperAdmin
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-dashed'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scope"
                      value="global"
                      disabled={!isSuperAdmin}
                      checked={formData.scope === 'global'}
                      onChange={() => setFormData({ ...formData, scope: 'global' })}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold">👑 গ্লোবাল নোটিশ</p>
                      <p className="text-[10px] opacity-85">সকল প্রতিষ্ঠান ও সকল শাখার জন্য সার্বজনীন</p>
                    </div>
                  </label>

                  {/* Institution Scope */}
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.scope === 'institution'
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-md'
                        : isSuperAdmin
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-dashed'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scope"
                      value="institution"
                      disabled={!isSuperAdmin}
                      checked={formData.scope === 'institution'}
                      onChange={() => setFormData({ ...formData, scope: 'institution' })}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold">🏛️ প্রতিষ্ঠান ভিত্তিক</p>
                      <p className="text-[10px] opacity-85">নির্দিষ্ট প্রতিষ্ঠানের সকল শাখার জন্য</p>
                    </div>
                  </label>

                  {/* Branch Scope */}
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.scope === 'branch'
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scope"
                      value="branch"
                      checked={formData.scope === 'branch'}
                      onChange={() => setFormData({ ...formData, scope: 'branch' })}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold">🏢 শাখা ভিত্তিক নোটিশ</p>
                      <p className="text-[10px] opacity-85">নির্দিষ্ট শাখা কার্যালয় ও গ্রাহকদের জন্য</p>
                    </div>
                  </label>
                </div>

                {/* Sub Dropdowns based on Scope */}
                {formData.scope === 'institution' && (
                  <div className="pt-2 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        টার্গেট প্রতিষ্ঠান নির্বাচন করুন:
                      </label>
                      <select
                        value={formData.institutionId}
                        onChange={(e) => {
                          const newInstId = e.target.value;
                          setFormData({
                            ...formData,
                            institutionId: newInstId,
                            targetBranchIds: [], // reset selected branches on institution switch
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                      >
                        {institutions.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.nameBn} ({i.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Branch targeting mode: All vs Selected */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {lang === 'bn' ? 'শাখা বন্টন নীতি (Branch Distribution):' : 'Branch Distribution:'}
                      </label>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer font-bold transition-all ${
                            formData.branchTargetMode === 'all'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-400 dark:border-blue-700'
                              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="branchTargetMode"
                            value="all"
                            checked={formData.branchTargetMode === 'all'}
                            onChange={() => setFormData({ ...formData, branchTargetMode: 'all', targetBranchIds: [] })}
                            className="accent-blue-600"
                          />
                          <span>{lang === 'bn' ? 'সকল শাখা (All Branches)' : 'All Branches'}</span>
                        </label>

                        <label
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer font-bold transition-all ${
                            formData.branchTargetMode === 'selected'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-400 dark:border-blue-700'
                              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="branchTargetMode"
                            value="selected"
                            checked={formData.branchTargetMode === 'selected'}
                            onChange={() => setFormData({ ...formData, branchTargetMode: 'selected' })}
                            className="accent-blue-600"
                          />
                          <span>{lang === 'bn' ? 'নির্দিষ্ট শাখা নির্বাচন করুন' : 'Select Specific Branches'}</span>
                        </label>
                      </div>

                      {/* If Selected mode: show compact searchable multi-select picker */}
                      {formData.branchTargetMode === 'selected' && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5 animate-fadeIn">
                          {/* Controls header */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                              {lang === 'bn'
                                ? `🎯 ${formData.targetBranchIds.length}/${branchesForSelectedInst.length}টি শাখা নির্বাচিত`
                                : `🎯 ${formData.targetBranchIds.length}/${branchesForSelectedInst.length} Branches Selected`}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={selectAllBranchesForInst}
                                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                              >
                                {lang === 'bn' ? 'সব নির্বাচন' : 'Select All'}
                              </button>
                              <span className="text-slate-300 dark:text-slate-700">|</span>
                              <button
                                type="button"
                                onClick={deselectAllBranchesForInst}
                                className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                              >
                                {lang === 'bn' ? 'সব আনচেক' : 'Deselect All'}
                              </button>
                            </div>
                          </div>

                          {/* Search box within branch picker */}
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="text"
                              value={modalBranchSearch}
                              onChange={(e) => setModalBranchSearch(e.target.value)}
                              placeholder={lang === 'bn' ? 'ব্রাঞ্চের নাম বা কোড লিখে দ্রুত খুঁজুন...' : 'Search branch name or code...'}
                              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {modalBranchSearch && (
                              <button
                                type="button"
                                onClick={() => setModalBranchSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Selected branch tags preview */}
                          {formData.targetBranchIds.length > 0 && (
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60 custom-scrollbar">
                              {formData.targetBranchIds.map((bId) => {
                                const b = branchesForSelectedInst.find((item) => item.id === bId);
                                if (!b) return null;
                                return (
                                  <span
                                    key={bId}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 text-[10px] font-bold border border-blue-200 dark:border-blue-800"
                                  >
                                    <span>{b.nameBn}</span>
                                    <button
                                      type="button"
                                      onClick={() => toggleBranchSelection(bId)}
                                      className="text-blue-500 hover:text-rose-600 cursor-pointer ml-0.5"
                                      title={lang === 'bn' ? 'বাদ দিন' : 'Remove'}
                                    >
                                      ✕
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {/* Scrollable Compact Branch List */}
                          {filteredBranchesForInstModal.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2 text-center">
                              {lang === 'bn' ? 'কোনো শাখা পাওয়া যায়নি।' : 'No branches found matching search.'}
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
                              {filteredBranchesForInstModal.map((b) => {
                                const isChecked = formData.targetBranchIds.includes(b.id);
                                return (
                                  <label
                                    key={b.id}
                                    className={`flex items-center gap-2 p-1.5 rounded-md border text-xs cursor-pointer transition-all ${
                                      isChecked
                                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800 font-bold'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleBranchSelection(b.id)}
                                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                    />
                                    <span className="truncate">
                                      {b.nameBn} <span className="text-[10px] opacity-75 font-mono">({b.code})</span>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formData.scope === 'branch' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      টার্গেট শাখা নির্বাচন করুন:
                    </label>
                    <select
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                    >
                      {availableBranchesForUser.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nameBn} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 2. Target Audience Selector (কার জন্য নোটিশ?) */}
              <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-sky-900 dark:text-sky-200">
                    {lang === 'bn' ? '২. লক্ষ্যভিত্তিক পাঠক / প্রাপক (Target Audience):' : '2. Target Audience:'}
                  </label>
                  <span className="text-[10px] text-sky-700 dark:text-sky-300 font-semibold">
                    {lang === 'bn' ? 'কারা এই নোটিশটি দেখতে পাবেন?' : 'Who should see this notice?'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* All */}
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.targetAudience === 'all'
                        ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetAudience"
                      value="all"
                      checked={formData.targetAudience === 'all'}
                      onChange={() => setFormData({ ...formData, targetAudience: 'all' })}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold">👥 সার্বজনীন (সকলের জন্য)</p>
                      <p className="text-[10px] opacity-85">গ্রাহক, সদস্য, কর্মকর্তা ও স্টাফবৃন্দ</p>
                    </div>
                  </label>

                  {/* Staff Only */}
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.targetAudience === 'staff'
                        ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetAudience"
                      value="staff"
                      checked={formData.targetAudience === 'staff'}
                      onChange={() => setFormData({ ...formData, targetAudience: 'staff' })}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold">🔒 শুধুমাত্র স্টাফ ও কর্মকর্তা</p>
                      <p className="text-[10px] opacity-85">অভ্যন্তরীণ সার্কুলার ও অফিসিয়াল পলিসি</p>
                    </div>
                  </label>

                  {/* Customers Only */}
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.targetAudience === 'customers'
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetAudience"
                      value="customers"
                      checked={formData.targetAudience === 'customers'}
                      onChange={() => setFormData({ ...formData, targetAudience: 'customers' })}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold">👤 সম্মানিত গ্রাহক ও সদস্য</p>
                      <p className="text-[10px] opacity-85">গ্রাহকবান্ধব সাধারণ ঘোষণা ও বিজ্ঞপ্তি</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Title & Memo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    বিজ্ঞপ্তির শিরোনাম (বাংলায়) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titleBn}
                    onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                    placeholder="যেমন: ঈদুল আজহা উপলক্ষ্যে শাখা অফিস বন্ধের নোটিশ"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    স্মারক নং (Memo No)
                  </label>
                  <input
                    type="text"
                    value={formData.memoNo}
                    onChange={(e) => setFormData({ ...formData, memoNo: e.target.value })}
                    placeholder="স্বয়ংক্রিয় হবে (খালি রাখা যাবে)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Category, Priority & Dates */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="সার্কুলার">সার্কুলার</option>
                    <option value="সাধারণ">সাধারণ বিজ্ঞপ্তি</option>
                    <option value="ছুটি">ছুটির নোটিশ</option>
                    <option value="পলিসি ও বিধিমালা">পলিসি ও বিধিমালা</option>
                    <option value="সঞ্চয় ও ঋণ">সঞ্চয় ও ঋণ</option>
                    <option value="জরুরি">জরুরি নির্দেশনা</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    অগ্রাধিকার (Priority)
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as NoticePriority })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="normal">📌 সাধারণ (Normal)</option>
                    <option value="high">⚠️ উচ্চ অগ্রাধিকার (High)</option>
                    <option value="urgent">🚨 জরুরি (Urgent)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    প্রকাশের তারিখ
                  </label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    কার্যকরের মেয়াদ (ঐচ্ছিক)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              {/* Notice Body Content (Bangla) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বিজ্ঞপ্তির বিস্তারিত বিবরণ (Body Message) *
                </label>
                <textarea
                  rows={6}
                  required
                  value={formData.contentBn}
                  onChange={(e) => setFormData({ ...formData, contentBn: e.target.value })}
                  placeholder="সংশ্লিষ্ট সকলের অবগতির জন্য জানানো যাচ্ছে যে, আগামী... তারিখে..."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* English Transcript (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  English Title & Content (ঐচ্ছিক / Optional)
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="Notice Title in English"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs mb-2"
                />
                <textarea
                  rows={3}
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  placeholder="Notice Content / Transcript in English (Optional)"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed"
                />
              </div>

              {/* Watermark Settings Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                      <FileText className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lang === 'bn' ? 'পৃষ্ঠার পেছনে ওয়াটারমার্ক অপশন (Watermark Settings)' : 'Watermark Settings'}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {lang === 'bn' ? 'ডকুমেন্টের পেছনে অফিসিয়াল জলছাপ প্রদর্শন অথবা পরিবর্তন করুন' : 'Display or customize official document watermark'}
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showWatermark}
                      onChange={(e) => setFormData({ ...formData, showWatermark: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'ওয়াটারমার্ক চালু' : 'Enable Watermark'}
                    </span>
                  </label>
                </div>

                {formData.showWatermark && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 shrink-0">
                      {lang === 'bn' ? 'ওয়াটারমার্ক টেক্সট / লেখা:' : 'Watermark Text:'}
                    </label>
                    <input
                      type="text"
                      value={formData.watermarkText}
                      onChange={(e) => setFormData({ ...formData, watermarkText: e.target.value })}
                      placeholder="যেমন: OFFICIAL NOTICE / সার্কুলার / সমবায় সমিতি"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                )}
              </div>

              {/* Signatory Details & Signature Upload (নিবেদক) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>✍️</span>
                    <span>{lang === 'bn' ? 'স্বাক্ষরকারী ও নিবেদক তথ্য (Signatory Profile):' : 'Signatory Details & Signature:'}</span>
                  </p>

                  <button
                    type="button"
                    onClick={handleSaveSignatureProfilePermanently}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px] font-extrabold border border-amber-300 dark:border-amber-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>💾</span>
                    <span>{lang === 'bn' ? 'প্রোফাইলে স্থায়ীভাবে সেভ করুন' : 'Save to My Profile'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      স্বাক্ষরকারীর নাম
                    </label>
                    <input
                      type="text"
                      value={formData.signatoryName}
                      onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      পদবি (Designation)
                    </label>
                    <input
                      type="text"
                      value={formData.signatoryDesignation}
                      onChange={(e) => setFormData({ ...formData, signatoryDesignation: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      বিভাগ / দপ্তর
                    </label>
                    <input
                      type="text"
                      value={formData.signatoryDepartment}
                      onChange={(e) => setFormData({ ...formData, signatoryDepartment: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>

                {/* Digital / Handwritten Signature Image Upload */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'স্বাক্ষরকারীর সাইন / ডিজিটাল স্বাক্ষর আপলোড (PNG/JPG)' : 'Signatory Digital Signature Upload (PNG/JPG)'}
                  </label>

                  {formData.signatureImageUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-300 dark:border-emerald-700/60">
                      <div className="h-16 w-32 bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                        <img
                          src={formData.signatureImageUrl}
                          alt="Signature Preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          {lang === 'bn' ? 'স্বাক্ষর ছবি সংযুক্ত আছে' : 'Signature Attached'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {lang === 'bn' ? 'ডকুমেন্ট প্রিভিউ ও প্রিন্টে এই সাইন প্রদর্শিত হবে' : 'This signature will be rendered on the document'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                          {lang === 'bn' ? 'পরিবর্তন' : 'Change'}
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={handleSignatureUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, signatureImageUrl: '' })}
                          className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          {lang === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-xl cursor-pointer bg-white dark:bg-slate-900 transition-colors group">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-amber-600 transition-colors mb-1" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600">
                        {lang === 'bn' ? 'স্বাক্ষরের ছবি আপলোড করতে ক্লিক করুন' : 'Click to upload signature image'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        PNG / JPG / WEBP ফরম্যাট (স্বচ্ছ ব্যাকগ্রাউন্ড বা সাদা পেপারে সাইন করা ছবি)
                      </p>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleSignatureUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
                >
                  {editingNotice
                    ? (lang === 'bn' ? 'বিজ্ঞপ্তি সংরক্ষণ করুন' : 'Update Notice')
                    : (lang === 'bn' ? 'অফিসিয়াল বিজ্ঞপ্তি প্রকাশ করুন' : 'Publish Official Notice')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { KycRecord, Customer } from '../types';
import { exportToExcel } from '../utils/formatters';
import {
  FileCheck2,
  Search,
  Filter,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  Plus,
  Upload,
  Printer,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Building2,
  PenTool,
  RotateCcw,
  FileSpreadsheet,
} from 'lucide-react';

export const KycForm: React.FC = () => {
  const {
    currentUser,
    customers,
    branches,
    kycRecords,
    saveKyc,
    reviewKyc,
    deleteKyc,
    lang,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  // Modals
  const [viewingKyc, setViewingKyc] = useState<{ kyc?: KycRecord; customer: Customer } | null>(null);
  const [editingTarget, setEditingTarget] = useState<{ customer: Customer; kyc?: KycRecord } | null>(null);
  const [rejectingTarget, setRejectingTarget] = useState<KycRecord | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Form state inside editing modal
  const [photoUrl, setPhotoUrl] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [fatherNameBn, setFatherNameBn] = useState('');
  const [fatherNameEn, setFatherNameEn] = useState('');
  const [motherNameBn, setMotherNameBn] = useState('');
  const [motherNameEn, setMotherNameEn] = useState('');
  const [presentAddressBn, setPresentAddressBn] = useState('');
  const [presentAddressEn, setPresentAddressEn] = useState('');
  const [permanentAddressBn, setPermanentAddressBn] = useState('');
  const [permanentAddressEn, setPermanentAddressEn] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  // Nominee
  const [nomineeNameBn, setNomineeNameBn] = useState('');
  const [nomineeNameEn, setNomineeNameEn] = useState('');
  const [nomineeFatherBn, setNomineeFatherBn] = useState('');
  const [nomineeFatherEn, setNomineeFatherEn] = useState('');
  const [nomineeMotherBn, setNomineeMotherBn] = useState('');
  const [nomineeMotherEn, setNomineeMotherEn] = useState('');
  const [nomineeMobile, setNomineeMobile] = useState('');
  const [nomineeEmail, setNomineeEmail] = useState('');
  const [nomineeAddressBn, setNomineeAddressBn] = useState('');
  const [nomineeAddressEn, setNomineeAddressEn] = useState('');
  const [nomineePhotoUrl, setNomineePhotoUrl] = useState('');

  // Signature
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  if (!currentUser) return null;

  const isSuperAdmin = currentUser.role === 'super_admin';
  const isCustomer = currentUser.role === 'customer';
  const userBranchId = currentUser.branchId;

  // Role-based Customer Filtering
  const safeCustomers = customers || [];
  const safeBranches = branches || [];
  const safeKycRecords = kycRecords || [];

  let availableCustomers = safeCustomers;
  if (isCustomer) {
    availableCustomers = safeCustomers.filter((c) => c.userId === currentUser.id);
  } else if (!isSuperAdmin && userBranchId) {
    availableCustomers = safeCustomers.filter((c) => c.branchId === userBranchId);
  }

  // Branch filter dropdown options
  const visibleBranches = isSuperAdmin
    ? safeBranches
    : safeBranches.filter((b) => b.id === userBranchId);

  // Compute matched customer items with their respective KYC record
  const customerKycList = availableCustomers.map((cust) => {
    const kyc = safeKycRecords.find((k) => k.customerId === cust.id);
    return {
      customer: cust,
      kyc,
      status: kyc ? kyc.status : 'missing',
    };
  });

  // Filter & Search Logic
  const filteredList = customerKycList.filter(({ customer, kyc, status }) => {
    // Branch Filter
    if (selectedBranch !== 'all' && customer.branchId !== selectedBranch) {
      return false;
    }

    // Status Filter
    if (selectedStatus !== 'all' && status !== selectedStatus) {
      return false;
    }

    // Search Query
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const matchCustBn = (customer.nameBn || '').toLowerCase().includes(query);
    const matchCustEn = (customer.nameEn || '').toLowerCase().includes(query);
    const matchAcc = (customer.accountNo || '').toLowerCase().includes(query);
    const matchMobile = (customer.mobile || '').toLowerCase().includes(query);
    const matchNid = kyc?.nidNumber ? kyc.nidNumber.toLowerCase().includes(query) : false;

    return matchCustBn || matchCustEn || matchAcc || matchMobile || matchNid;
  });

  // Status Metrics
  const totalCount = customerKycList.length;
  const approvedCount = customerKycList.filter((item) => item.status === 'approved').length;
  const pendingCount = customerKycList.filter((item) => item.status === 'pending').length;
  const missingCount = customerKycList.filter((item) => item.status === 'missing').length;
  const rejectedCount = customerKycList.filter((item) => item.status === 'rejected').length;

  // Open Edit/Create Modal
  const handleOpenEdit = (customer: Customer, existingKyc?: KycRecord) => {
    setEditingTarget({ customer, kyc: existingKyc });
    if (existingKyc) {
      setPhotoUrl(existingKyc.photoUrl || '');
      setNidNumber(existingKyc.nidNumber || '');
      setNameBn(existingKyc.nameBn || customer.nameBn);
      setNameEn(existingKyc.nameEn || customer.nameEn);
      setFatherNameBn(existingKyc.fatherNameBn || '');
      setFatherNameEn(existingKyc.fatherNameEn || '');
      setMotherNameBn(existingKyc.motherNameBn || '');
      setMotherNameEn(existingKyc.motherNameEn || '');
      setPresentAddressBn(existingKyc.presentAddressBn || '');
      setPresentAddressEn(existingKyc.presentAddressEn || '');
      setPermanentAddressBn(existingKyc.permanentAddressBn || '');
      setPermanentAddressEn(existingKyc.permanentAddressEn || '');
      setMobile(existingKyc.mobile || customer.mobile);
      setEmail(existingKyc.email || customer.email || '');

      setNomineeNameBn(existingKyc.nomineeNameBn || '');
      setNomineeNameEn(existingKyc.nomineeNameEn || '');
      setNomineeFatherBn(existingKyc.nomineeFatherBn || '');
      setNomineeFatherEn(existingKyc.nomineeFatherEn || '');
      setNomineeMotherBn(existingKyc.nomineeMotherBn || '');
      setNomineeMotherEn(existingKyc.nomineeMotherEn || '');
      setNomineeMobile(existingKyc.nomineeMobile || '');
      setNomineeEmail(existingKyc.nomineeEmail || '');
      setNomineeAddressBn(existingKyc.nomineeAddressBn || '');
      setNomineeAddressEn(existingKyc.nomineeAddressEn || '');
      setNomineePhotoUrl(existingKyc.nomineePhotoUrl || '');
      setSignatureDataUrl(existingKyc.signatureDataUrl || '');
    } else {
      // Pre-fill from customer profile
      setPhotoUrl('');
      setNidNumber('');
      setNameBn(customer.nameBn);
      setNameEn(customer.nameEn);
      setFatherNameBn('');
      setFatherNameEn('');
      setMotherNameBn('');
      setMotherNameEn('');
      setPresentAddressBn('');
      setPresentAddressEn('');
      setPermanentAddressBn('');
      setPermanentAddressEn('');
      setMobile(customer.mobile);
      setEmail(customer.email || '');

      setNomineeNameBn('');
      setNomineeNameEn('');
      setNomineeFatherBn('');
      setNomineeFatherEn('');
      setNomineeMotherBn('');
      setNomineeMotherEn('');
      setNomineeMobile('');
      setNomineeEmail('');
      setNomineeAddressBn('');
      setNomineeAddressEn('');
      setNomineePhotoUrl('');
      setSignatureDataUrl('');
    }
  };

  // Canvas drawing handlers for signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        setSignatureDataUrl(canvas.toDataURL());
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureDataUrl('');
  };

  // Handle Photo File Upload mock (Converts to Data URL)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    if (!nidNumber || !nameBn || !fatherNameBn) {
      showToast(lang === 'bn' ? 'দয়া করে প্রয়োজনীয় তথ্য প্রদান করুন' : 'Please fill required fields', 'error');
      return;
    }

    saveKyc({
      customerId: editingTarget.customer.id,
      photoUrl,
      nidNumber,
      nameBn,
      nameEn,
      fatherNameBn,
      fatherNameEn,
      motherNameBn,
      motherNameEn,
      presentAddressBn,
      presentAddressEn,
      permanentAddressBn,
      permanentAddressEn,
      mobile,
      email,
      signatureDataUrl,
      nomineeNameBn,
      nomineeNameEn,
      nomineeFatherBn,
      nomineeFatherEn,
      nomineeMotherBn,
      nomineeMotherEn,
      nomineeMobile,
      nomineeEmail,
      nomineeAddressBn,
      nomineeAddressEn,
      nomineePhotoUrl,
      status: isCustomer ? 'pending' : 'approved', // Auto approve if admin/staff fills
    });

    setEditingTarget(null);
  };

  // Reject Modal Handler
  const handleConfirmReject = () => {
    if (!rejectingTarget) return;
    reviewKyc(rejectingTarget.id, 'rejected', rejectionReasonInput || 'কেওয়াইসি নথিপত্র অসম্পূর্ণ');
    setRejectingTarget(null);
    setRejectionReasonInput('');
  };

  // Export All KYC Records to Excel
  const handleExportKycExcel = () => {
    const exportData = filteredList.map(({ customer, kyc, status }) => {
      const branchObj = branches.find((b) => b.id === customer.branchId);
      return {
        'হিসাব নম্বর': customer.accountNo,
        'গ্রাহকের নাম (বাংলা)': customer.nameBn,
        'গ্রাহকের নাম (English)': customer.nameEn,
        'শাখা': branchObj?.nameBn || 'প্রধান শাখা',
        'মোবাইল নম্বর': customer.mobile,
        'NID নম্বর': kyc?.nidNumber || 'N/A',
        'পিতার নাম': kyc?.fatherNameBn || 'N/A',
        'মাতার নাম': kyc?.motherNameBn || 'N/A',
        'বর্তমান ঠিকানা': kyc?.presentAddressBn || 'N/A',
        'স্থায়ী ঠিকানা': kyc?.permanentAddressBn || 'N/A',
        'নমিনীর নাম': kyc?.nomineeNameBn || 'N/A',
        'নমিনীর মোবাইল': kyc?.nomineeMobile || 'N/A',
        'নমিনীর ঠিকানা': kyc?.nomineeAddressBn || 'N/A',
        'কেওয়াইসি স্ট্যাটাস': status === 'approved' ? 'অনুমোদিত' : status === 'pending' ? 'অপেক্ষমান' : 'বাকি',
      };
    });
    exportToExcel(exportData, `KYC_Customer_Forms_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? 'কেওয়াইসি (KYC) ফরম ব্যবস্থাপনা' : 'KYC Identification Management'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'গ্রাহকদের জাতীয় পরিচয়পত্র, ছবি, ডিজিটাল স্বাক্ষর ও নমিনী সংক্রান্ত সম্পূর্ণ রেকর্ড'
              : 'Complete repository of customer NID verification, photos, digital signature & nominee records'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportKycExcel}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সকল কেওয়াইসি এক্সপোর্ট (XLSX)' : 'Export Excel (.xlsx)'}</span>
          </button>

          {isCustomer && (
            <button
              onClick={() => {
                const myCust = (customers || []).find((c) => c.userId === currentUser.id) || (customers || [])[0];
                const myKyc = myCust ? (kycRecords || []).find((k) => k.customerId === myCust.id) : undefined;
                if (myCust) handleOpenEdit(myCust, myKyc);
              }}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'আমার কেওয়াইসি জমা দিন' : 'Submit My KYC'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setSelectedStatus('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'all'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold block opacity-80">মোট গ্রাহক সংখ্যা</span>
          <span className="text-2xl font-black mt-1 block">{totalCount}</span>
        </div>

        <div
          onClick={() => setSelectedStatus('approved')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'approved'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-emerald-600 hover:bg-emerald-50/50'
          }`}
        >
          <span className="text-[11px] font-bold block opacity-80">অনুমোদিত (Approved)</span>
          <span className="text-2xl font-black mt-1 block">{approvedCount}</span>
        </div>

        <div
          onClick={() => setSelectedStatus('pending')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'pending'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-[1.02]'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-amber-600 hover:bg-amber-50/50'
          }`}
        >
          <span className="text-[11px] font-bold block opacity-80">অপেক্ষমান (Pending)</span>
          <span className="text-2xl font-black mt-1 block">{pendingCount}</span>
        </div>

        <div
          onClick={() => setSelectedStatus('missing')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'missing'
              ? 'bg-sky-600 text-white border-sky-600 shadow-md scale-[1.02]'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-600 hover:bg-sky-50/50'
          }`}
        >
          <span className="text-[11px] font-bold block opacity-80">ফরম বাকি (Missing)</span>
          <span className="text-2xl font-black mt-1 block">{missingCount}</span>
        </div>

        <div
          onClick={() => setSelectedStatus('rejected')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'rejected'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-[1.02]'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-rose-600 hover:bg-rose-50/50'
          }`}
        >
          <span className="text-[11px] font-bold block opacity-80">বাতিলকৃত (Cancelled)</span>
          <span className="text-2xl font-black mt-1 block">{rejectedCount}</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'গ্রাহকের নাম, হিসাব নং, মোবাইল বা NID...'
                : 'Search by name, account no, mobile, NID...'
            }
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Branch Filter for Admin */}
          {isSuperAdmin && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Building2 className="w-4 h-4 text-slate-400" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="all">সকল ব্রাঞ্চ (All Branches)</option>
                {visibleBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nameBn}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {[
              { id: 'all', label: 'সকল' },
              { id: 'approved', label: 'অনুমোদিত' },
              { id: 'pending', label: 'অপেক্ষমান' },
              { id: 'missing', label: 'বাকি' },
              { id: 'rejected', label: 'বাতিল' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedStatus === st.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KYC Records List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase">
                <th className="p-4">ছবি ও নাম</th>
                <th className="p-4">হিসাব নম্বর ও শাখা</th>
                <th className="p-4">মোবাইল ও NID</th>
                <th className="p-4">নমিনী বিবরণ</th>
                <th className="p-4">কেওয়াইসি স্ট্যাটাস</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.map(({ customer, kyc, status }) => {
                const branchObj = branches.find((b) => b.id === customer.branchId);
                return (
                  <tr
                    key={customer.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Photo & Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {kyc?.photoUrl || customer.photoUrl ? (
                          <img
                            src={kyc?.photoUrl || customer.photoUrl}
                            alt={customer.nameBn}
                            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/30"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {customer.nameBn}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {customer.nameEn}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Account & Branch */}
                    <td className="p-4">
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 block text-xs">
                        {customer.accountNo}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        <span>{branchObj?.nameBn || 'প্রধান শাখা'}</span>
                      </span>
                    </td>

                    {/* Mobile & NID */}
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{customer.mobile}</span>
                      </p>
                      {kyc?.nidNumber ? (
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          NID: <strong className="text-slate-800 dark:text-slate-200">{kyc.nidNumber}</strong>
                        </p>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-semibold">NID জমা দেওয়া হয়নি</span>
                      )}
                    </td>

                    {/* Nominee */}
                    <td className="p-4">
                      {kyc?.nomineeNameBn ? (
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {kyc.nomineeNameBn}
                          </p>
                          <p className="text-[10px] text-slate-400">{kyc.nomineeMobile}</p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">নমিনী নেই</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {status === 'approved' && (
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1.5 w-max">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>অনুমোদিত</span>
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1.5 w-max">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>অপেক্ষমান</span>
                        </span>
                      )}
                      {status === 'missing' && (
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 flex items-center gap-1.5 w-max">
                          <AlertCircle className="w-3.5 h-3.5 text-sky-600" />
                          <span>কেওয়াইসি বাকি</span>
                        </span>
                      )}
                      {status === 'rejected' && (
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1.5 w-max">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>বাতিলকৃত</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Action */}
                        {kyc && (
                          <button
                            onClick={() => setViewingKyc({ kyc, customer })}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            title="কেওয়াইসি ফরম দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {/* Fill or Edit Action */}
                        <button
                          onClick={() => handleOpenEdit(customer, kyc)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer ${
                            status === 'missing'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {status === 'missing' ? (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>ফরম পূরণ</span>
                            </>
                          ) : (
                            <>
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>সম্পাদনা</span>
                            </>
                          )}
                        </button>

                        {/* Approve / Reject Actions for Admin/Staff */}
                        {!isCustomer && kyc && kyc.status === 'pending' && (
                          <>
                            <button
                              onClick={() => reviewKyc(kyc.id, 'approved')}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer"
                              title="অনুমোদন করুন"
                            >
                              অনুমোদন
                            </button>

                            <button
                              onClick={() => setRejectingTarget(kyc)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs cursor-pointer"
                              title="বাতিল করুন"
                            >
                              বাতিল
                            </button>
                          </>
                        )}

                        {/* Delete Action for Admin/Staff */}
                        {!isCustomer && kyc && (
                          <button
                            onClick={() => deleteKyc(kyc.id)}
                            className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-600 cursor-pointer"
                            title="কেওয়াইসি রেকর্ড মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                    কোনো কেওয়াইসি রেকর্ড বা গ্রাহক পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT KYC FORM MODAL */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                  <span>কেওয়াইসি (KYC) ফরম পূরণ ও সম্পাদনা</span>
                </h3>
                <p className="text-xs text-slate-500">
                  গ্রাহক: <strong className="text-slate-800 dark:text-slate-200">{editingTarget.customer.nameBn}</strong> (হিসাব: {editingTarget.customer.accountNo})
                </p>
              </div>

              <button
                onClick={() => setEditingTarget(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
              {/* Section 1: Customer Profile & Photo */}
              <div className="space-y-3">
                <h4 className="font-black text-sm text-emerald-700 dark:text-emerald-400 border-b border-emerald-100 dark:border-emerald-950 pb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>১. গ্রাহকের ব্যক্তিগত পরিচয় ও জাতীয় পরিচয়পত্র (NID)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Photo Preview & Upload */}
                  <div className="sm:col-span-1 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Customer Photo"
                        className="w-24 h-28 rounded-xl object-cover border-2 border-emerald-500 shadow-xs mb-2"
                      />
                    ) : (
                      <div className="w-24 h-28 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 mb-2">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                    <label className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow cursor-pointer flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ছবি আপলোড</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setPhotoUrl)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Dual Names & NID */}
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        স্মার্ট / জাতীয় পরিচয়পত্র নম্বর (Smart NID)*
                      </label>
                      <input
                        type="text"
                        value={nidNumber}
                        onChange={(e) => setNidNumber(e.target.value)}
                        placeholder="e.g. 1982736451928"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          গ্রাহকের নাম (বাংলায়)*
                        </label>
                        <input
                          type="text"
                          value={nameBn}
                          onChange={(e) => setNameBn(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          গ্রাহকের নাম (English)*
                        </label>
                        <input
                          type="text"
                          value={nameEn}
                          onChange={(e) => setNameEn(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parents Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      পিতার নাম (বাংলায়)*
                    </label>
                    <input
                      type="text"
                      value={fatherNameBn}
                      onChange={(e) => setFatherNameBn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      পিতার নাম (English)
                    </label>
                    <input
                      type="text"
                      value={fatherNameEn}
                      onChange={(e) => setFatherNameEn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      মাতার নাম (বাংলায়)*
                    </label>
                    <input
                      type="text"
                      value={motherNameBn}
                      onChange={(e) => setMotherNameBn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      মাতার নাম (English)
                    </label>
                    <input
                      type="text"
                      value={motherNameEn}
                      onChange={(e) => setMotherNameEn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      বর্তমান ঠিকানা (বাংলায়)
                    </label>
                    <textarea
                      value={presentAddressBn}
                      onChange={(e) => setPresentAddressBn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-16 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      স্থায়ী ঠিকানা (বাংলায়)
                    </label>
                    <textarea
                      value={permanentAddressBn}
                      onChange={(e) => setPermanentAddressBn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-16 outline-none"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      মোবাইল নম্বর*
                    </label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ইমেইল এড্রেস
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Digital Signature Pad */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-sm text-emerald-700 dark:text-emerald-400 border-b border-emerald-100 dark:border-emerald-950 pb-1 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4" />
                  <span>২. ডিজিটাল স্বাক্ষর (Digital Signature Pad)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <p className="text-[11px] text-slate-500 mb-2">
                      নিচের ঘরে মাউস বা টাচ প্যাড দিয়ে আপনার স্বাক্ষর আঁকুন:
                    </p>
                    <div className="relative border-2 border-dashed border-emerald-400 rounded-2xl bg-white dark:bg-slate-950 overflow-hidden shadow-inner">
                      <canvas
                        ref={canvasRef}
                        width={300}
                        height={100}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-24 cursor-crosshair touch-none"
                      />
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 text-slate-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>মুছুন</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-500 mb-2">অথবা স্বাক্ষরের স্ক্যান কপি আপলোড করুন:</p>
                    {signatureDataUrl ? (
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <img
                          src={signatureDataUrl}
                          alt="Signature Preview"
                          className="h-12 object-contain"
                        />
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded">
                          সংরক্ষিত
                        </span>
                      </div>
                    ) : (
                      <label className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <Upload className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          স্বাক্ষরের ছবি নির্বাচন করুন
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setSignatureDataUrl)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Nominee Information */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-sm text-emerald-700 dark:text-emerald-400 border-b border-emerald-100 dark:border-emerald-950 pb-1 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>৩. নমিনীর তথ্য বিবরণী (Nominee Information)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Nominee Photo */}
                  <div className="sm:col-span-1 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {nomineePhotoUrl ? (
                      <img
                        src={nomineePhotoUrl}
                        alt="Nominee Photo"
                        className="w-20 h-24 rounded-xl object-cover border-2 border-emerald-500 shadow-xs mb-2"
                      />
                    ) : (
                      <div className="w-20 h-24 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 mb-2">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <label className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shadow cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>নমিনীর ছবি</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setNomineePhotoUrl)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Nominee Details */}
                  <div className="sm:col-span-2 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          নমিনীর নাম (বাংলায়)
                        </label>
                        <input
                          type="text"
                          value={nomineeNameBn}
                          onChange={(e) => setNomineeNameBn(e.target.value)}
                          placeholder="e.g. রেহানা পারভীন (স্ত্রী)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          নমিনীর নাম (English)
                        </label>
                        <input
                          type="text"
                          value={nomineeNameEn}
                          onChange={(e) => setNomineeNameEn(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          নমিনীর পিতা/স্বামীর নাম
                        </label>
                        <input
                          type="text"
                          value={nomineeFatherBn}
                          onChange={(e) => setNomineeFatherBn(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          নমিনীর মোবাইল নম্বর
                        </label>
                        <input
                          type="text"
                          value={nomineeMobile}
                          onChange={(e) => setNomineeMobile(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        নমিনীর ঠিকানা
                      </label>
                      <input
                        type="text"
                        value={nomineeAddressBn}
                        onChange={(e) => setNomineeAddressBn(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>কেওয়াইসি তথ্য সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PRINTABLE KYC CARD MODAL */}
      {viewingKyc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 print:hidden">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>অফিসিয়াল কেওয়াইসি (KYC) প্রোফাইল কার্ড</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>

                <button
                  onClick={() => setViewingKyc(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs" id="printable-kyc-card">
              {/* Document Header */}
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  সমৃদ্ধি সঞ্চয় ও ঋণদান সমবায় সমিতি লিঃ
                </h2>
                <p className="text-[11px] text-slate-500">গ্রাহক পরিচয়পত্র ও কেওয়াইসি ভেরিফিকেশন ফর্ম</p>
              </div>

              {/* Photos & Main Profile */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-3">
                  {viewingKyc.kyc?.photoUrl || viewingKyc.customer.photoUrl ? (
                    <img
                      src={viewingKyc.kyc?.photoUrl || viewingKyc.customer.photoUrl}
                      alt="Customer"
                      className="w-16 h-20 rounded-xl object-cover border-2 border-emerald-600 shadow"
                    />
                  ) : (
                    <div className="w-16 h-20 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {viewingKyc.kyc?.nameBn || viewingKyc.customer.nameBn}
                    </h3>
                    <p className="text-slate-500 font-medium">{viewingKyc.kyc?.nameEn || viewingKyc.customer.nameEn}</p>
                    <p className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm mt-1">
                      হিসাব নং: {viewingKyc.customer.accountNo}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black inline-block mb-1 ${
                      viewingKyc.kyc?.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {(viewingKyc.kyc?.status || 'Missing').toUpperCase()}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    আপডেট তারিখ: {viewingKyc.kyc?.updatedAt || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Detailed Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-bold">জাতীয় পরিচয়পত্র নম্বর (NID):</span>
                  <p className="font-mono font-black text-slate-900 dark:text-white text-sm">
                    {viewingKyc.kyc?.nidNumber || 'তথ্য নেই'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-bold">মোবাইল নম্বর:</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {viewingKyc.kyc?.mobile || viewingKyc.customer.mobile}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-bold">পিতার নাম:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingKyc.kyc?.fatherNameBn || 'তথ্য নেই'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-bold">মাতার নাম:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingKyc.kyc?.motherNameBn || 'তথ্য নেই'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 col-span-2">
                  <span className="text-slate-400 block font-bold">বর্তমান ঠিকানা:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewingKyc.kyc?.presentAddressBn || 'তথ্য নেই'}
                  </p>
                </div>
              </div>

              {/* Nominee & Signature Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                {/* Nominee Card */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
                  {viewingKyc.kyc?.nomineePhotoUrl ? (
                    <img
                      src={viewingKyc.kyc.nomineePhotoUrl}
                      alt="Nominee"
                      className="w-12 h-14 rounded-lg object-cover border border-amber-400"
                    />
                  ) : (
                    <div className="w-12 h-14 rounded-lg bg-amber-200/50 dark:bg-amber-900/50 flex items-center justify-center text-amber-700">
                      <User className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-400 block uppercase">
                      মনোনীত নমিনী (Nominee)
                    </span>
                    <p className="font-extrabold text-slate-900 dark:text-white">
                      {viewingKyc.kyc?.nomineeNameBn || 'নমিনী যুক্ত করা হয়নি'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {viewingKyc.kyc?.nomineeMobile}
                    </p>
                  </div>
                </div>

                {/* Digital Signature */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    গ্রাহকের ডিজিটাল স্বাক্ষর
                  </span>
                  {viewingKyc.kyc?.signatureDataUrl ? (
                    <img
                      src={viewingKyc.kyc.signatureDataUrl}
                      alt="Signature"
                      className="h-10 object-contain"
                    />
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">স্বাক্ষর সংরক্ষিত নেই</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {rejectingTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-extrabold text-base text-rose-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>কেওয়াইসি ফরম বাতিলকরণ</span>
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              আপনি কি নিশ্চিত যে এই কেওয়াইসি ফরমটি বাতিল করতে চান? বাতিলের সুনির্দিষ্ট কারণ লিখে দিন:
            </p>

            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. এনআইডি কার্ডের ছবি অস্পষ্ট / তথ্যের গরমিল..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none h-20"
              required
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                ফিরে যান
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer"
              >
                বাতিল নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

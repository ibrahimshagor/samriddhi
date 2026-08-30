import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { formatBDT, exportToExcel } from '../utils/formatters';
import {
  UserCheck,
  Search,
  Download,
  PlusCircle,
  MinusCircle,
  Eye,
  FileCheck2,
  Send,
  Building2,
  Phone,
  Wallet,
  CheckCircle,
  XCircle,
  Trash2,
  Edit3,
  ArrowRightLeft,
  MapPin,
  Briefcase,
  User,
  Shield,
  AlertCircle,
} from 'lucide-react';

export const CustomerDirectory: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate = (_page: string) => {} }) => {
  const {
    currentUser,
    customers,
    branches,
    packages,
    paymentChannels,
    adjustCustomerBalance,
    updateCustomer,
    deleteCustomer,
    transferCustomerBranch,
    sendCustomerMessage,
    lang,
    activeBranchId,
    setActiveBranchId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected customer for view modal
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  // Edit Customer Modal State
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Customer>>({});

  // Transfer Branch Modal State
  const [transferCust, setTransferCust] = useState<Customer | null>(null);
  const [targetBranchId, setTargetBranchId] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('');

  // Balance Adjustment Modal State
  const [adjCustomer, setAdjCustomer] = useState<Customer | null>(null);
  const [adjType, setAdjType] = useState<'add' | 'deduct'>('add');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjPackageId, setAdjPackageId] = useState('general');
  const [adjChannelId, setAdjChannelId] = useState('cash');
  const [adjDate, setAdjDate] = useState(new Date().toISOString().split('T')[0]);
  const [adjAccountNo, setAdjAccountNo] = useState('');
  const [adjNote, setAdjNote] = useState('');

  // SMS Modal State
  const [smsCustomer, setSmsCustomer] = useState<Customer | null>(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [smsSentNotice, setSmsSentNotice] = useState(false);

  if (!currentUser) return null;
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isBranchManager = currentUser.role === 'branch_manager';

  // Manager assigned branches
  const userAssignedBranchIds =
    isSuperAdmin
      ? branches.map((b) => b.id)
      : currentUser.assignedBranchIds && currentUser.assignedBranchIds.length > 0
      ? currentUser.assignedBranchIds
      : currentUser.branchId
      ? [currentUser.branchId]
      : [];

  const accessibleBranches = branches.filter((b) => userAssignedBranchIds.includes(b.id));

  // Scoped customers based on role & assigned branches
  const safeCustomers = customers || [];
  const scopedCustomers = isSuperAdmin
    ? safeCustomers
    : safeCustomers.filter((c) => userAssignedBranchIds.includes(c.branchId));

  const filteredCustomers = scopedCustomers.filter((c) => {
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (c.nameBn || '').toLowerCase().includes(query) ||
      (c.nameEn || '').toLowerCase().includes(query) ||
      (c.mobile || '').includes(searchQuery) ||
      (c.accountNo || '').includes(searchQuery) ||
      (c.membershipId || '').includes(searchQuery) ||
      (c.nidNumber || '').includes(searchQuery) ||
      (c.fatherOrSpouseName || '').toLowerCase().includes(query);

    const matchesBranch = branchFilter === 'all' || c.branchId === branchFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const handleExportExcel = () => {
    const exportData = filteredCustomers.map((c) => {
      const bObj = branches.find((b) => b.id === c.branchId);
      return {
        'Membership ID': c.membershipId,
        'Account No': c.accountNo,
        'Name (Bangla)': c.nameBn,
        'Name (English)': c.nameEn,
        Mobile: c.mobile,
        Email: c.email || '',
        NID: c.nidNumber || '',
        'Father/Spouse Name': c.fatherOrSpouseName || '',
        'Mother Name': c.motherName || '',
        'Present Address': c.presentAddress || '',
        'Permanent Address': c.permanentAddress || '',
        Occupation: c.occupation || '',
        Branch: lang === 'bn' ? bObj?.nameBn || c.branchId : bObj?.nameEn || c.branchId,
        'General Savings (BDT)': c.generalSavingsBalance,
        'Total Deposit (BDT)': c.totalDeposit,
        'Total Withdrawal (BDT)': c.totalWithdrawal,
        Status: c.status,
        'KYC Status': c.kycStatus,
      };
    });
    exportToExcel(exportData, `Samriddhi_Customer_List_${new Date().toISOString().split('T')[0]}`);
  };

  const handleApplyBalanceAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjCustomer || !adjAmount) return;
    const num = parseFloat(adjAmount);
    if (isNaN(num) || num <= 0) return;

    adjustCustomerBalance(adjCustomer.id, num, adjType, adjNote || 'Manual Balance Adjustment');
    setAdjCustomer(null);
    setAdjAmount('');
    setAdjNote('');
  };

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (smsCustomer && smsMessage.trim()) {
      sendCustomerMessage(smsCustomer.id, smsMessage.trim());
    }
    setSmsSentNotice(true);
    setTimeout(() => {
      setSmsSentNotice(false);
      setSmsCustomer(null);
      setSmsMessage('');
    }, 1500);
  };

  // Open Edit Customer Modal
  const openEditModal = (cust: Customer) => {
    setEditCustomer(cust);
    setEditFormData({
      ...cust,
    });
  };

  const handleSaveCustomerEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer) return;
    const updated: Customer = {
      ...editCustomer,
      nameBn: editFormData.nameBn || editCustomer.nameBn,
      nameEn: editFormData.nameEn || editCustomer.nameEn,
      mobile: editFormData.mobile || editCustomer.mobile,
      email: editFormData.email || '',
      nidNumber: editFormData.nidNumber || '',
      fatherOrSpouseName: editFormData.fatherOrSpouseName || '',
      motherName: editFormData.motherName || '',
      presentAddress: editFormData.presentAddress || '',
      permanentAddress: editFormData.permanentAddress || '',
      occupation: editFormData.occupation || '',
      status: (editFormData.status as any) || editCustomer.status,
      kycStatus: (editFormData.kycStatus as any) || editCustomer.kycStatus,
    };

    updateCustomer(updated);
    setEditCustomer(null);
    if (viewCustomer && viewCustomer.id === updated.id) {
      setViewCustomer(updated);
    }
  };

  // Open Branch Transfer Modal
  const openTransferModal = (cust: Customer) => {
    setTransferCust(cust);
    // Default to first available branch that isn't the current one
    const diffBranch = branches.find((b) => b.id !== cust.branchId);
    setTargetBranchId(diffBranch ? diffBranch.id : '');
    setTransferReason('');
  };

  const handleConfirmBranchTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferCust || !targetBranchId) return;
    transferCustomerBranch(transferCust.id, targetBranchId, transferReason);
    setTransferCust(null);
    setTransferReason('');
    if (viewCustomer && viewCustomer.id === transferCust.id) {
      setViewCustomer({ ...viewCustomer, branchId: targetBranchId });
    }
  };

  // Permission check for edit / delete
  const canEditOrDelete = (cust: Customer) => {
    if (isSuperAdmin) return true;
    if (isBranchManager && userAssignedBranchIds.includes(cust.branchId)) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              <span>{lang === 'bn' ? '৬. কাস্টমার ডাইরেক্টরি' : '6. Customer Directory'}</span>
            </h2>
            {isBranchManager && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold">
                {lang === 'bn' ? 'ম্যানেজার এক্সেস' : 'Manager Access'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'সম্মানিত সদস্যদের তথ্য সম্পাদনা, শাখা স্থানান্তর, ব্যালেন্স সমন্বয় (+/-), কেওয়াইসি স্ট্যাটাস ও এক্সেল ডাউনলোড'
              : 'Edit member profile, transfer branch, balance adjustments (+/-), KYC status & Excel exports'}
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0 transition-transform active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>{lang === 'bn' ? 'এক্সেল ডাউনলোড করুন (.XLSX)' : 'Export Excel (.XLSX)'}</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'নাম, মোবাইল, এনআইডি, হিসাব নং বা সদস্য আইডি দিয়ে খুঁজুন...' : 'Search by name, mobile, NID, account no, ID...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Branch Filter dropdown */}
        {(isSuperAdmin || accessibleBranches.length > 1) && (
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">
              {isSuperAdmin
                ? lang === 'bn'
                  ? 'সকল শাখা (All Branches)'
                  : 'All Branches'
                : lang === 'bn'
                ? 'আমার সকল দায়িত্বপ্রাপ্ত শাখা'
                : 'All My Assigned Branches'}
            </option>
            {accessibleBranches.map((b) => (
              <option key={b.id} value={b.id}>
                {lang === 'bn' ? b.nameBn : b.nameEn} ({b.code})
              </option>
            ))}
          </select>
        )}

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
        >
          <option value="all">{lang === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
          <option value="active">{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
          <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
        </select>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">{lang === 'bn' ? 'সদস্য নাম ও আইডি' : 'Member & ID'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'হিসাব নম্বর & শাখা' : 'Account & Branch'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'যোগাযোগ ও এনআইডি' : 'Contact & NID'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'সাধারণ সঞ্চয় ব্যালেন্স' : 'General Savings'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'কেওয়াইসি' : 'KYC'}</th>
                <th className="p-3.5 text-right">{lang === 'bn' ? 'অ্যাকশনস' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    {lang === 'bn' ? 'কোনো গ্রাহক খুঁজে পাওয়া যায়নি' : 'No customers found'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const branchObj = branches.find((b) => b.id === cust.branchId);
                  const hasPermission = canEditOrDelete(cust);

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs shrink-0">
                            {(cust.nameEn || 'C').charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">
                              {lang === 'bn' ? cust.nameBn : cust.nameEn}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-mono font-bold">{cust.membershipId}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <p className="font-mono font-bold text-slate-900 dark:text-white">{cust.accountNo}</p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {lang === 'bn' ? branchObj?.nameBn || cust.branchId : branchObj?.nameEn || cust.branchId}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{cust.mobile}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{cust.nidNumber ? `NID: ${cust.nidNumber}` : 'NID: -'}</p>
                      </td>

                      <td className="p-3.5">
                        <p className="font-black text-emerald-600 dark:text-emerald-400">
                          {formatBDT(cust.generalSavingsBalance, lang)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {lang === 'bn' ? 'মোট জমা:' : 'Deposit:'} {formatBDT(cust.totalDeposit, lang)}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                            cust.kycStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : cust.kycStatus === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {cust.kycStatus}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Edit Customer Info (Super Admin + Manager) */}
                          {hasPermission && (
                            <button
                              onClick={() => openEditModal(cust)}
                              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 transition-colors cursor-pointer"
                              title={lang === 'bn' ? 'গ্রাহকের তথ্য এডিট করুন' : 'Edit Customer Information'}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Branch Transfer (Super Admin + Manager) */}
                          {hasPermission && (
                            <button
                              onClick={() => openTransferModal(cust)}
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 transition-colors cursor-pointer"
                              title={lang === 'bn' ? 'শাখা স্থানান্তর করুন (Transfer Branch)' : 'Transfer Branch'}
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>
                          )}

                          {/* Manual Balance +/- */}
                          <button
                            onClick={() => {
                              setAdjCustomer(cust);
                              setAdjType('add');
                              setAdjAccountNo(cust.mobile);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 transition-colors cursor-pointer"
                            title={lang === 'bn' ? 'ব্যালেন্স যোগ করুন (+)' : 'Add Balance (+)'}
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setAdjCustomer(cust);
                              setAdjType('deduct');
                              setAdjAccountNo(cust.mobile);
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 transition-colors cursor-pointer"
                            title={lang === 'bn' ? 'ব্যালেন্স কর্তন করুন (-)' : 'Subtract Balance (-)'}
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>

                          {/* View details */}
                          <button
                            onClick={() => setViewCustomer(cust)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                            title={lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Profile'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Send SMS */}
                          <button
                            onClick={() => setSmsCustomer(cust)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 transition-colors cursor-pointer"
                            title={lang === 'bn' ? 'মেসেজ পাঠান' : 'Send SMS'}
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {/* Delete Customer (Super Admin + Manager for their branch) */}
                          {hasPermission && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    lang === 'bn'
                                      ? `আপনি কি নিশ্চিত যে গ্রাহক "${cust.nameBn}" (${cust.accountNo}) এর তথ্য মুছে ফেলতে চান?`
                                      : `Are you sure you want to delete customer "${cust.nameEn}" (${cust.accountNo})?`
                                  )
                                ) {
                                  deleteCustomer(cust.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 transition-colors cursor-pointer"
                              title={lang === 'bn' ? 'কাস্টমার মুছুন' : 'Delete Customer'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {editCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <span>{lang === 'bn' ? 'গ্রাহকের তথ্য সম্পাদনা (Edit Customer)' : 'Edit Customer Information'}</span>
              </h3>
              <button
                onClick={() => setEditCustomer(null)}
                className="text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomerEdit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'গ্রাহকের নাম (বাংলা) *' : 'Customer Name (Bangla) *'}
                  </label>
                  <input
                    type="text"
                    value={editFormData.nameBn || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nameBn: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'গ্রাহকের নাম (ইংরেজি) *' : 'Customer Name (English) *'}
                  </label>
                  <input
                    type="text"
                    value={editFormData.nameEn || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nameEn: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="text"
                    value={editFormData.mobile || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'জাতীয় পরিচয়পত্র (NID) নম্বর' : 'NID / Smart Card Number'}
                  </label>
                  <input
                    type="text"
                    value={editFormData.nidNumber || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nidNumber: e.target.value })}
                    placeholder="e.g. 19882691234567890"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'পেশা (Occupation)' : 'Occupation'}
                  </label>
                  <input
                    type="text"
                    value={editFormData.occupation || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                    placeholder="e.g. ব্যাবসায়ী / চাকুরীজীবী"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'পিতা / স্বামীর নাম' : 'Father / Spouse Name'}
                  </label>
                  <input
                    type="text"
                    value={editFormData.fatherOrSpouseName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, fatherOrSpouseName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'মাতার নাম' : "Mother's Name"}
                  </label>
                  <input
                    type="text"
                    value={editFormData.motherName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, motherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'বর্তমান ঠিকানা' : 'Present Address'}
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.presentAddress || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, presentAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'স্থায়ী ঠিকানা' : 'Permanent Address'}
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.permanentAddress || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, permanentAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'অ্যাকাউন্ট স্ট্যাটাস' : 'Account Status'}
                  </label>
                  <select
                    value={editFormData.status || 'active'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  >
                    <option value="active">{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
                    <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'কেওয়াইসি স্ট্যাটাস' : 'KYC Verification Status'}
                  </label>
                  <select
                    value={editFormData.kycStatus || 'pending'}
                    onChange={(e) => setEditFormData({ ...editFormData, kycStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  >
                    <option value="approved">{lang === 'bn' ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
                    <option value="pending">{lang === 'bn' ? 'অপেক্ষমান (Pending)' : 'Pending'}</option>
                    <option value="rejected">{lang === 'bn' ? 'বাতিল (Rejected)' : 'Rejected'}</option>
                    <option value="not_submitted">{lang === 'bn' ? 'জমা দেওয়া হয়নি (Not Submitted)' : 'Not Submitted'}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditCustomer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  {lang === 'bn' ? 'তথ্য সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Customer Branch Modal */}
      {transferCust && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-600" />
                <span>{lang === 'bn' ? 'গ্রাহক শাখা স্থানান্তর (Branch Transfer)' : 'Transfer Customer Branch'}</span>
              </h3>
              <button
                onClick={() => setTransferCust(null)}
                className="text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmBranchTransfer} className="space-y-4 mt-4 text-xs">
              <div className="bg-amber-50 dark:bg-amber-950/50 p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-800/40">
                <p className="text-slate-800 dark:text-slate-200 font-bold">
                  {lang === 'bn' ? 'গ্রাহক:' : 'Customer:'} <span className="text-emerald-700 dark:text-emerald-400">{transferCust.nameBn}</span> ({transferCust.accountNo})
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  {lang === 'bn' ? 'বর্তমান শাখা:' : 'Current Branch:'}{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {branches.find((b) => b.id === transferCust.branchId)?.nameBn || transferCust.branchId}
                  </strong>
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'নতুন গন্তব্য শাখা নির্বাচন করুন *' : 'Select Target Destination Branch *'}
                </label>
                <select
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">{lang === 'bn' ? '-- নতুন শাখা নির্বাচন করুন --' : '-- Select Branch --'}</option>
                  {branches
                    .filter((b) => b.id !== transferCust.branchId)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {lang === 'bn' ? b.nameBn : b.nameEn} ({b.code}) - {b.address}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'স্থানান্তরের কারণ / বিবরণ' : 'Transfer Reason / Notes'}
                </label>
                <textarea
                  rows={3}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: গ্রাহক বাসা পরিবর্তন করে নতুন এলাকায় স্থানান্তর হয়েছেন...' : 'e.g. Customer relocated residence...'}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTransferCust(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!targetBranchId}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer disabled:opacity-50 transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'শাখা ট্রান্সফার সম্পন্ন করুন' : 'Confirm Transfer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Balance Adjustment Modal */}
      {adjCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'bn' ? 'ব্যালেন্স ম্যানুয়াল সমন্বয়' : 'Manual Balance Adjustment'}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              গ্রাহক: <strong className="text-slate-900 dark:text-white">{adjCustomer.nameBn}</strong> ({adjCustomer.accountNo})
            </p>

            <form onSubmit={handleApplyBalanceAdjustment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'সমন্বয়ের ধরন' : 'Adjustment Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjType('add')}
                    className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer ${
                      adjType === 'add'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'টাকা যোগ (+)' : 'Add (+)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjType('deduct')}
                    className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer ${
                      adjType === 'deduct'
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'টাকা কর্তন (-)' : 'Subtract (-)'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'প্যাকেজ/স্কিম নির্বাচন' : 'Package/Scheme'}
                </label>
                <select
                  value={adjPackageId}
                  onChange={(e) => setAdjPackageId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="general">সাধারণ সঞ্চয় হিসাব (General Savings)</option>
                  {(packages || []).map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.titleBn} ({pkg.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Channel'}
                  </label>
                  <select
                    value={adjChannelId}
                    onChange={(e) => setAdjChannelId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold text-slate-800 dark:text-slate-200"
                  >
                    {(paymentChannels || []).map((chan) => (
                      <option key={chan.id} value={chan.id}>
                        {chan.nameBn} ({chan.type.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'লেনদেনের তারিখ' : 'Payment Date'}
                  </label>
                  <input
                    type="date"
                    value={adjDate}
                    onChange={(e) => setAdjDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'উৎস/প্রাপক অ্যাকাউন্ট / ফোন নম্বর' : 'Source/Destination Account No.'}
                </label>
                <input
                  type="text"
                  value={adjAccountNo}
                  onChange={(e) => setAdjAccountNo(e.target.value)}
                  placeholder="e.g. 01712345678 or Bank A/C"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold outline-none text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'টাকার পরিমাণ (BDT)' : 'Amount (BDT)'}
                </label>
                <input
                  type="number"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold text-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'কারণ / নোট' : 'Note / Reference'}
                </label>
                <input
                  type="text"
                  value={adjNote}
                  onChange={(e) => setAdjNote(e.target.value)}
                  placeholder="e.g. Cash Deposit Slip #1204"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAdjCustomer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  {lang === 'bn' ? 'ব্যালেন্স আপডেট করুন' : 'Update Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send SMS Modal */}
      {smsCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'bn' ? 'কাস্টমারকে মেসেজ পাঠান' : 'Send SMS Notification'}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              প্রাপক: <strong>{smsCustomer.nameBn}</strong> ({smsCustomer.mobile})
            </p>

            {smsSentNotice ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-center text-xs">
                ✅ মেসেজ সফলভাবে পাঠানো হয়েছে! (SMS Sent Successfully)
              </div>
            ) : (
              <form onSubmit={handleSendSms} className="space-y-3">
                <textarea
                  rows={4}
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="আপনার কিস্তি বা সঞ্চয়ের আপডেট সংক্রান্ত মেসেজ লিখুন..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none text-slate-800 dark:text-slate-200"
                  required
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSmsCustomer(null)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    {lang === 'bn' ? 'পাঠিয়ে দিন' : 'Send SMS'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Customer Full View Modal */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {lang === 'bn' ? 'কাস্টমার পূর্ণাঙ্গ প্রোফাইল' : 'Customer Full Profile'}
              </h3>
              <button
                onClick={() => setViewCustomer(null)}
                className="text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/40">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
                  {(viewCustomer.nameEn || 'C').charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{viewCustomer.nameBn}</h4>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{viewCustomer.nameEn}</p>
                  <p className="text-xs font-mono font-bold text-emerald-600 mt-0.5">ID: {viewCustomer.membershipId}</p>
                </div>
                {canEditOrDelete(viewCustomer) && (
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        const target = viewCustomer;
                        setViewCustomer(null);
                        openEditModal(target);
                      }}
                      className="p-2 rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
                    </button>
                    <button
                      onClick={() => {
                        const target = viewCustomer;
                        setViewCustomer(null);
                        openTransferModal(target);
                      }}
                      className="p-2 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'ট্রান্সফার' : 'Transfer'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'হিসাব নম্বর:' : 'Account No:'}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{viewCustomer.accountNo}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'শাখা:' : 'Branch:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {branches.find((b) => b.id === viewCustomer.branchId)?.nameBn || viewCustomer.branchId}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewCustomer.mobile}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'ইমেইল:' : 'Email:'}</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate block">
                    {viewCustomer.email || '-'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'এনআইডি নম্বর:' : 'NID:'}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {viewCustomer.nidNumber || '-'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'পেশা:' : 'Occupation:'}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {viewCustomer.occupation || '-'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'পিতা/স্বামীর নাম:' : 'Father/Spouse:'}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {viewCustomer.fatherOrSpouseName || '-'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'মাতার নাম:' : 'Mother:'}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {viewCustomer.motherName || '-'}
                  </span>
                </div>

                <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'বর্তমান ঠিকানা:' : 'Present Address:'}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {viewCustomer.presentAddress || '-'}
                  </span>
                </div>

                <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'স্থায়ী ঠিকানা:' : 'Permanent Address:'}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {viewCustomer.permanentAddress || '-'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'সাধারণ সঞ্চয় ব্যালেন্স:' : 'Savings Balance:'}</span>
                  <span className="font-black text-emerald-600">{formatBDT(viewCustomer.generalSavingsBalance, lang)}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'মোট জমা ও উত্তোলন:' : 'Deposit & Withdraw:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatBDT(viewCustomer.totalDeposit, lang)} / {formatBDT(viewCustomer.totalWithdrawal, lang)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setViewCustomer(null);
                    onNavigate('kyc_form');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'কেওয়াইসি ফর্ম বিস্তারিত দেখুন' : 'View KYC Form'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


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
} from 'lucide-react';

export const CustomerDirectory: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate = (_page: string) => {} }) => {
  const {
    currentUser,
    customers,
    branches,
    schemePackages,
    paymentChannels,
    updateCustomerBalance,
    deleteCustomer,
    sendCustomerMessage,
    lang,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected customer for modal
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  // Balance Adjustment Modal State
  const [adjCustomer, setAdjCustomer] = useState<Customer | null>(null);
  const [adjType, setAdjType] = useState<'add' | 'subtract'>('add');
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

  // Filter scoped customers
  const safeCustomers = customers || [];
  const scopedCustomers = isSuperAdmin
    ? safeCustomers
    : safeCustomers.filter((c) => c.branchId === currentUser.branchId);

  const filteredCustomers = scopedCustomers.filter((c) => {
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (c.nameBn || '').toLowerCase().includes(query) ||
      (c.nameEn || '').toLowerCase().includes(query) ||
      (c.mobile || '').includes(searchQuery) ||
      (c.accountNo || '').includes(searchQuery) ||
      (c.membershipId || '').includes(searchQuery);
    const matchesBranch = branchFilter === 'all' || c.branchId === branchFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const handleExportExcel = () => {
    const exportData = filteredCustomers.map((c) => ({
      'Membership ID': c.membershipId,
      'Account No': c.accountNo,
      'Name (Bangla)': c.nameBn,
      'Name (English)': c.nameEn,
      Mobile: c.mobile,
      NID: c.nidNumber,
      'General Savings (BDT)': c.generalSavingsBalance,
      'Total Deposit (BDT)': c.totalDeposit,
      Status: c.status,
      'KYC Status': c.kycStatus,
    }));
    exportToExcel(exportData, `Samriddhi_Customer_List_${new Date().toISOString().split('T')[0]}`);
  };

  const handleApplyBalanceAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjCustomer || !adjAmount) return;
    const num = parseFloat(adjAmount);
    if (isNaN(num) || num <= 0) return;

    updateCustomerBalance(adjCustomer.id, num, adjType, adjNote || 'Manual Balance Adjustment');
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

  return (
    <div className="space-y-6">
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '৬. কাস্টমার ডাইরেক্টরি' : '6. Customer Directory'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'সম্মানিত সদস্যদের তথ্য, ব্যালেন্স সমন্বয় (+/-), কেওয়াইসি স্ট্যাটাস ও এক্সেল ডাউনলোড'
              : 'View member directory, balance adjustments (+/-), KYC status & Excel exports'}
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{lang === 'bn' ? 'এক্সেল ডাউনলোড করুন (.XLSX)' : 'Export Excel (.XLSX)'}</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'নাম, মোবাইল, হিসাব নং বা সদস্য আইডি দিয়ে খুঁজুন...' : 'Search by name, mobile, account no, ID...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {isSuperAdmin && (
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
          >
            <option value="all">{lang === 'bn' ? 'সকল শাখা' : 'All Branches'}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {lang === 'bn' ? b.nameBn : b.nameEn}
              </option>
            ))}
          </select>
        )}

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
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
                <th className="p-3.5">{lang === 'bn' ? 'হিসাব নম্বর & মোবাইল' : 'Account & Mobile'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'সাধারণ সঞ্চয় ব্যালেন্স' : 'General Savings'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'কেওয়াইসি' : 'KYC Status'}</th>
                <th className="p-3.5 text-right">{lang === 'bn' ? 'অ্যাকশনস' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.map((cust) => {
                const branchObj = branches.find((b) => b.id === cust.branchId);
                return (
                  <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs shrink-0">
                          {cust.nameEn.charAt(0)}
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
                      <p className="text-[11px] text-slate-500">{cust.mobile}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="font-black text-emerald-600 dark:text-emerald-400">
                        {formatBDT(cust.generalSavingsBalance, lang)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {lang === 'bn' ? 'মোট জমা:' : 'Total Deposit:'} {formatBDT(cust.totalDeposit, lang)}
                      </p>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
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
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Manual Balance +/- */}
                        <button
                          onClick={() => {
                            setAdjCustomer(cust);
                            setAdjType('add');
                            setAdjAccountNo(cust.mobile);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 transition-colors"
                          title={lang === 'bn' ? 'ব্যালেন্স যোগ করুন (+)' : 'Add Balance (+)'}
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setAdjCustomer(cust);
                            setAdjType('subtract');
                            setAdjAccountNo(cust.mobile);
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 transition-colors"
                          title={lang === 'bn' ? 'ব্যালেন্স কর্তন করুন (-)' : 'Subtract Balance (-)'}
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>

                        {/* View details */}
                        <button
                          onClick={() => setViewCustomer(cust)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                          title={lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Profile'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Send SMS */}
                        <button
                          onClick={() => setSmsCustomer(cust)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 transition-colors"
                          title={lang === 'bn' ? 'মেসেজ পাঠান' : 'Send SMS'}
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        {/* Delete Customer */}
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  lang === 'bn'
                                    ? `আপনি কি নিশ্চিত যে ${cust.nameBn} কাস্টমারটি মুছে ফেলতে চান?`
                                    : `Are you sure you want to delete ${cust.nameEn}?`
                                )
                              ) {
                                deleteCustomer(cust.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 transition-colors"
                            title={lang === 'bn' ? 'কাস্টমার মুছুন' : 'Delete Customer'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
                    className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 ${
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
                    onClick={() => setAdjType('subtract')}
                    className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 ${
                      adjType === 'subtract'
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold"
                >
                  <option value="general">সাধারণ সঞ্চয় হিসাব</option>
                  {(schemePackages || []).map((pkg) => (
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold outline-none"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAdjCustomer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
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
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  required
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSmsCustomer(null)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
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
                {lang === 'bn' ? 'কাস্টমার প্রোফাইল কার্ড' : 'Customer Profile Card'}
              </h3>
              <button onClick={() => setViewCustomer(null)} className="text-slate-400 font-bold hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center">
                  {viewCustomer.nameEn.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{viewCustomer.nameBn}</h4>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{viewCustomer.nameEn}</p>
                  <p className="text-xs font-mono font-bold text-emerald-600 mt-0.5">ID: {viewCustomer.membershipId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">হিসাব নম্বর:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{viewCustomer.accountNo}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">মোবাইল নম্বর:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewCustomer.mobile}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">এনআইডি / জন্ম নিবন্ধন:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{viewCustomer.nidNumber}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">সাধারণ সঞ্চয় ব্যালেন্স:</span>
                  <span className="font-black text-emerald-600">{formatBDT(viewCustomer.generalSavingsBalance, lang)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setViewCustomer(null);
                    onNavigate('kyc_form');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow flex items-center justify-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'কেওয়াইসি ফর্ম বিস্তারিত ও এডিট দেখুন' : 'View / Edit KYC Form'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

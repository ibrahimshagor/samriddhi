import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Branch } from '../types';
import { GitBranch, Plus, Search, Edit2, Trash2, Building2, Phone, MapPin, UserCheck } from 'lucide-react';

export const BranchManagement: React.FC = () => {
  const { currentUser, branches, institutions, users, addBranch, updateBranch, deleteBranch, lang } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstFilter, setSelectedInstFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form state
  const [institutionId, setInstitutionId] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
  const [addressBn, setAddressBn] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [phone, setPhone] = useState('');
  const [managerId, setManagerId] = useState('');

  if (!currentUser) return null;
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Filter branches based on role
  const allowedBranches = isSuperAdmin
    ? branches
    : branches.filter((b) => b.id === currentUser.branchId);

  const filteredBranches = allowedBranches.filter((b) => {
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (b.nameBn || '').toLowerCase().includes(query) ||
      (b.nameEn || '').toLowerCase().includes(query) ||
      (b.code || '').toLowerCase().includes(query);
    const matchesInst = selectedInstFilter === 'all' || b.institutionId === selectedInstFilter;
    return matchesSearch && matchesInst;
  });

  const availableManagers = users.filter((u) => u.role === 'branch_manager');

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setInstitutionId((institutions || [])[0]?.id || '');
    setNameBn('');
    setNameEn('');
    setCode('BR-' + Math.floor(10 + Math.random() * 90));
    setAddressBn('');
    setAddressEn('');
    setPhone('');
    setManagerId('');
    setShowModal(true);
  };

  const handleOpenEdit = (b: Branch) => {
    setEditingBranch(b);
    setInstitutionId(b.institutionId);
    setNameBn(b.nameBn);
    setNameEn(b.nameEn);
    setCode(b.code);
    setAddressBn(b.addressBn);
    setAddressEn(b.addressEn);
    setPhone(b.phone);
    setManagerId(b.managerId || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const mgrObj = users.find((u) => u.id === managerId);

    if (editingBranch) {
      updateBranch({
        ...editingBranch,
        institutionId,
        nameBn,
        nameEn,
        code,
        addressBn,
        addressEn,
        phone,
        managerId,
        managerName: mgrObj ? mgrObj.nameBn : editingBranch.managerName,
      });
    } else {
      addBranch({
        institutionId,
        nameBn,
        nameEn,
        code,
        addressBn,
        addressEn,
        phone,
        managerId,
        managerName: mgrObj ? mgrObj.nameBn : 'অনির্ধারিত',
        openingDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
    }
    setShowModal(false);
  };

  // If customer, show summary view instead of detailed list
  if (currentUser.role === 'customer') {
    const myBranch = (branches || []).find((b) => b.id === currentUser.branchId) || (branches || [])[0];
    const totalCount = (branches || []).length;

    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '৪. শাখা তথ্য সংক্ষিপ্ত বিবরণ' : '4. Branch Summary'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'প্রতিষ্ঠানের নিবন্ধিত শাখা সমূহের মোট সংখ্যা ও আপনার বর্তমান শাখা তথ্য'
              : 'Total active branches and your registered branch summary'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-100">
                {lang === 'bn' ? 'প্রতিষ্ঠানের মোট সক্রিয় শাখা' : 'Total Active Branches'}
              </p>
              <h3 className="text-3xl font-black mt-1 font-mono">{totalCount} {lang === 'bn' ? 'টি' : ''}</h3>
              <p className="text-[11px] text-emerald-200 mt-2">
                {lang === 'bn' ? 'সারাদেশ জুড়ে সেবা প্রদান করা হচ্ছে' : 'Providing services across regions'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Building2 className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {lang === 'bn' ? 'আপনার নিবন্ধিত শাখা' : 'Your Registered Branch'}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">
                {myBranch ? (lang === 'bn' ? myBranch.nameBn : myBranch.nameEn) : 'প্রধান শাখা'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{myBranch ? (lang === 'bn' ? myBranch.addressBn : myBranch.addressEn) : 'ঢাকা, বাংলাদেশ'}</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '৪. শাখা ব্যবস্থাপনা (Branch Management)' : '4. Branch Management'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'বিভিন্ন প্রতিষ্ঠানের অধীনে ব্রাঞ্চ পরিচালনা, শাখা প্রধান ও ঠিকানা নিয়ন্ত্রণ করুন'
              : 'Manage branches under different institutions & assigned branch managers'}
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন শাখা তৈরি করুন' : 'Create New Branch'}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'শাখার নাম বা কোড দিয়ে খুঁজুন...' : 'Search by branch name or code...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedInstFilter}
          onChange={(e) => setSelectedInstFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
        >
          <option value="all">{lang === 'bn' ? 'সকল প্রতিষ্ঠান' : 'All Institutions'}</option>
          {(institutions || []).map((i) => (
            <option key={i.id} value={i.id}>
              {lang === 'bn' ? i.nameBn : i.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBranches.map((branch) => {
          const instObj = institutions.find((i) => i.id === branch.institutionId);
          return (
            <div
              key={branch.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      CODE: {branch.code}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                      {lang === 'bn' ? branch.nameBn : branch.nameEn}
                    </h3>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Active
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{instObj ? (lang === 'bn' ? instObj.nameBn : instObj.nameEn) : 'মূল প্রতিষ্ঠান'}</span>
                </p>

                <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{lang === 'bn' ? branch.addressBn : branch.addressEn}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{branch.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {lang === 'bn' ? 'শাখা প্রধান:' : 'Branch Manager:'}{' '}
                      <strong className="text-slate-900 dark:text-white">{branch.managerName || 'অনির্ধারিত'}</strong>
                    </span>
                  </p>
                </div>
              </div>

              {isSuperAdmin && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(branch)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteBranch(branch.id)}
                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              {editingBranch
                ? lang === 'bn'
                  ? 'শাখা তথ্য সম্পাদনা'
                  : 'Edit Branch'
                : lang === 'bn'
                ? 'নতুন শাখা তৈরি করুন'
                : 'Create Branch'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'মূল প্রতিষ্ঠান নির্বাচন করুন' : 'Select Main Institution'}
                </label>
                <select
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  required
                >
                  {(institutions || []).map((i) => (
                    <option key={i.id} value={i.id}>
                      {lang === 'bn' ? i.nameBn : i.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'শাখার নাম (বাংলায়)' : 'Branch Name (Bangla)'}
                </label>
                <input
                  type="text"
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'শাখার নাম (English)' : 'Branch Name (English)'}
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'শাখা কোড' : 'Branch Code'}
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'ফোন নম্বর' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'শাখা প্রধান / ম্যানেজার নির্বাচন করুন' : 'Assign Branch Manager'}
                </label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                >
                  <option value="">{lang === 'bn' ? '-- ম্যানেজার নির্বাচন করুন --' : '-- Select Manager --'}</option>
                  {(availableManagers || []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {lang === 'bn' ? m.nameBn : m.nameEn} ({m.mobile})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'শাখার ঠিকানা (বাংলায়)' : 'Branch Address (Bangla)'}
                </label>
                <input
                  type="text"
                  value={addressBn}
                  onChange={(e) => setAddressBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'শাখার ঠিকানা (English)' : 'Branch Address (English)'}
                </label>
                <input
                  type="text"
                  value={addressEn}
                  onChange={(e) => setAddressEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  {lang === 'bn' ? 'শাখা সংরক্ষণ করুন' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

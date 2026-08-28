import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import { Users, Plus, Search, Edit2, Trash2, Phone, Mail, Building2, ShieldCheck, UserCheck } from 'lucide-react';

export const StaffAndManagers: React.FC = () => {
  const { currentUser, users, branches, addUser, updateUser, deleteUser, lang } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'branch_manager' | 'branch_staff'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('branch_staff');
  const [branchId, setBranchId] = useState('');
  const [designationBn, setDesignationBn] = useState('');
  const [designationEn, setDesignationEn] = useState('');

  if (!currentUser) return null;

  const isSuperAdmin = currentUser.role === 'super_admin';
  const isBranchManager = currentUser.role === 'branch_manager';
  const canCustomize = isSuperAdmin || isBranchManager;

  // Filter users: only managers and staff
  const staffAndManagerList = users.filter((u) => u.role === 'branch_manager' || u.role === 'branch_staff');

  // Scope filter: Managers & Staff see their branch staff/managers unless Super Admin
  const scopedList = isSuperAdmin
    ? staffAndManagerList
    : staffAndManagerList.filter((u) => u.branchId === currentUser.branchId);

  const filteredList = scopedList.filter((u) => {
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (u.nameBn || '').toLowerCase().includes(query) ||
      (u.nameEn || '').toLowerCase().includes(query) ||
      (u.mobile || '').includes(searchQuery) ||
      (u.username || '').toLowerCase().includes(query);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setNameBn('');
    setNameEn('');
    setEmail('');
    setMobile('');
    setUsername('stf' + Math.floor(100 + Math.random() * 900));
    setRole('branch_staff');
    setBranchId(currentUser.branchId || (branches || [])[0]?.id || '');
    setDesignationBn('শাখা ফিল্ড অফিসার');
    setDesignationEn('Field Officer');
    setShowModal(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setNameBn(u.nameBn);
    setNameEn(u.nameEn);
    setEmail(u.email);
    setMobile(u.mobile);
    setUsername(u.username);
    setRole(u.role);
    setBranchId(u.branchId || '');
    setDesignationBn(u.designationBn || '');
    setDesignationEn(u.designationEn || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser({
        ...editingUser,
        nameBn,
        nameEn,
        email,
        mobile,
        username,
        role,
        branchId,
        designationBn,
        designationEn,
      });
    } else {
      addUser({
        username,
        nameBn,
        nameEn,
        email,
        mobile,
        role,
        branchId,
        membershipId: 'SMF-STF-' + Math.floor(1000 + Math.random() * 9000),
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'active',
        designationBn,
        designationEn,
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '৫. শাখা কর্মী ও ম্যানেজার ডাইরেক্টরি' : '5. Staff & Managers Directory'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'শাখা প্রধান ও শাখা কর্মী ফিল্ড অফিসারদের তথ্য সৃষ্টি, অনুসন্ধান ও নিয়ন্ত্রণ করুন'
              : 'Create & manage branch managers & staff personnel with role controls'}
          </p>
        </div>

        {canCustomize && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন কর্মী/ম্যানেজার যুক্ত করুন' : 'Add Staff / Manager'}</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'নাম, মোবাইল নম্বর বা ইউজারনেম দিয়ে খুঁজুন...' : 'Search staff by name, mobile, username...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e: any) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
        >
          <option value="all">{lang === 'bn' ? 'সকল রোল (All Roles)' : 'All Roles'}</option>
          <option value="branch_manager">{lang === 'bn' ? 'শাখা ম্যানেজার' : 'Branch Managers'}</option>
          <option value="branch_staff">{lang === 'bn' ? 'শাখা স্টাফ' : 'Branch Staff'}</option>
        </select>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((user) => {
          const branchObj = branches.find((b) => b.id === user.branchId);
          return (
            <div
              key={user.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow">
                      {user.nameEn.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {lang === 'bn' ? user.nameBn : user.nameEn}
                      </h3>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {lang === 'bn' ? user.designationBn : user.designationEn}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold capitalize ${
                      user.role === 'branch_manager'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {user.role === 'branch_manager' ? 'ম্যানেজার' : 'স্টাফ'}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.mobile}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.email || 'N/A'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{branchObj ? (lang === 'bn' ? branchObj.nameBn : branchObj.nameEn) : 'প্রধান কার্যালয়'}</span>
                  </p>
                  <p className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                    <span>ID: {user.membershipId}</span> | <span>User: {user.username}</span>
                  </p>
                </div>
              </div>

              {canCustomize && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(user)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              {editingUser
                ? lang === 'bn'
                  ? 'কর্মী তথ্য সম্পাদনা'
                  : 'Edit Staff / Manager'
                : lang === 'bn'
                ? 'নতুন কর্মী / ম্যানেজার যুক্ত করুন'
                : 'Add Staff / Manager'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পদবি ও রোল নির্বাচন করুন' : 'Assign Role'}
                </label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  required
                >
                  <option value="branch_staff">{lang === 'bn' ? 'শাখা স্টাফ (Branch Staff)' : 'Branch Staff'}</option>
                  <option value="branch_manager">{lang === 'bn' ? 'শাখা ম্যানেজার (Branch Manager)' : 'Branch Manager'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'নাম (বাংলায়)' : 'Name (Bangla)'}
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
                  {lang === 'bn' ? 'নাম (English)' : 'Name (English)'}
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
                    {lang === 'bn' ? 'ইউজার আইডি' : 'Username'}
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile'}
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'শাখা নির্বাচন করুন' : 'Select Branch'}
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  required
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {lang === 'bn' ? b.nameBn : b.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পদবি (বাংলায়/English)' : 'Designation'}
                </label>
                <input
                  type="text"
                  value={designationBn}
                  onChange={(e) => {
                    setDesignationBn(e.target.value);
                    setDesignationEn(e.target.value);
                  }}
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
                  {lang === 'bn' ? 'কর্মী সংরক্ষণ' : 'Save Personnel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

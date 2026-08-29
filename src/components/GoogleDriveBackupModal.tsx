import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Cloud,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  FileJson,
  ShieldCheck,
  UserCheck,
  LogOut,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';
import {
  requestGoogleDriveAuth,
  disconnectGoogleDrive,
  uploadBackupToGoogleDrive,
  listDriveBackups,
  downloadDriveBackupContent,
  getActiveDriveToken,
  getCachedGoogleUser,
  GoogleDriveUser,
  BackupMetadata,
  AutoBackupConfig,
} from '../lib/googleDriveBackup';

export const GoogleDriveBackupModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    lang,
    currentUser,
    users,
    institutions,
    branches,
    customers,
    paymentChannels,
    investments,
    borrowings,
    packages,
    joinedPackages,
    loans,
    supportTickets,
    kycRecords,
    adjustmentRequests,
    settings,
    restoreFullBackup,
    showToast,
  } = useApp();

  const [connectedUser, setConnectedUser] = useState<GoogleDriveUser | null>(getCachedGoogleUser());
  const [token, setToken] = useState<string | null>(getActiveDriveToken());
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Auto-backup configuration state
  const [autoConfig, setAutoConfig] = useState<AutoBackupConfig>(() => {
    const saved = localStorage.getItem('smf_autobackup_config');
    return saved
      ? JSON.parse(saved)
      : {
          enabled: true,
          frequency: 'daily',
          scheduledTime: '02:00',
          accountEmail: connectedUser?.email,
        };
  });

  const [confirmRestoreModal, setConfirmRestoreModal] = useState<{
    isOpen: boolean;
    backup: BackupMetadata | null;
    content: any | null;
  }>({
    isOpen: false,
    backup: null,
    content: null,
  });

  // Fetch drive files whenever connected
  useEffect(() => {
    if (token) {
      loadBackupList();
    }
  }, [token]);

  const loadBackupList = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const list = await listDriveBackups(token);
      setBackups(list);
    } catch (err) {
      console.error(err);
      showToast(lang === 'bn' ? 'ড্রাইভ ফাইল তালিকা লোড করতে সমস্যা হয়েছে' : 'Failed to list backup files', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (selectAnother: boolean = true) => {
    try {
      setLoading(true);
      const res = await requestGoogleDriveAuth(selectAnother);
      setToken(res.token);
      setConnectedUser(res.user);
      setAutoConfig((prev) => {
        const updated = { ...prev, accountEmail: res.user.email };
        localStorage.setItem('smf_autobackup_config', JSON.stringify(updated));
        return updated;
      });
      showToast(
        lang === 'bn'
          ? `গুগল ড্রাইভ একাউন্ট (${res.user.email}) সফলভাবে সংযুক্ত হয়েছে!`
          : `Connected to Google Drive (${res.user.email})!`,
        'success'
      );
    } catch (err: any) {
      console.error(err);
      showToast(
        lang === 'bn' ? 'গুগল অথেন্টিকেশনে সমস্যা হয়েছে' : err.message || 'Google Auth Error',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectGoogleDrive();
    setToken(null);
    setConnectedUser(null);
    setBackups([]);
    showToast(lang === 'bn' ? 'গুগল ড্রাইভ সংযোগ বিচ্ছিন্ন করা হয়েছে' : 'Google Drive disconnected', 'info');
  };

  const buildBackupPayload = () => {
    return {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.username || 'admin',
      systemSummary: {
        usersCount: users.length,
        customersCount: customers.length,
        loansCount: loans.length,
        branchesCount: branches.length,
        totalSavings: customers.reduce((acc, c) => acc + (c.generalSavingsBalance || 0), 0),
      },
      data: {
        users,
        institutions,
        branches,
        customers,
        paymentChannels,
        investments,
        borrowings,
        packages,
        joinedPackages,
        loans,
        supportTickets,
        kycRecords,
        adjustmentRequests,
        settings,
      },
    };
  };

  const handleManualBackupNow = async () => {
    if (!token) {
      showToast(lang === 'bn' ? 'প্রথমে গুগল ড্রাইভ একাউন্ট কানেক্ট করুন' : 'Connect Google Drive first', 'error');
      return;
    }
    try {
      setLoading(true);
      const payload = buildBackupPayload();
      const res = await uploadBackupToGoogleDrive(token, payload);
      showToast(
        lang === 'bn'
          ? `নতুন ব্যাকআপ সফলভাবে ড্রাইভে সেভ হয়েছে: ${res.fileName}`
          : `Backup saved to Drive: ${res.fileName}`,
        'success'
      );

      // Update auto config status
      const updatedConfig: AutoBackupConfig = {
        ...autoConfig,
        lastBackupTime: new Date().toISOString(),
        lastBackupFileName: res.fileName,
        lastBackupStatus: 'success',
      };
      setAutoConfig(updatedConfig);
      localStorage.setItem('smf_autobackup_config', JSON.stringify(updatedConfig));

      await loadBackupList();
    } catch (err: any) {
      console.error(err);
      showToast(lang === 'bn' ? 'ড্রাইভে ব্যাকআপ আপলোডে ত্রুটি হয়েছে' : err.message || 'Backup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLocalJson = () => {
    const payload = buildBackupPayload();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Samriddhi_FMS_Local_Backup_${timestamp}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(lang === 'bn' ? 'লোকাল JSON ব্যাকআপ ফাইল ডাউনলোড হয়েছে' : 'Local JSON backup file downloaded', 'success');
  };

  const handleSelectRestore = async (backup: BackupMetadata) => {
    if (!token) return;
    try {
      setRestoringId(backup.id);
      const content = await downloadDriveBackupContent(token, backup.id);
      setConfirmRestoreModal({
        isOpen: true,
        backup,
        content,
      });
    } catch (err: any) {
      console.error(err);
      showToast(lang === 'bn' ? 'ফাইল কন্টেন্ট ডাউনলোড করতে ব্যর্থ' : 'Failed to read backup', 'error');
    } finally {
      setRestoringId(null);
    }
  };

  const executeRestore = () => {
    if (!confirmRestoreModal.content) return;
    const ok = restoreFullBackup(confirmRestoreModal.content);
    if (ok) {
      setConfirmRestoreModal({ isOpen: false, backup: null, content: null });
      onClose();
    }
  };

  const handleSaveAutoConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('smf_autobackup_config', JSON.stringify(autoConfig));
    showToast(
      lang === 'bn'
        ? 'স্বয়ংক্রিয় ব্যাকআপ সেটিংস সফলভাবে সংরক্ষিত হয়েছে!'
        : 'Auto-backup settings saved successfully!',
      'success'
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                {lang === 'bn' ? 'গুগল ড্রাইভ অটোমেটিক ব্যাকআপ ও রিস্টোর' : 'Google Drive Auto-Backup & Restore'}
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/40">
                  Super Admin
                </span>
              </h3>
              <p className="text-[11px] text-emerald-200/70">
                {lang === 'bn'
                  ? 'গুগল একাউন্টে স্বয়ংক্রিয় JSON ব্যাকআপ শিডিউল ও প্রয়োজনমতো ডেটা রিস্টোর'
                  : 'Automated JSON snapshot uploads to your Google Drive and instant restore'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Step 1: Account Connection Panel */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    {lang === 'bn' ? 'সংযুক্ত গুগল অ্যাকাউন্ট (Google Drive)' : 'Connected Google Account'}
                    {connectedUser ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> {lang === 'bn' ? 'সক্রিয়' : 'Active'}
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                        {lang === 'bn' ? 'কানেক্ট করা হয়নি' : 'Not Connected'}
                      </span>
                    )}
                  </h4>
                  {connectedUser ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      <span className="font-semibold">{connectedUser.name}</span> ({connectedUser.email})
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {lang === 'bn'
                        ? 'আপনার পছন্দমতো গুগল একাউন্ট নির্বাচন করে কানেক্ট করুন।'
                        : 'Select and connect your preferred Google Drive account.'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {connectedUser ? (
                  <>
                    <button
                      onClick={() => handleConnect(true)}
                      disabled={loading}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                      <span>{lang === 'bn' ? 'অন্য একাউন্ট নির্বাচন' : 'Switch Account'}</span>
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'বিচ্ছিন্ন করুন' : 'Disconnect'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(true)}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Cloud className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'গুগল একাউন্ট নির্বাচন ও কানেক্ট করুন' : 'Connect Google Account'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Auto-Backup Schedule Configuration */}
          <form
            onSubmit={handleSaveAutoConfig}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'স্বয়ংক্রিয় ব্যাকআপ শিডিউল সেটিংস' : 'Auto-Backup Schedule Settings'}
                </h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoConfig.enabled}
                  onChange={(e) => setAutoConfig({ ...autoConfig, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {autoConfig.enabled ? (lang === 'bn' ? 'সক্রিয়' : 'Enabled') : (lang === 'bn' ? 'বন্ধ' : 'Disabled')}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  {lang === 'bn' ? 'ব্যাকআপ ফ্রিকোয়েন্সি' : 'Backup Frequency'}
                </label>
                <select
                  value={autoConfig.frequency}
                  onChange={(e) => setAutoConfig({ ...autoConfig, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="daily">{lang === 'bn' ? 'প্রতিদিন (Daily)' : 'Daily'}</option>
                  <option value="hourly">{lang === 'bn' ? 'প্রতি ৬ ঘণ্টা পর পর' : 'Every 6 Hours'}</option>
                  <option value="weekly">{lang === 'bn' ? 'সাপ্তাহিক (Weekly)' : 'Weekly'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  {lang === 'bn' ? 'নির্ধারিত সময় (Scheduled Time)' : 'Scheduled Time'}
                </label>
                <input
                  type="time"
                  value={autoConfig.scheduledTime}
                  onChange={(e) => setAutoConfig({ ...autoConfig, scheduledTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  {lang === 'bn' ? 'ফোল্ডারের নাম (Google Drive)' : 'Target Drive Folder'}
                </label>
                <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 truncate">
                  <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Samriddhi_FMS_Backups/</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div>
                {autoConfig.lastBackupTime ? (
                  <span>
                    {lang === 'bn' ? 'সর্বশেষ অটো-ব্যাকআপ: ' : 'Last auto-backup: '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {new Date(autoConfig.lastBackupTime).toLocaleString('bn-BD')}
                    </strong>{' '}
                    ({autoConfig.lastBackupFileName})
                  </span>
                ) : (
                  <span>{lang === 'bn' ? 'কোনো পূর্ববর্তী অটো-ব্যাকআপ হিস্ট্রি নেই' : 'No previous auto-backup recorded'}</span>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold transition-all self-end sm:self-auto"
              >
                {lang === 'bn' ? 'সেটিংস সংরক্ষণ করুন' : 'Save Schedule'}
              </button>
            </div>
          </form>

          {/* Step 3: Instant Actions (Drive Upload + Local Download) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <div>
              <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-300">
                {lang === 'bn' ? 'ইনস্ট্যান্ট ম্যানুয়াল ব্যাকআপ তৈরি' : 'Create Instant Manual Snapshot'}
              </h4>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                {lang === 'bn'
                  ? 'বর্তমান সম্পূর্ণ সিস্টেম ডাটাবেসের একটি কপি সরাসরি গুগল ড্রাইভে অথবা আপনার কম্পিউটারে সেভ করুন।'
                  : 'Immediately upload the latest database state to Drive or download as JSON file.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadLocalJson}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>{lang === 'bn' ? 'লোকাল JSON ডাউনলোড' : 'Download JSON'}</span>
              </button>

              <button
                onClick={handleManualBackupNow}
                disabled={loading || !connectedUser}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{loading ? (lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') : (lang === 'bn' ? 'এখনই ড্রাইভে ব্যাকআপ নিন' : 'Backup to Drive Now')}</span>
              </button>
            </div>
          </div>

          {/* Step 4: Available Backups on Drive & Restore Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-amber-500" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'গুগল ড্রাইভে রক্ষিত ব্যাকআপ ফাইলসমূহ' : 'Available Backups on Google Drive'}
                </h4>
              </div>
              <button
                onClick={loadBackupList}
                disabled={loading || !token}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{lang === 'bn' ? 'রিফ্রেশ লিস্ট' : 'Refresh List'}</span>
              </button>
            </div>

            {backups.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                {connectedUser
                  ? (lang === 'bn'
                      ? 'এখনো গুগল ড্রাইভে কোনো ব্যাকআপ আপলোড করা হয়নি। উপরের "এখনই ড্রাইভে ব্যাকআপ নিন" বাটনে চাপুন।'
                      : 'No backups found in Google Drive yet. Click "Backup to Drive Now" above.')
                  : (lang === 'bn'
                      ? 'ব্যাকআপ ফাইল দেখতে প্রথমে গুগল ড্রাইভ একাউন্ট কানেক্ট করুন।'
                      : 'Connect your Google Drive account first to view available backups.')}
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {backups.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <FileJson className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate">{b.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {new Date(b.createdTime).toLocaleString('bn-BD')} | Size: {b.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSelectRestore(b)}
                        disabled={restoringId === b.id}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${restoringId === b.id ? 'animate-spin' : ''}`} />
                        <span>{lang === 'bn' ? 'রিস্টোর করুন' : 'Restore'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              {lang === 'bn'
                ? 'ড্রাইভ ফাইলগুলো সম্পূর্ণ সুরক্ষিত এবং শুধুমাত্র সুপার এডমিনের প্রবেশাধিকার রয়েছে।'
                : 'Backups are stored privately in your personal Google Drive folder.'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Data Restore */}
      {confirmRestoreModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border-2 border-amber-500/40 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {lang === 'bn' ? 'ডাটাবেস রিস্টোর নিশ্চিতকরণ' : 'Confirm Database Restore'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? `আপনি কি "${confirmRestoreModal.backup?.name}" ফাইলটি থেকে সম্পূর্ণ সিস্টেম ডেটা রিস্টোর করতে চান?`
                  : `Are you sure you want to restore all system data from "${confirmRestoreModal.backup?.name}"?`}
              </p>
            </div>

            {confirmRestoreModal.content?.systemSummary && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {lang === 'bn' ? 'ব্যাকআপ ফাইলের সংক্ষিপ্ত বিবরণ:' : 'Backup Snapshot Info:'}
                </p>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span>মোট ইউজার: {confirmRestoreModal.content.systemSummary.usersCount}</span>
                  <span>মোট গ্রাহক: {confirmRestoreModal.content.systemSummary.customersCount}</span>
                  <span>মোট লোন: {confirmRestoreModal.content.systemSummary.loansCount}</span>
                  <span>মোট শাখা: {confirmRestoreModal.content.systemSummary.branchesCount}</span>
                </div>
              </div>
            )}

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300">
              ⚠️ {lang === 'bn'
                ? 'সতর্কতা: রিস্টোর করলে বর্তমান ডাটাবেস প্রতিস্থাপিত হয়ে ব্যাকআপ ফাইলের ডেটা লোড হবে এবং ফায়ারবেসে সিঙ্ক হয়ে যাবে।'
                : 'Warning: Restoring will overwrite current database state with the backup snapshot.'}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmRestoreModal({ isOpen: false, backup: null, content: null })}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={executeRestore}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-600/30"
              >
                {lang === 'bn' ? 'হ্যাঁ, রিস্টোর করুন' : 'Confirm Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

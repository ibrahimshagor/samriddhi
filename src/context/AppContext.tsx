import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Language,
  Institution,
  Branch,
  Customer,
  PaymentChannel,
  Investment,
  InstitutionalBorrowing,
  SchemePackage,
  JoinedCustomerPackage,
  CustomerLoanApplication,
  SupportTicket,
  CustomerMessage,
  KycRecord,
  AdjustmentRequest,
  GeneralSavingsRequest,
  AuditLog,
  SystemSettings,
  OfficialNotice,
} from '../types';

import {
  initialUsers,
  initialInstitutions,
  initialBranches,
  initialCustomers,
  initialPaymentChannels,
  initialInvestments,
  initialBorrowings,
  initialPackages,
  initialJoinedPackages,
  initialSavingsRequests,
  initialLoans,
  initialTickets,
  initialKycRecords,
  initialAdjustmentRequests,
  initialAuditLogs,
  initialSettings,
  initialNotices,
} from '../data/mockData';

import {
  syncDocToFirestore,
  deleteDocFromFirestore,
  syncAllToFirestore,
  loadFromFirestore,
} from '../lib/firestoreSync';
import { testFirestoreConnection, firebaseConfig } from '../lib/firebase';
import { resolveLogo, DEFAULT_SAMRIDDHI_LOGO_DATA_URI } from '../utils/logo';

export const FIXED_DEVELOPER_NAME = 'Md. Ibrahim Hossain';
export const FIXED_DEVELOPER_POWERED_BY = 'TIKMERK IT';
export const FIXED_DEVELOPER_WEBSITE = 'www.tikmerk.com';

interface AppContextType {
  currentUser: User | null;
  lang: Language;
  darkMode: boolean;
  settings: SystemSettings;
  users: User[];
  institutions: Institution[];
  branches: Branch[];
  customers: Customer[];
  paymentChannels: PaymentChannel[];
  investments: Investment[];
  borrowings: InstitutionalBorrowing[];
  packages: SchemePackage[];
  joinedPackages: JoinedCustomerPackage[];
  savingsRequests: GeneralSavingsRequest[];
  loans: CustomerLoanApplication[];
  supportTickets: SupportTicket[];
  kycRecords: KycRecord[];
  adjustmentRequests: AdjustmentRequest[];
  customerMessages: CustomerMessage[];
  notices: OfficialNotice[];
  auditLogs: AuditLog[];
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  firebaseConnected: boolean;
  isFirebaseSyncing: boolean;
  activeBranchId: string;
  setActiveBranchId: (branchId: string) => void;
  activeInstitutionId: string;
  setActiveInstitutionId: (institutionId: string) => void;
  getUserAccessibleBranches: (user?: User | null) => Branch[];
  getAccessibleNotices: (user?: User | null) => OfficialNotice[];
  saveUserSignatureProfile: (profile: {
    savedSignatureUrl?: string;
    savedSignatoryName?: string;
    savedSignatoryDesignation?: string;
    savedSignatoryDepartment?: string;
  }) => void;

  // Actions
  login: (username: string, pass: string) => boolean;
  quickLogin: (role: UserRole) => void;
  logout: () => void;
  registerMember: (userData: Partial<User>, customerData: Partial<Customer>) => void;
  toggleLanguage: () => void;
  toggleDarkMode: () => void;
  setDemoMode: (val: boolean) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  syncAllDataToFirebase: () => Promise<void>;
  checkFirebaseStatus: () => Promise<boolean>;

  // Notices
  addNotice: (noticeData: Omit<OfficialNotice, 'id' | 'createdAt' | 'readByUserIds' | 'viewCount'>) => void;
  updateNotice: (notice: OfficialNotice) => void;
  deleteNotice: (noticeId: string) => void;
  markNoticeAsRead: (noticeId: string) => void;
  markAllNoticesAsRead: () => void;

  // CRUD & Operations
  addInstitution: (inst: Omit<Institution, 'id'>) => void;
  updateInstitution: (inst: Institution) => void;
  deleteInstitution: (id: string) => void;

  addBranch: (branch: Omit<Branch, 'id'>) => void;
  updateBranch: (branch: Branch) => void;
  deleteBranch: (id: string) => void;

  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;

  addCustomer: (cust: Omit<Customer, 'id' | 'accountNo' | 'generalSavingsBalance' | 'totalDeposit' | 'totalWithdrawal'>) => void;
  updateCustomer: (cust: Customer) => void;
  deleteCustomer: (id: string) => void;
  transferCustomerBranch: (customerId: string, newBranchId: string, reason?: string) => void;
  adjustCustomerBalance: (customerId: string, amount: number, type: 'add' | 'deduct', reason: string) => void;
  sendCustomerMessage: (customerId: string, message: string, subject?: string, replyToId?: string) => void;
  replyToCustomerMessage: (customerId: string, message: string, replyToId?: string) => void;
  markMessageAsRead: (messageId: string) => void;
  markAllCustomerMessagesAsRead: (customerId: string) => void;
  deleteCustomerMessage: (messageId: string) => void;

  addPaymentChannel: (chan: Omit<PaymentChannel, 'id'>) => void;
  updatePaymentChannel: (chan: PaymentChannel) => void;
  deletePaymentChannel: (id: string) => void;

  addInvestment: (inv: Omit<Investment, 'id' | 'accumulatedProfit' | 'status' | 'manualAdjustments'>) => void;
  updateInvestment: (inv: Investment) => void;
  deleteInvestment: (id: string) => void;
  adjustInvestmentProfitLoss: (investmentId: string, amount: number, reason: string) => void;

  addBorrowing: (borr: Omit<InstitutionalBorrowing, 'id' | 'totalPaid' | 'status'>) => void;
  updateBorrowing: (borr: InstitutionalBorrowing) => void;
  deleteBorrowing: (id: string) => void;
  toggleBorrowingVisibility: (id: string) => void;

  addPackage: (pkg: Omit<SchemePackage, 'id'>) => void;
  updatePackage: (pkg: SchemePackage) => void;
  deletePackage: (id: string) => void;

  joinPackage: (
    customerId: string,
    packageId: string,
    sharesCount: number,
    details?: { paymentMethod?: string; paymentChannelId?: string; trxId?: string; notes?: string }
  ) => void;
  reviewJoinedPackage: (joinedId: string, status: 'active' | 'cancelled') => void;
  applyForLoan: (customerId: string, packageId: string, amount: number, tenure: number) => void;
  reviewLoan: (loanId: string, status: 'approved' | 'rejected') => void;

  submitSavingsDepositRequest: (data: Omit<GeneralSavingsRequest, 'id' | 'type' | 'status' | 'createdAt'>) => void;
  submitSavingsWithdrawalRequest: (data: Omit<GeneralSavingsRequest, 'id' | 'type' | 'status' | 'createdAt'>) => void;
  reviewSavingsRequest: (requestId: string, status: 'approved' | 'rejected') => void;

  createTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'replies'>) => void;
  replyTicket: (ticketId: string, message: string) => void;
  updateTicketStatus: (ticketId: string, status: 'pending' | 'in_progress' | 'solved') => void;
  deleteTicket: (ticketId: string) => void;

  saveKyc: (kyc: Omit<KycRecord, 'id' | 'updatedAt'>) => void;
  reviewKyc: (kycId: string, status: 'approved' | 'rejected', reason?: string) => void;
  deleteKyc: (kycId: string) => void;

  submitAdjustmentRequest: (req: Omit<AdjustmentRequest, 'id' | 'status' | 'createdAt'>) => void;
  reviewAdjustmentRequest: (reqId: string, status: 'approved' | 'rejected') => void;

  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  restoreFullBackup: (backupPayload: any) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Safe JSON parser to avoid any blank-screen crash if localStorage data is corrupted
function safeLoadJson<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === 'undefined' || saved === 'null') return fallback;
    const parsed = JSON.parse(saved);
    return parsed ?? fallback;
  } catch (err) {
    console.warn(`[SafeStorage] Corrupted or invalid JSON for key "${key}", using fallback:`, err);
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return safeLoadJson<User | null>('smf_user', initialUsers[0]);
  });

  const [lang, setLang] = useState<Language>(() => {
    try {
      return (localStorage.getItem('smf_lang') as Language) || 'bn';
    } catch {
      return 'bn';
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('smf_dark') === 'true';
    } catch {
      return false;
    }
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('smf_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialSettings,
          ...parsed,
          logoSvg: resolveLogo(parsed.logoSvg || initialSettings.logoSvg),
          developerName: FIXED_DEVELOPER_NAME,
          developerPoweredBy: FIXED_DEVELOPER_POWERED_BY,
          developerWebsite: FIXED_DEVELOPER_WEBSITE,
        };
      }
    } catch {
      return initialSettings;
    }
    return initialSettings;
  });

  const [users, setUsers] = useState<User[]>(() => {
    return safeLoadJson<User[]>('smf_users', initialUsers);
  });
  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    return safeLoadJson<Institution[]>('smf_institutions', initialInstitutions);
  });
  const [branches, setBranches] = useState<Branch[]>(() => {
    return safeLoadJson<Branch[]>('smf_branches', initialBranches);
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    return safeLoadJson<Customer[]>('smf_customers', initialCustomers);
  });
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>(initialPaymentChannels);
  const [investments, setInvestments] = useState<Investment[]>(initialInvestments);
  const [borrowings, setBorrowings] = useState<InstitutionalBorrowing[]>(initialBorrowings);
  const [packages, setPackages] = useState<SchemePackage[]>(initialPackages);
  const [joinedPackages, setJoinedPackages] = useState<JoinedCustomerPackage[]>(() => {
    return safeLoadJson<JoinedCustomerPackage[]>('smf_joined_pkgs', initialJoinedPackages);
  });
  const [savingsRequests, setSavingsRequests] = useState<GeneralSavingsRequest[]>(initialSavingsRequests);
  const [loans, setLoans] = useState<CustomerLoanApplication[]>(() => {
    return safeLoadJson<CustomerLoanApplication[]>('smf_loans', initialLoans);
  });
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(initialTickets);
  const [kycRecords, setKycRecords] = useState<KycRecord[]>(initialKycRecords);
  const [adjustmentRequests, setAdjustmentRequests] = useState<AdjustmentRequest[]>(initialAdjustmentRequests);
  const [customerMessages, setCustomerMessages] = useState<CustomerMessage[]>(() => {
    return safeLoadJson<CustomerMessage[]>('smf_cust_messages', [
      {
        id: 'msg-1',
        customerId: 'cust-1',
        senderName: 'সুপার এডমিন (অফিস)',
        senderRole: 'super_admin',
        message: 'আপনার চলতি মাসের সঞ্চয় কিস্তি সফলভাবে গৃহিত হয়েছে। ধন্যবাদ।',
        sentAt: new Date().toLocaleString(),
        isRead: false,
      }
    ]);
  });
  const [notices, setNotices] = useState<OfficialNotice[]>(() => {
    return safeLoadJson<OfficialNotice[]>('smf_official_notices', initialNotices);
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(false);

  // Sync core collections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smf_users', JSON.stringify(users));
      localStorage.setItem('smf_branches', JSON.stringify(branches));
      localStorage.setItem('smf_customers', JSON.stringify(customers));
      localStorage.setItem('smf_loans', JSON.stringify(loans));
      localStorage.setItem('smf_joined_pkgs', JSON.stringify(joinedPackages));
      localStorage.setItem('smf_official_notices', JSON.stringify(notices));
    } catch {
      // ignore
    }
  }, [users, branches, customers, loans, joinedPackages, notices]);

  // Active Institution Context ('all' for super admin, or user's institution)
  const [activeInstitutionId, setActiveInstitutionIdState] = useState<string>(() => {
    if (!currentUser) return 'all';
    if (currentUser.role === 'super_admin') return 'all';
    return currentUser.institutionId || 'inst-1';
  });

  // Active Branch Context (Scoped for Managers/Staff, selectable/all for Super Admin)
  const [activeBranchId, setActiveBranchIdState] = useState<string>(() => {
    if (!currentUser) return 'all';
    if (currentUser.role === 'super_admin') return 'all';
    return 'all';
  });

  const getUserAccessibleBranches = (user?: User | null): Branch[] => {
    const targetUser = user || currentUser;
    if (!targetUser) return [];
    if (targetUser.role === 'super_admin') {
      return branches;
    }
    const assigned = targetUser.assignedBranchIds && targetUser.assignedBranchIds.length > 0
      ? targetUser.assignedBranchIds
      : targetUser.branchId
      ? [targetUser.branchId]
      : [];
    return branches.filter((b) => assigned.includes(b.id) || b.id === targetUser.branchId);
  };

  const setActiveInstitutionId = (instId: string) => {
    setActiveInstitutionIdState(instId);
    // If setting a specific institution, check if active branch still belongs to it
    if (instId !== 'all') {
      const instBranches = branches.filter((b) => b.institutionId === instId);
      if (!instBranches.some((b) => b.id === activeBranchId)) {
        setActiveBranchIdState('all');
      }
    }
  };

  const getAccessibleNotices = (user?: User | null): OfficialNotice[] => {
    const targetUser = user || currentUser;
    if (!targetUser) {
      return notices.filter((n) => n.scope === 'global' && n.status === 'published' && (!n.targetAudience || n.targetAudience === 'all' || n.targetAudience === 'customers'));
    }

    if (targetUser.role === 'super_admin') {
      return notices;
    }

    const userInstId = targetUser.institutionId;
    const userAssignedBranches = targetUser.assignedBranchIds || (targetUser.branchId ? [targetUser.branchId] : []);
    const userBranchId = targetUser.branchId;
    const isCustomer = targetUser.role === 'customer';

    return notices.filter((n) => {
      // Author can always see their own drafts or posts
      if (n.status !== 'published' && n.publishedBy !== targetUser.nameEn && n.publishedBy !== targetUser.nameBn) {
        return false;
      }

      // Check Target Audience permissions:
      // Customers cannot view internal staff-only notices
      if (isCustomer && n.targetAudience === 'staff') {
        return false;
      }

      // 1. Global Notice -> Everyone can see (matching audience)
      if (n.scope === 'global') return true;

      // 2. Institution Notice -> Users belonging to that institution
      if (n.scope === 'institution') {
        if (!userInstId) return true;
        if (n.institutionId && n.institutionId !== userInstId) return false;
        
        // If specific branches in this institution were targeted
        if (n.branchTargetMode === 'selected' && n.targetBranchIds && n.targetBranchIds.length > 0) {
          const hasBranchMatch = (userBranchId && n.targetBranchIds.includes(userBranchId)) ||
            userAssignedBranches.some((bId) => n.targetBranchIds!.includes(bId));
          return hasBranchMatch;
        }
        return true;
      }

      // 3. Branch Notice -> Users belonging to that branch
      if (n.scope === 'branch') {
        if (!n.branchId) return true;
        if (userAssignedBranches.includes(n.branchId)) return true;
        if (userBranchId === n.branchId) return true;
        return false;
      }

      return true;
    });
  };

  const setActiveBranchId = (branchId: string) => {
    if (!currentUser) {
      setActiveBranchIdState(branchId);
      return;
    }
    if (currentUser.role === 'super_admin') {
      setActiveBranchIdState(branchId);
      return;
    }
    // For manager/staff, only allow assigned branches
    const accessible = getUserAccessibleBranches(currentUser);
    const isValid = accessible.some((b) => b.id === branchId);
    if (isValid) {
      setActiveBranchIdState(branchId);
    } else if (accessible.length > 0) {
      setActiveBranchIdState(accessible[0].id);
    }
  };

  // Keep activeBranchId synchronized whenever currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setActiveBranchIdState('all');
      return;
    }
    if (currentUser.role === 'super_admin') {
      // Super admin can retain 'all' or selected branch
      setActiveBranchIdState((prev) => prev || 'all');
    } else {
      const accessible = getUserAccessibleBranches(currentUser);
      setActiveBranchIdState((prev) => {
        const isStillAccessible = accessible.some((b) => b.id === prev);
        if (isStillAccessible) return prev;
        return accessible[0]?.id || currentUser.branchId || 'br-1';
      });
    }
  }, [currentUser]);

  // Check Firebase connection on startup
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await testFirestoreConnection();
        setFirebaseConnected(res.connected);
      } catch {
        setFirebaseConnected(false);
      }
    };
    checkConnection();
  }, []);

  const checkFirebaseStatus = async (): Promise<boolean> => {
    try {
      const res = await testFirestoreConnection();
      setFirebaseConnected(res.connected);
      return res.connected;
    } catch {
      setFirebaseConnected(false);
      return false;
    }
  };

  const syncAllDataToFirebase = async () => {
    setIsFirebaseSyncing(true);
    try {
      await Promise.allSettled([
        syncAllToFirestore('users', users),
        syncAllToFirestore('institutions', institutions),
        syncAllToFirestore('branches', branches),
        syncAllToFirestore('customers', customers),
        syncAllToFirestore('paymentChannels', paymentChannels),
        syncAllToFirestore('investments', investments),
        syncAllToFirestore('borrowings', borrowings),
        syncAllToFirestore('packages', packages),
        syncAllToFirestore('joinedPackages', joinedPackages),
        syncAllToFirestore('savingsRequests', savingsRequests),
        syncAllToFirestore('loans', loans),
        syncAllToFirestore('supportTickets', supportTickets),
        syncAllToFirestore('kycRecords', kycRecords),
        syncAllToFirestore('adjustmentRequests', adjustmentRequests),
        syncDocToFirestore('settings', { id: 'main', ...settings }),
      ]);
      setFirebaseConnected(true);
      showToast(lang === 'bn' ? 'ফায়ারবেসে সকল ডাটা সফলভাবে সিঙ্ক হয়েছে!' : 'All data synced with Firebase successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(lang === 'bn' ? 'ফায়ারবেস সিঙ্কে ত্রুটি হয়েছে' : 'Firebase sync error', 'error');
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('smf_cust_messages', JSON.stringify(customerMessages));
  }, [customerMessages]);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smf_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('smf_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('smf_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('smf_dark', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('smf_settings', JSON.stringify(settings));
  }, [settings]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const logAuditAction = (actionBn: string, actionEn: string, moduleBn: string, moduleEn: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      performedBy: currentUser ? currentUser.username : 'System',
      role: currentUser ? currentUser.role : 'super_admin',
      actionBn,
      actionEn,
      moduleBn,
      moduleEn,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Auth Functions
  const login = (username: string, pass: string): boolean => {
    if (pass !== '123456') {
      showToast('ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড লিখুন (123456)', 'error');
      return false;
    }
    const target = (username || '').trim().toLowerCase();
    const found = users.find((u) => (u.username || '').toLowerCase() === target);
    if (found) {
      setCurrentUser(found);
      showToast(lang === 'bn' ? `স্বাগতম, ${found.nameBn}!` : `Welcome, ${found.nameEn}!`, 'success');
      logAuditAction('সিস্টেমে প্রবেশ', 'Logged into system', 'অথেন্টিকেশন', 'Authentication', `User ${found.username} logged in.`);
      return true;
    } else {
      showToast('ইউজার আইডি পাওয়া যায়নি!', 'error');
      return false;
    }
  };

  const quickLogin = (role: UserRole) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      showToast(lang === 'bn' ? `কুইক লগইন: ${found.nameBn}` : `Quick Login: ${found.nameEn}`, 'success');
      logAuditAction('কুইক লগইন ব্যবহার', 'Used Quick Login', 'অথেন্টিকেশন', 'Authentication', `Role: ${role}`);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    showToast(lang === 'bn' ? 'লগআউট সম্পন্ন হয়েছে' : 'Logged out successfully', 'info');
  };

  const registerMember = (userData: Partial<User>, customerData: Partial<Customer>) => {
    const userId = 'u-' + Date.now();
    const custId = 'c-' + Date.now();
    const accNo = 'ACC-' + Math.floor(100000 + Math.random() * 900000);

    const newUser: User = {
      id: userId,
      username: userData.username || 'user' + Math.floor(Math.random() * 1000),
      nameBn: userData.nameBn || 'নতুন সদস্য',
      nameEn: userData.nameEn || 'New Member',
      email: userData.email || '',
      mobile: userData.mobile || '',
      role: 'customer',
      institutionId: userData.institutionId || 'inst-1',
      branchId: userData.branchId || 'br-1',
      membershipId: 'SMF-CUST-' + Math.floor(1000 + Math.random() * 9000),
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'active',
      designationBn: 'সম্মানিত সদস্য',
      designationEn: 'Honorable Member',
    };

    const newCust: Customer = {
      id: custId,
      userId: userId,
      nameBn: newUser.nameBn,
      nameEn: newUser.nameEn,
      mobile: newUser.mobile,
      email: newUser.email,
      accountNo: accNo,
      institutionId: newUser.institutionId || 'inst-1',
      branchId: newUser.branchId || 'br-1',
      generalSavingsBalance: 0,
      totalDeposit: 0,
      totalWithdrawal: 0,
      kycStatus: 'not_submitted',
      status: 'active',
      joinedDate: newUser.joiningDate,
    };

    setUsers((prev) => [...prev, newUser]);
    setCustomers((prev) => [...prev, newCust]);
    setCurrentUser(newUser);

    showToast(lang === 'bn' ? 'সফলভাবে সদস্যপদ নিবন্ধিত হয়েছে!' : 'Membership registered successfully!', 'success');
    logAuditAction('নতুন সদস্য নিবন্ধন', 'New Member Registration', 'কাস্টমার ম্যানেজমেন্ট', 'Customer Management', `Account: ${accNo}`);
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const setDemoMode = (val: boolean) => {
    setSettings((prev) => ({ ...prev, demoMode: val }));
    showToast(lang === 'bn' ? `ডেমো মোড: ${val ? 'চালু' : 'বন্ধ'}` : `Demo Mode: ${val ? 'ON' : 'OFF'}`, 'info');
  };

  // Institution CRUD
  const addInstitution = (inst: Omit<Institution, 'id'>) => {
    const newInst: Institution = { ...inst, id: 'inst-' + Date.now(), totalBranches: 0 };
    setInstitutions((prev) => [...prev, newInst]);
    showToast(lang === 'bn' ? 'নতুন প্রতিষ্ঠান তৈরি হয়েছে' : 'New Institution Created', 'success');
    logAuditAction('নতুন প্রতিষ্ঠান যোগ', 'Added New Institution', 'মাল্টি ইনস্টিটিউশন', 'Multi Institution', newInst.nameEn);
  };

  const updateInstitution = (inst: Institution) => {
    setInstitutions((prev) => prev.map((i) => (i.id === inst.id ? inst : i)));
    showToast(lang === 'bn' ? 'প্রতিষ্ঠানের তথ্য আপডেট হয়েছে' : 'Institution Updated', 'success');
  };

  const deleteInstitution = (id: string) => {
    setInstitutions((prev) => prev.filter((i) => i.id !== id));
    showToast(lang === 'bn' ? 'প্রতিষ্ঠান মুছে ফেলা হয়েছে' : 'Institution Deleted', 'info');
  };

  // Branch CRUD
  const addBranch = (branch: Omit<Branch, 'id'>) => {
    const newBr: Branch = { ...branch, id: 'br-' + Date.now() };
    setBranches((prev) => [...prev, newBr]);
    setInstitutions((prev) =>
      prev.map((i) => (i.id === branch.institutionId ? { ...i, totalBranches: (i.totalBranches || 0) + 1 } : i))
    );
    showToast(lang === 'bn' ? 'নতুন শাখা তৈরি হয়েছে' : 'New Branch Created', 'success');
    logAuditAction('নতুন শাখা যোগ', 'Added New Branch', 'শাখা ব্যবস্থাপনা', 'Branch Management', newBr.nameEn);
  };

  const updateBranch = (branch: Branch) => {
    setBranches((prev) => prev.map((b) => (b.id === branch.id ? branch : b)));
    showToast(lang === 'bn' ? 'শাখার তথ্য আপডেট হয়েছে' : 'Branch Updated', 'success');
  };

  const deleteBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
    showToast(lang === 'bn' ? 'শাখা মুছে ফেলা হয়েছে' : 'Branch Deleted', 'info');
  };

  // User CRUD
  const addUser = (userData: Omit<User, 'id'>) => {
    const newU: User = { ...userData, id: 'u-' + Date.now() };
    setUsers((prev) => [...prev, newU]);
    showToast(lang === 'bn' ? 'ইউজার তৈরি হয়েছে' : 'User Created', 'success');
  };

  const updateUser = (u: User) => {
    setUsers((prev) => prev.map((item) => (item.id === u.id ? u : item)));
    if (currentUser?.id === u.id) setCurrentUser(u);

    // If manager, sync branch manager assignment
    if (u.role === 'branch_manager') {
      const assigned = u.assignedBranchIds || (u.branchId ? [u.branchId] : []);
      setBranches((prev) =>
        prev.map((b) => {
          if (assigned.includes(b.id)) {
            return { ...b, managerId: u.id, managerName: u.nameBn };
          }
          if (b.managerId === u.id && !assigned.includes(b.id)) {
            return { ...b, managerId: undefined, managerName: 'অনির্ধারিত' };
          }
          return b;
        })
      );
    }
    showToast(lang === 'bn' ? 'ইউজার তথ্য আপডেট হয়েছে' : 'User Updated', 'success');
  };

  const saveUserSignatureProfile = (profile: {
    savedSignatureUrl?: string;
    savedSignatoryName?: string;
    savedSignatoryDesignation?: string;
    savedSignatoryDepartment?: string;
  }) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      ...(profile.savedSignatureUrl !== undefined && { savedSignatureUrl: profile.savedSignatureUrl }),
      ...(profile.savedSignatoryName !== undefined && { savedSignatoryName: profile.savedSignatoryName }),
      ...(profile.savedSignatoryDesignation !== undefined && { savedSignatoryDesignation: profile.savedSignatoryDesignation }),
      ...(profile.savedSignatoryDepartment !== undefined && { savedSignatoryDepartment: profile.savedSignatoryDepartment }),
    };

    setUsers((prev) => prev.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
    setCurrentUser(updatedUser);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast(lang === 'bn' ? 'ইউজার ডিলেট হয়েছে' : 'User Deleted', 'info');
  };

  // Customer CRUD & Balance Adjustment
  const addCustomer = (custData: Omit<Customer, 'id' | 'accountNo' | 'generalSavingsBalance' | 'totalDeposit' | 'totalWithdrawal'>) => {
    const custId = 'c-' + Date.now();
    const userId = 'u-' + Date.now();
    const accNo = 'ACC-' + Math.floor(100000 + Math.random() * 900000);

    const newUser: User = {
      id: userId,
      username: custData.email.split('@')[0] || 'cust' + Math.floor(Math.random() * 100),
      nameBn: custData.nameBn,
      nameEn: custData.nameEn,
      email: custData.email,
      mobile: custData.mobile,
      role: 'customer',
      institutionId: custData.institutionId,
      branchId: custData.branchId,
      membershipId: 'SMF-CUST-' + Math.floor(1000 + Math.random() * 9000),
      joiningDate: custData.joinedDate || new Date().toISOString().split('T')[0],
      status: 'active',
      designationBn: 'সম্মানিত গ্রাহক',
      designationEn: 'Honorable Customer',
    };

    const newCust: Customer = {
      ...custData,
      id: custId,
      userId: userId,
      accountNo: accNo,
      generalSavingsBalance: 0,
      totalDeposit: 0,
      totalWithdrawal: 0,
    };

    setUsers((prev) => [...prev, newUser]);
    setCustomers((prev) => [...prev, newCust]);
    showToast(lang === 'bn' ? 'নতুন গ্রাহক সংযুক্ত হয়েছে' : 'New Customer Added', 'success');
    logAuditAction('নতুন গ্রাহক যোগ', 'Added New Customer', 'কাস্টমার ডাইরেক্টরি', 'Customer Directory', `Account: ${accNo}`);
  };

  const updateCustomer = (cust: Customer) => {
    // Permission check
    if (currentUser?.role === 'branch_manager') {
      const managerBranches = currentUser.assignedBranchIds || (currentUser.branchId ? [currentUser.branchId] : []);
      if (!managerBranches.includes(cust.branchId)) {
        showToast(lang === 'bn' ? 'আপনার এই শাখার কাস্টমার তথ্য সম্পাদনার অনুমতি নেই' : 'Unauthorized to edit customer in this branch', 'error');
        return;
      }
    } else if (currentUser?.role !== 'super_admin') {
      showToast(lang === 'bn' ? 'গ্রাহক তথ্য সম্পাদনার অনুমতি নেই' : 'Unauthorized action', 'error');
      return;
    }

    setCustomers((prev) => prev.map((c) => (c.id === cust.id ? cust : c)));

    // Keep linked user synchronized
    if (cust.userId) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === cust.userId
            ? {
                ...u,
                nameBn: cust.nameBn,
                nameEn: cust.nameEn,
                mobile: cust.mobile,
                email: cust.email,
                branchId: cust.branchId,
              }
            : u
        )
      );
    }

    showToast(lang === 'bn' ? 'গ্রাহকের তথ্য সফলভাবে আপডেট হয়েছে' : 'Customer Updated Successfully', 'success');
    logAuditAction(
      'গ্রাহক তথ্য আপডেট',
      'Updated Customer Info',
      'কাস্টমার ডাইরেক্টরি',
      'Customer Directory',
      `Customer: ${cust.nameBn} (${cust.accountNo})`
    );
  };

  const deleteCustomer = (id: string) => {
    const cust = customers.find((c) => c.id === id);
    if (!cust) return;

    // Permission check: Super Admin or Branch Manager for their branch
    if (currentUser?.role === 'branch_manager') {
      const managerBranches = currentUser.assignedBranchIds || (currentUser.branchId ? [currentUser.branchId] : []);
      if (!managerBranches.includes(cust.branchId)) {
        showToast(lang === 'bn' ? 'আপনার এই শাখার কাস্টমার মুছে ফেলার অনুমতি নেই' : 'Unauthorized to delete customer in this branch', 'error');
        return;
      }
    } else if (currentUser?.role !== 'super_admin') {
      showToast(lang === 'bn' ? 'কাস্টমার মুছে ফেলার অনুমতি নেই' : 'Unauthorized action', 'error');
      return;
    }

    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (cust.userId) {
      setUsers((prev) => prev.filter((u) => u.id !== cust.userId));
    }

    showToast(lang === 'bn' ? `গ্রাহক ${cust.nameBn} সফলভাবে মুছে ফেলা হয়েছে` : `Customer ${cust.nameEn} deleted successfully`, 'info');
    logAuditAction(
      'গ্রাহক মুছে ফেলা',
      'Customer Deleted',
      'কাস্টমার ডাইরেক্টরি',
      'Customer Directory',
      `Customer: ${cust.nameBn} (${cust.accountNo}) ID: ${id}`
    );
  };

  const transferCustomerBranch = (customerId: string, newBranchId: string, reason?: string) => {
    const customer = customers.find((c) => c.id === customerId);
    const targetBranch = branches.find((b) => b.id === newBranchId);
    const oldBranch = branches.find((b) => b.id === customer?.branchId);

    if (!customer || !targetBranch) {
      showToast(lang === 'bn' ? 'গ্রাহক অথবা শাখা খুঁজে পাওয়া যায়নি' : 'Customer or branch not found', 'error');
      return;
    }

    if (customer.branchId === newBranchId) {
      showToast(lang === 'bn' ? 'গ্রাহক ইতিমধ্যে এই শাখাতেই রয়েছেন' : 'Customer is already in this branch', 'info');
      return;
    }

    // Permission Check: Super admin can transfer any customer. Branch manager can transfer their branch's customer.
    if (currentUser?.role === 'branch_manager') {
      const managerBranches = currentUser.assignedBranchIds || (currentUser.branchId ? [currentUser.branchId] : []);
      if (!managerBranches.includes(customer.branchId)) {
        showToast(lang === 'bn' ? 'আপনার এই শাখার কাস্টমার স্থানান্তর করার অনুমতি নেই' : 'Unauthorized to transfer customer in this branch', 'error');
        return;
      }
    } else if (currentUser?.role !== 'super_admin') {
      showToast(lang === 'bn' ? 'শাখা ট্রান্সফার করার অনুমতি নেই' : 'Unauthorized action', 'error');
      return;
    }

    // Update Customer branch and institution
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, branchId: newBranchId, institutionId: targetBranch.institutionId }
          : c
      )
    );

    // Update linked user branch and institution
    if (customer.userId) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === customer.userId
            ? { ...u, branchId: newBranchId, institutionId: targetBranch.institutionId }
            : u
        )
      );
    }

    // Update customer loans branch
    setLoans((prev) =>
      prev.map((l) =>
        l.customerId === customerId
          ? { ...l, branchId: newBranchId, institutionId: targetBranch.institutionId }
          : l
      )
    );

    // Update joined packages branch
    setJoinedPackages((prev) =>
      prev.map((jp) =>
        jp.customerId === customerId
          ? { ...jp, branchId: newBranchId, institutionId: targetBranch.institutionId }
          : jp
      )
    );

    const oldBranchName = lang === 'bn' ? oldBranch?.nameBn || customer.branchId : oldBranch?.nameEn || customer.branchId;
    const newBranchName = lang === 'bn' ? targetBranch.nameBn : targetBranch.nameEn;
    const custName = lang === 'bn' ? customer.nameBn : customer.nameEn;

    showToast(
      lang === 'bn'
        ? `${custName} কে সফলভাবে ${newBranchName} এ স্থানান্তর করা হয়েছে`
        : `Successfully transferred ${custName} to ${newBranchName}`,
      'success'
    );

    logAuditAction(
      'গ্রাহক শাখা স্থানান্তর',
      'Customer Branch Transfer',
      'কাস্টমার ডাইরেক্টরি',
      'Customer Directory',
      `Customer: ${customer.nameBn} (${customer.accountNo}) transferred from ${oldBranchName} to ${newBranchName}. Reason: ${reason || 'N/A'}`
    );
  };

  const adjustCustomerBalance = (customerId: string, amount: number, type: 'add' | 'deduct', reason: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const change = type === 'add' ? amount : -amount;
          const newBal = Math.max(0, c.generalSavingsBalance + change);
          const newDeposit = type === 'add' ? c.totalDeposit + amount : c.totalDeposit;
          const newWithdrawal = type === 'deduct' ? c.totalWithdrawal + amount : c.totalWithdrawal;
          return {
            ...c,
            generalSavingsBalance: newBal,
            totalDeposit: newDeposit,
            totalWithdrawal: newWithdrawal,
          };
        }
        return c;
      })
    );

    showToast(
      lang === 'bn'
        ? `হিসাব এডজাস্টমেন্ট সফল: ৳ ${amount} (${type === 'add' ? 'যোগ' : 'কর্তন'})`
        : `Balance Adjusted: BDT ${amount} (${type === 'add' ? 'Added' : 'Deducted'})`,
      'success'
    );
    logAuditAction(
      `কাস্টমার ব্যালেন্স সমন্বয় (${type})`,
      `Customer Balance Adjustment (${type})`,
      'কাস্টমার ডাইরেক্টরি',
      'Customer Directory',
      `Customer ID: ${customerId}, Amount: ${amount}, Reason: ${reason}`
    );
  };

  // Payment Channels
  const addPaymentChannel = (chan: Omit<PaymentChannel, 'id'>) => {
    const newP: PaymentChannel = { ...chan, id: 'pay-' + Date.now() };
    setPaymentChannels((prev) => [...prev, newP]);
    showToast(lang === 'bn' ? 'নতুন পেমেন্ট চ্যানেল তৈরি হয়েছে' : 'Payment Channel Added', 'success');
  };

  const updatePaymentChannel = (chan: PaymentChannel) => {
    setPaymentChannels((prev) => prev.map((p) => (p.id === chan.id ? chan : p)));
    showToast(lang === 'bn' ? 'পেমেন্ট চ্যানেল আপডেট হয়েছে' : 'Payment Channel Updated', 'success');
  };

  const deletePaymentChannel = (id: string) => {
    setPaymentChannels((prev) => prev.filter((p) => p.id !== id));
    showToast(lang === 'bn' ? 'পেমেন্ট চ্যানেল মুছে ফেলা হয়েছে' : 'Payment Channel Deleted', 'info');
  };

  // Investments
  const addInvestment = (invData: Omit<Investment, 'id' | 'accumulatedProfit' | 'status' | 'manualAdjustments'>) => {
    const grossProfit = (invData.principalAmount * invData.interestRatePct) / 100;
    const vat = (grossProfit * invData.annualGovVatPct) / 100;
    const netProfit = grossProfit - vat;

    const newInv: Investment = {
      ...invData,
      id: 'inv-' + Date.now(),
      netProfitTotal: netProfit,
      accumulatedProfit: 0,
      status: 'active',
      manualAdjustments: [],
    };
    setInvestments((prev) => [...prev, newInv]);
    showToast(lang === 'bn' ? 'নতুন বিনিয়োগ যুক্ত হয়েছে' : 'Investment Created', 'success');
    logAuditAction('নতুন বিনিয়োগ যোগ', 'Added New Investment', 'বিনিয়োগ ব্যবস্থাপনা', 'Asset Management', newInv.titleEn);
  };

  const updateInvestment = (inv: Investment) => {
    setInvestments((prev) => prev.map((i) => (i.id === inv.id ? inv : i)));
    showToast(lang === 'bn' ? 'বিনিয়োগ আপডেট হয়েছে' : 'Investment Updated', 'success');
  };

  const deleteInvestment = (id: string) => {
    setInvestments((prev) => prev.filter((i) => i.id !== id));
    showToast(lang === 'bn' ? 'বিনিয়োগ ডিলেট হয়েছে' : 'Investment Deleted', 'info');
  };

  const adjustInvestmentProfitLoss = (investmentId: string, amount: number, reason: string) => {
    setInvestments((prev) =>
      prev.map((i) => {
        if (i.id === investmentId) {
          const updatedAdj = [
            ...i.manualAdjustments,
            {
              id: 'adj-' + Date.now(),
              amount,
              reason,
              date: new Date().toISOString().split('T')[0],
              byUser: currentUser?.username || 'admin',
            },
          ];
          const newAccumulated = i.accumulatedProfit + amount;
          return {
            ...i,
            accumulatedProfit: newAccumulated,
            manualAdjustments: updatedAdj,
          };
        }
        return i;
      })
    );
    showToast(
      lang === 'bn'
        ? `মুনাফা/ক্ষতি সমন্বয় করা হয়েছে: ৳ ${amount}`
        : `Investment Profit/Loss Adjusted: BDT ${amount}`,
      'success'
    );
  };

  // Institutional Borrowings
  const addBorrowing = (borrData: Omit<InstitutionalBorrowing, 'id' | 'totalPaid' | 'status'>) => {
    const newB: InstitutionalBorrowing = {
      ...borrData,
      id: 'borr-' + Date.now(),
      totalPaid: 0,
      status: 'active',
    };
    setBorrowings((prev) => [...prev, newB]);
    showToast(lang === 'bn' ? 'প্রতিষ্ঠানের গৃহীত ঋণ যুক্ত হয়েছে' : 'Borrowing Record Added', 'success');
  };

  const updateBorrowing = (borr: InstitutionalBorrowing) => {
    setBorrowings((prev) => prev.map((b) => (b.id === borr.id ? borr : b)));
    showToast(lang === 'bn' ? 'গৃহীত ঋণের তথ্য আপডেট হয়েছে' : 'Borrowing Updated', 'success');
  };

  const deleteBorrowing = (id: string) => {
    setBorrowings((prev) => prev.filter((b) => b.id !== id));
    showToast(lang === 'bn' ? 'গৃহীত ঋণ ডিলেট হয়েছে' : 'Borrowing Deleted', 'info');
  };

  const toggleBorrowingVisibility = (id: string) => {
    setBorrowings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, visibleToSubUsers: !b.visibleToSubUsers } : b))
    );
    showToast(lang === 'bn' ? 'ভিজিবিলিটি সেটিংস পরিবর্তন করা হয়েছে' : 'Visibility Toggled', 'info');
  };

  // Packages & Schemes
  const addPackage = (pkg: Omit<SchemePackage, 'id'>) => {
    const newP: SchemePackage = { ...pkg, id: 'pkg-' + Date.now(), joinedCustomerCount: 0, totalCollectedAmount: 0 };
    setPackages((prev) => [...prev, newP]);
    showToast(lang === 'bn' ? 'নতুন স্কিম প্যাকেজ তৈরি হয়েছে' : 'Package Scheme Created', 'success');
  };

  const updatePackage = (pkg: SchemePackage) => {
    setPackages((prev) => prev.map((p) => (p.id === pkg.id ? pkg : p)));
    showToast(lang === 'bn' ? 'প্যাকেজের তথ্য আপডেট হয়েছে' : 'Package Updated', 'success');
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    showToast(lang === 'bn' ? 'প্যাকেজ ডিলেট হয়েছে' : 'Package Deleted', 'info');
  };

  const joinPackage = (
    customerId: string,
    packageId: string,
    sharesCount: number,
    details?: { paymentMethod?: string; paymentChannelId?: string; trxId?: string; notes?: string }
  ) => {
    const targetPkg = packages.find((p) => p.id === packageId);
    if (!targetPkg) return;

    const unitPrice = targetPkg.pricePerShare || targetPkg.minAmount || 1000;
    const totalAmount = unitPrice * sharesCount;

    const cust = customers.find((c) => c.id === customerId);
    const isSelfCustomer = currentUser?.role === 'customer';

    const newJoined: JoinedCustomerPackage = {
      id: 'jp-' + Date.now(),
      customerId,
      customerNameBn: cust?.nameBn || currentUser?.nameBn || 'সম্মানিত গ্রাহক',
      customerNameEn: cust?.nameEn || currentUser?.nameEn || 'Valued Customer',
      customerMobile: cust?.mobile || currentUser?.mobile || '',
      packageId,
      branchId: cust?.branchId || currentUser?.branchId || 'br-1',
      sharesCount,
      totalAmount,
      startDate: new Date().toISOString().split('T')[0],
      maturityDate: new Date(Date.now() + (targetPkg.tenureMonths || 12) * 30 * 86400000).toISOString().split('T')[0],
      nextDueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      totalPaid: isSelfCustomer ? 0 : totalAmount,
      paymentMethod: details?.paymentMethod || 'অফিস / ক্যাশ কাউন্টার',
      trxId: details?.trxId || '',
      notes: details?.notes || '',
      status: isSelfCustomer ? 'pending' : 'active',
      appliedDate: new Date().toISOString().split('T')[0],
      approvedDate: isSelfCustomer ? undefined : new Date().toISOString().split('T')[0],
      approvedBy: isSelfCustomer ? undefined : (currentUser?.username || 'admin'),
    };

    setJoinedPackages((prev) => [newJoined, ...prev]);

    // If active (admin added), update package counters directly
    if (!isSelfCustomer) {
      setPackages((prev) =>
        prev.map((p) =>
          p.id === packageId
            ? {
                ...p,
                joinedCustomerCount: (p.joinedCustomerCount || 0) + 1,
                totalCollectedAmount: (p.totalCollectedAmount || 0) + totalAmount,
              }
            : p
        )
      );
    }

    logAuditAction(
      isSelfCustomer ? 'প্যাকেজে যুক্ত হওয়ার আবেদন' : 'গ্রাহক প্যাকেজে যুক্ত করা',
      isSelfCustomer ? 'Package Join Request Submitted' : 'Customer Enrolled in Package',
      'প্যাকেজ ও স্কিম',
      'Package Schemes',
      `Customer: ${cust?.nameBn || customerId}, Package: ${targetPkg.titleBn}, Amount: ৳ ${totalAmount}`
    );

    showToast(
      lang === 'bn'
        ? isSelfCustomer
          ? 'প্যাকেজে যুক্ত হওয়ার আবেদন সফলভাবে পাঠানো হয়েছে! অ্যাডমিন প্যানেলে অনুমোদনের অপেক্ষায় আছে।'
          : 'গ্রাহককে সফলভাবে প্যাকেজে যুক্ত করা হয়েছে!'
        : isSelfCustomer
        ? 'Package enrollment request submitted! Awaiting admin approval.'
        : 'Successfully Enrolled Customer!',
      'success'
    );
  };

  const reviewJoinedPackage = (joinedId: string, status: 'active' | 'cancelled') => {
    const target = joinedPackages.find((j) => j.id === joinedId);
    if (!target) return;

    setJoinedPackages((prev) =>
      prev.map((j) =>
        j.id === joinedId
          ? {
              ...j,
              status,
              totalPaid: status === 'active' ? (j.totalPaid > 0 ? j.totalPaid : j.totalAmount) : j.totalPaid,
              approvedDate: new Date().toISOString().split('T')[0],
              approvedBy: currentUser?.username || 'admin',
            }
          : j
      )
    );

    if (status === 'active') {
      setPackages((prev) =>
        prev.map((p) =>
          p.id === target.packageId
            ? {
                ...p,
                joinedCustomerCount: (p.joinedCustomerCount || 0) + 1,
                totalCollectedAmount: (p.totalCollectedAmount || 0) + target.totalAmount,
              }
            : p
        )
      );
    }

    showToast(
      lang === 'bn'
        ? `প্যাকেজ আবেদন ${status === 'active' ? 'অনুমোদিত ও সক্রিয়' : 'বাতিল'} করা হয়েছে`
        : `Package Request ${status === 'active' ? 'Approved & Activated' : 'Cancelled'}`,
      status === 'active' ? 'success' : 'info'
    );
    logAuditAction(
      `প্যাকেজ আবেদন ${status === 'active' ? 'অনুমোদন' : 'বাতিল'}`,
      `Package Request ${status === 'active' ? 'Approved' : 'Cancelled'}`,
      'প্যাকেজ ও স্কিম',
      'Package Schemes',
      `Joined ID: ${joinedId}, Status: ${status}`
    );
  };

  const submitSavingsDepositRequest = (data: Omit<GeneralSavingsRequest, 'id' | 'type' | 'status' | 'createdAt'>) => {
    const newReq: GeneralSavingsRequest = {
      ...data,
      id: 'gs-req-' + Date.now(),
      type: 'deposit',
      status: 'pending',
      createdAt: new Date().toLocaleString(),
    };
    setSavingsRequests((prev) => [newReq, ...prev]);
    showToast(
      lang === 'bn' ? 'সাধারণ সঞ্চয়ে টাকা জমার রিকোয়েস্ট সফলভাবে জমা হয়েছে' : 'Savings Deposit Request Submitted',
      'success'
    );
    logAuditAction(
      'সাধারণ সঞ্চয় জমা রিকোয়েস্ট',
      'Savings Deposit Request',
      'সাধারণ সঞ্চয়',
      'General Savings',
      `Customer: ${data.customerNameBn}, Amount: ৳ ${data.amount}`
    );
  };

  const submitSavingsWithdrawalRequest = (data: Omit<GeneralSavingsRequest, 'id' | 'type' | 'status' | 'createdAt'>) => {
    const newReq: GeneralSavingsRequest = {
      ...data,
      id: 'gs-req-' + Date.now(),
      type: 'withdrawal',
      status: 'pending',
      createdAt: new Date().toLocaleString(),
    };
    setSavingsRequests((prev) => [newReq, ...prev]);
    showToast(
      lang === 'bn' ? 'সাধারণ সঞ্চয় থেকে টাকা উত্তোলনের রিকোয়েস্ট জমা হয়েছে' : 'Savings Withdrawal Request Submitted',
      'success'
    );
    logAuditAction(
      'সাধারণ সঞ্চয় উত্তোলন রিকোয়েস্ট',
      'Savings Withdrawal Request',
      'সাধারণ সঞ্চয়',
      'General Savings',
      `Customer: ${data.customerNameBn}, Amount: ৳ ${data.amount}`
    );
  };

  const reviewSavingsRequest = (reqId: string, status: 'approved' | 'rejected') => {
    const req = savingsRequests.find((r) => r.id === reqId);
    if (!req) return;

    if (status === 'approved') {
      if (req.type === 'deposit') {
        adjustCustomerBalance(
          req.customerId,
          req.amount,
          'add',
          `সাধারণ সঞ্চয় ডিপোজিট রিকোয়েস্ট অনুমোদন (চ্যানেল: ${req.channelNameBn || 'সরাসরি'}, TrxID: ${req.transactionId || 'N/A'})`
        );
      } else if (req.type === 'withdrawal') {
        adjustCustomerBalance(
          req.customerId,
          req.amount,
          'deduct',
          `সাধারণ সঞ্চয় উত্তোলন রিকোয়েস্ট অনুমোদন (${req.payoutMethod || 'ক্যাশ'} - ${req.payoutAccount || 'সরাসরি'})`
        );
      }
    }

    setSavingsRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status,
              reviewedBy: currentUser?.username || 'admin',
              reviewedAt: new Date().toLocaleString(),
            }
          : r
      )
    );

    showToast(
      lang === 'bn'
        ? `সাধারণ সঞ্চয় রিকোয়েস্ট ${status === 'approved' ? 'অনুমোদিত ও সম্পন্ন' : 'বাতিল'} হয়েছে`
        : `Savings Request ${status === 'approved' ? 'Approved & Completed' : 'Rejected'}`,
      status === 'approved' ? 'success' : 'info'
    );
    logAuditAction(
      `সাধারণ সঞ্চয় রিকোয়েস্ট ${status === 'approved' ? 'অনুমোদন' : 'বাতিল'}`,
      `Savings Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      'সাধারণ সঞ্চয়',
      'General Savings',
      `Req ID: ${reqId}, Type: ${req.type}, Amount: ৳ ${req.amount}`
    );
  };

  const applyForLoan = (customerId: string, packageId: string, amount: number, tenure: number) => {
    const targetPkg = packages.find((p) => p.id === packageId);
    const baseInterest = targetPkg?.interestRatePct || 12;
    const vat = targetPkg?.annualGovVatPct || 10;
    const netInterest = baseInterest + (baseInterest * vat) / 100;

    const totalInterestAmount = (amount * netInterest * (tenure / 12)) / 100;
    const totalRepayable = amount + totalInterestAmount;
    const monthlyInst = totalRepayable / tenure;

    const cust = customers.find((c) => c.id === customerId);

    const newApp: CustomerLoanApplication = {
      id: 'loan-app-' + Date.now(),
      customerId,
      customerNameBn: cust?.nameBn || 'গ্রাহক',
      customerNameEn: cust?.nameEn || 'Customer',
      packageId,
      branchId: cust?.branchId || 'br-1',
      requestedAmount: amount,
      tenureMonths: tenure,
      interestRatePct: baseInterest,
      annualGovVatPct: vat,
      totalRepayable: Math.round(totalRepayable),
      monthlyInstallment: Math.round(monthlyInst),
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      repaidAmount: 0,
    };

    setLoans((prev) => [newApp, ...prev]);
    showToast(lang === 'bn' ? 'লোনের আবেদন জমা হয়েছে' : 'Loan Application Submitted', 'success');
  };

  const reviewLoan = (loanId: string, status: 'approved' | 'rejected') => {
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status,
              reviewedBy: currentUser?.username || 'admin',
              reviewDate: new Date().toISOString().split('T')[0],
              nextInstallmentDate: status === 'approved' ? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] : undefined,
            }
          : l
      )
    );
    showToast(
      lang === 'bn'
        ? `লোনের আবেদন ${status === 'approved' ? 'অনুমোদিত' : 'বাতিল'} হয়েছে`
        : `Loan Application ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      status === 'approved' ? 'success' : 'info'
    );
  };

  const sendCustomerMessage = (customerId: string, message: string, subject?: string, replyToId?: string) => {
    let senderDisplayName = 'অফিস প্রশাসন';
    let roleType = currentUser?.role || 'staff';
    
    if (currentUser) {
      if (currentUser.role === 'super_admin') {
        senderDisplayName = `${currentUser.nameBn} (সুপার অ্যাডমিন)`;
      } else if (currentUser.role === 'branch_manager') {
        senderDisplayName = `${currentUser.nameBn} (শাখা ব্যবস্থাপক)`;
      } else if (currentUser.role === 'staff') {
        senderDisplayName = `${currentUser.nameBn} (অফিস স্টাফ)`;
      } else {
        senderDisplayName = currentUser.nameBn;
      }
    }

    const newMsg: CustomerMessage = {
      id: 'msg-' + Date.now(),
      customerId,
      senderId: currentUser?.id,
      senderName: senderDisplayName,
      senderRole: roleType,
      subject: subject?.trim() || undefined,
      message: message.trim(),
      sentAt: new Date().toLocaleString(),
      createdAt: new Date().toISOString(),
      isRead: false,
      replyToId: replyToId || undefined,
    };

    setCustomerMessages((prev) => [newMsg, ...prev]);

    const isCust = currentUser?.role === 'customer';
    showToast(
      lang === 'bn'
        ? (isCust ? 'আপনার বার্তা/রিপ্লাই সফলভাবে পাঠানো হয়েছে' : 'কাস্টমারকে বার্তা সফলভাবে পাঠানো হয়েছে')
        : 'Message Sent Successfully',
      'success'
    );

    logAuditAction(
      isCust ? 'গ্রাহক বার্তা প্রেরণ' : 'গ্রাহককে বার্তা প্রেরণ',
      isCust ? 'Customer Sent Message' : 'Admin Sent Message to Customer',
      'ইনবক্স ও বার্তা',
      'Inbox & Messaging',
      `Sender: ${senderDisplayName}, Customer ID: ${customerId}`
    );
  };

  const replyToCustomerMessage = (customerId: string, message: string, replyToId?: string) => {
    sendCustomerMessage(customerId, message, undefined, replyToId);
  };

  const markMessageAsRead = (messageId: string) => {
    setCustomerMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
    );
  };

  const markAllCustomerMessagesAsRead = (customerId: string) => {
    setCustomerMessages((prev) =>
      prev.map((m) => (m.customerId === customerId ? { ...m, isRead: true } : m))
    );
  };

  const deleteCustomerMessage = (messageId: string) => {
    setCustomerMessages((prev) => prev.filter((m) => m.id !== messageId));
    showToast(lang === 'bn' ? 'বার্তা মুছে ফেলা হয়েছে' : 'Message Deleted', 'info');
  };

  // Support Tickets
  const createTicket = (ticketData: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'replies'>) => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newT: SupportTicket = {
      ...ticketData,
      id: 't-' + Date.now(),
      ticketNo: 'TK-' + randomNum,
      status: 'pending',
      createdAt: new Date().toLocaleString(),
      replies: [],
    };
    setSupportTickets((prev) => [newT, ...prev]);
    showToast(lang === 'bn' ? `অভিযোগ/টিকিট জমা হয়েছে (#TK-${randomNum})` : `Ticket Submitted (#TK-${randomNum})`, 'success');
  };

  const replyTicket = (ticketId: string, message: string) => {
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const newRep = {
            id: 'rep-' + Date.now(),
            userName: currentUser ? `${currentUser.nameBn} (${currentUser.role})` : 'System',
            role: currentUser?.role || 'staff',
            message,
            createdAt: new Date().toLocaleString(),
          };
          return {
            ...t,
            status: t.status === 'pending' ? 'in_progress' : t.status,
            replies: [...t.replies, newRep],
          };
        }
        return t;
      })
    );
    showToast(lang === 'bn' ? 'উত্তর প্রদান করা হয়েছে' : 'Reply Posted', 'success');
  };

  const updateTicketStatus = (ticketId: string, status: 'pending' | 'in_progress' | 'solved') => {
    setSupportTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status } : t)));
    showToast(lang === 'bn' ? 'টিকিটের স্ট্যাটাস পরিবর্তিত হয়েছে' : 'Ticket Status Updated', 'info');
  };

  const deleteTicket = (ticketId: string) => {
    setSupportTickets((prev) => prev.filter((t) => t.id !== ticketId));
    showToast(lang === 'bn' ? 'টিকিট মুছে ফেলা হয়েছে' : 'Ticket Deleted', 'info');
  };

  // KYC
  const saveKyc = (kycData: Omit<KycRecord, 'id' | 'updatedAt'>) => {
    const existing = kycRecords.find((k) => k.customerId === kycData.customerId);
    if (existing) {
      setKycRecords((prev) =>
        prev.map((k) => (k.id === existing.id ? { ...kycData, id: existing.id, updatedAt: new Date().toISOString().split('T')[0] } : k))
      );
    } else {
      const newKyc: KycRecord = {
        ...kycData,
        id: 'kyc-' + Date.now(),
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setKycRecords((prev) => [...prev, newKyc]);
    }

    // Update customer KYC status
    setCustomers((prev) =>
      prev.map((c) => (c.id === kycData.customerId ? { ...c, kycStatus: kycData.status } : c))
    );

    showToast(lang === 'bn' ? 'কেওয়াইসি ফর্ম সংরক্ষিত হয়েছে' : 'KYC Record Saved', 'success');
  };

  const reviewKyc = (kycId: string, status: 'approved' | 'rejected', reason?: string) => {
    setKycRecords((prev) =>
      prev.map((k) => {
        if (k.id === kycId) {
          // Sync customer KYC status
          setCustomers((custs) => custs.map((c) => (c.id === k.customerId ? { ...c, kycStatus: status } : c)));
          return { ...k, status, rejectionReason: reason, updatedAt: new Date().toISOString().split('T')[0] };
        }
        return k;
      })
    );
    showToast(
      lang === 'bn'
        ? `কেওয়াইসি ${status === 'approved' ? 'অনুমোদিত' : 'বাতিল'} করা হয়েছে`
        : `KYC ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      status === 'approved' ? 'success' : 'info'
    );
  };

  const deleteKyc = (kycId: string) => {
    const target = kycRecords.find((k) => k.id === kycId);
    if (target) {
      setCustomers((custs) =>
        custs.map((c) => (c.id === target.customerId ? { ...c, kycStatus: 'pending' } : c))
      );
    }
    setKycRecords((prev) => prev.filter((k) => k.id !== kycId));
    showToast(lang === 'bn' ? 'কেওয়াইসি ফর্ম মুছে ফেলা হয়েছে' : 'KYC Record Deleted', 'info');
  };

  // Adjustment Requests
  const submitAdjustmentRequest = (reqData: Omit<AdjustmentRequest, 'id' | 'status' | 'createdAt'>) => {
    const newReq: AdjustmentRequest = {
      ...reqData,
      id: 'adj-req-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toLocaleString(),
    };
    setAdjustmentRequests((prev) => [newReq, ...prev]);
    showToast(lang === 'bn' ? 'পেমেন্ট এডজাস্টমেন্ট রিকোয়েস্ট জমা হয়েছে' : 'Adjustment Request Submitted', 'success');
  };

  const reviewAdjustmentRequest = (reqId: string, status: 'approved' | 'rejected') => {
    const req = adjustmentRequests.find((r) => r.id === reqId);
    if (!req) return;

    if (status === 'approved') {
      // Auto-update customer balance / package deposits
      adjustCustomerBalance(req.customerId, req.amount, 'add', `Approved Adjustment Req (${req.transactionId})`);
    }

    setAdjustmentRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status, reviewedBy: currentUser?.username || 'staff' } : r))
    );

    showToast(
      lang === 'bn'
        ? `এডজাস্টমেন্ট রিকোয়েস্ট ${status === 'approved' ? 'অনুমোদিত ও অ্যাকাউন্টে জমা' : 'বাতিল'} হয়েছে`
        : `Adjustment Request ${status === 'approved' ? 'Approved & Credited' : 'Rejected'}`,
      status === 'approved' ? 'success' : 'info'
    );
  };

  // Official Notice Board Operations
  const addNotice = (noticeData: Omit<OfficialNotice, 'id' | 'createdAt' | 'readByUserIds' | 'viewCount'>) => {
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(10 + Math.random() * 90);
    const scopePrefix = noticeData.scope === 'global' ? 'HO' : noticeData.scope === 'institution' ? 'INST' : 'BR';
    const autoMemo = noticeData.memoNo?.trim() || `SFMS/${scopePrefix}/CIR/${year}/${randomSeq}`;

    const newNotice: OfficialNotice = {
      ...noticeData,
      id: 'not-' + Date.now(),
      memoNo: autoMemo,
      viewCount: 1,
      readByUserIds: currentUser ? [currentUser.id] : [],
      createdAt: new Date().toLocaleString(),
    };

    setNotices((prev) => [newNotice, ...prev]);

    showToast(
      lang === 'bn' ? 'অফিসিয়াল বিজ্ঞপ্তি সফলভাবে প্রকাশিত হয়েছে' : 'Official Notice Published Successfully',
      'success'
    );

    logAuditAction(
      'অফিসিয়াল নোটিশ প্রকাশ',
      'Published Official Notice',
      'নোটিশ বোর্ড',
      'Notice Board',
      `Memo: ${autoMemo}, Title: ${noticeData.titleBn}, Scope: ${noticeData.scope}`
    );
  };

  const updateNotice = (notice: OfficialNotice) => {
    setNotices((prev) => prev.map((n) => (n.id === notice.id ? notice : n)));
    showToast(
      lang === 'bn' ? 'নোটিশ সফলভাবে আপডেট করা হয়েছে' : 'Notice Updated Successfully',
      'success'
    );
    logAuditAction(
      'নোটিশ আপডেট',
      'Updated Notice',
      'নোটিশ বোর্ড',
      'Notice Board',
      `Memo: ${notice.memoNo}, Title: ${notice.titleBn}`
    );
  };

  const deleteNotice = (noticeId: string) => {
    const target = notices.find((n) => n.id === noticeId);
    if (!target) return;

    if (
      currentUser?.role !== 'super_admin' &&
      target.publishedBy !== currentUser?.nameBn &&
      target.publishedBy !== currentUser?.nameEn
    ) {
      showToast(
        lang === 'bn' ? 'আপনার এই নোটিশ মুছে ফেলার অনুমতি নেই' : 'Unauthorized to delete this notice',
        'error'
      );
      return;
    }

    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    showToast(lang === 'bn' ? 'নোটিশ সফলভাবে মুছে ফেলা হয়েছে' : 'Notice Deleted', 'info');
    logAuditAction(
      'নোটিশ মুছে ফেলা',
      'Deleted Notice',
      'নোটিশ বোর্ড',
      'Notice Board',
      `Memo: ${target.memoNo}, Title: ${target.titleBn}`
    );
  };

  const markNoticeAsRead = (noticeId: string) => {
    if (!currentUser) return;
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id === noticeId) {
          const reads = n.readByUserIds || [];
          if (!reads.includes(currentUser.id)) {
            return {
              ...n,
              readByUserIds: [...reads, currentUser.id],
              viewCount: (n.viewCount || 0) + 1,
            };
          }
        }
        return n;
      })
    );
  };

  const markAllNoticesAsRead = () => {
    if (!currentUser) return;
    setNotices((prev) =>
      prev.map((n) => {
        const reads = n.readByUserIds || [];
        if (!reads.includes(currentUser.id)) {
          return {
            ...n,
            readByUserIds: [...reads, currentUser.id],
          };
        }
        return n;
      })
    );
    showToast(
      lang === 'bn' ? 'সকল নোটিশ পঠিত হিসেবে চিহ্নিত করা হয়েছে' : 'All notices marked as read',
      'info'
    );
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      logoSvg: newSettings.logoSvg !== undefined ? resolveLogo(newSettings.logoSvg) : prev.logoSvg,
      developerName: FIXED_DEVELOPER_NAME,
      developerPoweredBy: FIXED_DEVELOPER_POWERED_BY,
      developerWebsite: FIXED_DEVELOPER_WEBSITE,
    }));
    showToast(lang === 'bn' ? 'ওয়েবসাইট সেটিংস সংরক্ষিত হয়েছে' : 'Settings Updated', 'success');
  };

  const restoreFullBackup = (backupPayload: any): boolean => {
    try {
      const data = backupPayload?.data || backupPayload;
      if (!data || !Array.isArray(data.users || data.customers)) {
        showToast(lang === 'bn' ? 'অকার্যকর ব্যাকআপ ফাইল ফরম্যাট' : 'Invalid backup file format', 'error');
        return false;
      }

      if (data.users) setUsers(data.users);
      if (data.institutions) setInstitutions(data.institutions);
      if (data.branches) setBranches(data.branches);
      if (data.customers) setCustomers(data.customers);
      if (data.paymentChannels) setPaymentChannels(data.paymentChannels);
      if (data.investments) setInvestments(data.investments);
      if (data.borrowings) setBorrowings(data.borrowings);
      if (data.packages) setPackages(data.packages);
      if (data.joinedPackages) setJoinedPackages(data.joinedPackages);
      if (data.loans) setLoans(data.loans);
      if (data.supportTickets) setSupportTickets(data.supportTickets);
      if (data.kycRecords) setKycRecords(data.kycRecords);
      if (data.adjustmentRequests) setAdjustmentRequests(data.adjustmentRequests);
      if (data.notices) setNotices(data.notices);
      if (data.settings) {
        setSettings({
          ...data.settings,
          developerName: FIXED_DEVELOPER_NAME,
          developerPoweredBy: FIXED_DEVELOPER_POWERED_BY,
          developerWebsite: FIXED_DEVELOPER_WEBSITE,
        });
      }

      // Auto-sync the restored state to Firestore
      setTimeout(() => {
        syncAllDataToFirebase();
      }, 500);

      showToast(
        lang === 'bn'
          ? 'সফলভাবে গুগল ড্রাইভ ব্যাকআপ থেকে সম্পূর্ণ ডাটাবেস রিস্টোর করা হয়েছে!'
          : 'Database successfully restored from backup snapshot!',
        'success'
      );
      logAuditAction(
        'ডাটাবেস রিস্টোর সম্পন্ন',
        'Database Restored from Drive',
        'ব্যাকআপ ও রিস্টোর',
        'Backup & Restore',
        `Restored by: ${currentUser?.username || 'admin'}`
      );
      return true;
    } catch (err) {
      console.error('Failed to restore backup:', err);
      showToast(lang === 'bn' ? 'ডাটাবেস রিস্টোরে ত্রুটি ঘটেছে' : 'Failed to restore backup snapshot', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        lang,
        darkMode,
        settings,
        users,
        institutions,
        branches,
        customers,
        paymentChannels,
        investments,
        borrowings,
        packages,
        joinedPackages,
        savingsRequests,
        loans,
        supportTickets,
        kycRecords,
        adjustmentRequests,
        customerMessages,
        notices,
        auditLogs,
        toastMessage,
        firebaseConnected,
        isFirebaseSyncing,

        login,
        quickLogin,
        logout,
        registerMember,
        toggleLanguage,
        toggleDarkMode,
        setDemoMode,
        showToast,
        syncAllDataToFirebase,
        checkFirebaseStatus,

        // Notices
        addNotice,
        updateNotice,
        deleteNotice,
        markNoticeAsRead,
        markAllNoticesAsRead,

        addInstitution,
        updateInstitution,
        deleteInstitution,

        addBranch,
        updateBranch,
        deleteBranch,

        addUser,
        updateUser,
        deleteUser,

        addCustomer,
        updateCustomer,
        deleteCustomer,
        transferCustomerBranch,
        adjustCustomerBalance,
        sendCustomerMessage,
        replyToCustomerMessage,
        markMessageAsRead,
        markAllCustomerMessagesAsRead,
        deleteCustomerMessage,
        activeBranchId,
        setActiveBranchId,
        activeInstitutionId,
        setActiveInstitutionId,
        getUserAccessibleBranches,
        getAccessibleNotices,
        saveUserSignatureProfile,

        addPaymentChannel,
        updatePaymentChannel,
        deletePaymentChannel,

        addInvestment,
        updateInvestment,
        deleteInvestment,
        adjustInvestmentProfitLoss,

        addBorrowing,
        updateBorrowing,
        deleteBorrowing,
        toggleBorrowingVisibility,

        addPackage,
        updatePackage,
        deletePackage,

        joinPackage,
        reviewJoinedPackage,
        applyForLoan,
        reviewLoan,

        submitSavingsDepositRequest,
        submitSavingsWithdrawalRequest,
        reviewSavingsRequest,

        createTicket,
        replyTicket,
        updateTicketStatus,
        deleteTicket,

        saveKyc,
        reviewKyc,
        deleteKyc,

        submitAdjustmentRequest,
        reviewAdjustmentRequest,

        updateSettings,
        restoreFullBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

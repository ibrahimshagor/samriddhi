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
  AuditLog,
  SystemSettings,
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
  initialLoans,
  initialTickets,
  initialKycRecords,
  initialAdjustmentRequests,
  initialAuditLogs,
  initialSettings,
} from '../data/mockData';

import {
  syncDocToFirestore,
  deleteDocFromFirestore,
  syncAllToFirestore,
  loadFromFirestore,
} from '../lib/firestoreSync';
import { testFirestoreConnection, firebaseConfig } from '../lib/firebase';

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
  loans: CustomerLoanApplication[];
  supportTickets: SupportTicket[];
  kycRecords: KycRecord[];
  adjustmentRequests: AdjustmentRequest[];
  customerMessages: CustomerMessage[];
  auditLogs: AuditLog[];
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  firebaseConnected: boolean;
  isFirebaseSyncing: boolean;

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
  adjustCustomerBalance: (customerId: string, amount: number, type: 'add' | 'deduct', reason: string) => void;
  sendCustomerMessage: (customerId: string, message: string) => void;

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

  joinPackage: (customerId: string, packageId: string, sharesCount: number) => void;
  applyForLoan: (customerId: string, packageId: string, amount: number, tenure: number) => void;
  reviewLoan: (loanId: string, status: 'approved' | 'rejected') => void;

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smf_user');
    return saved ? JSON.parse(saved) : initialUsers[0]; // Default logged in as Super Admin for direct smooth start
  });

  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('smf_lang') as Language) || 'bn';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('smf_dark') === 'true';
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('smf_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [institutions, setInstitutions] = useState<Institution[]>(initialInstitutions);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>(initialPaymentChannels);
  const [investments, setInvestments] = useState<Investment[]>(initialInvestments);
  const [borrowings, setBorrowings] = useState<InstitutionalBorrowing[]>(initialBorrowings);
  const [packages, setPackages] = useState<SchemePackage[]>(initialPackages);
  const [joinedPackages, setJoinedPackages] = useState<JoinedCustomerPackage[]>(initialJoinedPackages);
  const [loans, setLoans] = useState<CustomerLoanApplication[]>(initialLoans);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(initialTickets);
  const [kycRecords, setKycRecords] = useState<KycRecord[]>(initialKycRecords);
  const [adjustmentRequests, setAdjustmentRequests] = useState<AdjustmentRequest[]>(initialAdjustmentRequests);
  const [customerMessages, setCustomerMessages] = useState<CustomerMessage[]>(() => {
    const saved = localStorage.getItem('smf_cust_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 'msg-1',
        customerId: 'cust-1',
        senderName: 'সুপার এডমিন (অফিস)',
        senderRole: 'super_admin',
        message: 'আপনার চলতি মাসের সঞ্চয় কিস্তি সফলভাবে গৃহিত হয়েছে। ধন্যবাদ।',
        sentAt: new Date().toLocaleString(),
        isRead: false,
      }
    ];
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(false);

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
    showToast(lang === 'bn' ? 'ইউজার তথ্য আপডেট হয়েছে' : 'User Updated', 'success');
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
    setCustomers((prev) => prev.map((c) => (c.id === cust.id ? cust : c)));
    showToast(lang === 'bn' ? 'গ্রাহকের তথ্য আপডেট হয়েছে' : 'Customer Updated', 'success');
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast(lang === 'bn' ? 'গ্রাহক মুছে ফেলা হয়েছে' : 'Customer Deleted', 'info');
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

  const joinPackage = (customerId: string, packageId: string, sharesCount: number) => {
    const targetPkg = packages.find((p) => p.id === packageId);
    if (!targetPkg) return;

    const unitPrice = targetPkg.pricePerShare || targetPkg.minAmount || 1000;
    const totalAmount = unitPrice * sharesCount;

    const cust = customers.find((c) => c.id === customerId);

    const newJoined: JoinedCustomerPackage = {
      id: 'jp-' + Date.now(),
      customerId,
      packageId,
      branchId: cust?.branchId || 'br-1',
      sharesCount,
      totalAmount,
      startDate: new Date().toISOString().split('T')[0],
      maturityDate: new Date(Date.now() + (targetPkg.tenureMonths || 12) * 30 * 86400000).toISOString().split('T')[0],
      nextDueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      totalPaid: totalAmount,
      status: 'active',
    };

    setJoinedPackages((prev) => [...prev, newJoined]);

    // Update package counters
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

    showToast(lang === 'bn' ? 'সফলভাবে প্যাকেজে যুক্ত হয়েছেন!' : 'Successfully Joined Package!', 'success');
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

  const sendCustomerMessage = (customerId: string, message: string) => {
    const newMsg: CustomerMessage = {
      id: 'msg-' + Date.now(),
      customerId,
      senderName: currentUser ? `${currentUser.nameBn} (${currentUser.role})` : 'অফিস প্রশাসন',
      senderRole: currentUser?.role || 'staff',
      message,
      sentAt: new Date().toLocaleString(),
      isRead: false,
    };
    setCustomerMessages((prev) => [newMsg, ...prev]);
    showToast(lang === 'bn' ? 'কাস্টমারকে ইনবক্স বার্তা পাঠানো হয়েছে' : 'Message Sent to Customer Inbox', 'success');
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

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast(lang === 'bn' ? 'ওয়েবসাইট সেটিংস সংরক্ষিত হয়েছে' : 'Settings Updated', 'success');
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
        loans,
        supportTickets,
        kycRecords,
        adjustmentRequests,
        customerMessages,
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
        adjustCustomerBalance,
        sendCustomerMessage,

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
        applyForLoan,
        reviewLoan,

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

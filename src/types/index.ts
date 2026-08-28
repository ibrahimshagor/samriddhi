export type UserRole = 'super_admin' | 'branch_manager' | 'branch_staff' | 'customer';

export type Language = 'bn' | 'en';

export interface User {
  id: string;
  username: string;
  nameBn: string;
  nameEn: string;
  email: string;
  mobile: string;
  role: UserRole;
  institutionId?: string;
  branchId?: string;
  avatar?: string;
  membershipId: string;
  joiningDate: string;
  status: 'active' | 'inactive' | 'suspended';
  designationBn?: string;
  designationEn?: string;
}

export interface Institution {
  id: string;
  nameBn: string;
  nameEn: string;
  registrationNo: string;
  establishedDate: string;
  centralAddressBn: string;
  centralAddressEn: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  totalBranches?: number;
}

export interface Branch {
  id: string;
  institutionId: string;
  nameBn: string;
  nameEn: string;
  code: string;
  addressBn: string;
  addressEn: string;
  phone: string;
  managerId?: string;
  managerName?: string;
  openingDate: string;
  status: 'active' | 'inactive';
}

export interface Customer {
  id: string;
  userId: string; // Linked User ID
  nameBn: string;
  nameEn: string;
  mobile: string;
  email: string;
  accountNo: string;
  institutionId: string;
  branchId: string;
  generalSavingsBalance: number;
  totalDeposit: number;
  totalWithdrawal: number;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  status: 'active' | 'inactive';
  joinedDate: string;
}

export interface PaymentChannel {
  id: string;
  institutionId?: string; // If null, applies globally
  branchId?: string; // If set, overrides global for this branch
  nameBn: string;
  nameEn: string;
  type: 'bkash' | 'nagad' | 'rocket' | 'cellfin' | 'bank' | 'cash' | 'other';
  accountNo: string;
  accountTypeBn: string;
  accountTypeEn: string;
  instructionsHtml: string;
  isActive: boolean;
  isGlobal: boolean;
  logoUrl?: string;
}

export type InvestmentType =
  | 'fdr'
  | 'dps'
  | 'bank_savings'
  | 'business_fixed'
  | 'business_profit_share'
  | 'gold'
  | 'land'
  | 'mortgage_shop_rent';

export interface Investment {
  id: string;
  type: InvestmentType;
  titleBn: string;
  titleEn: string;
  institutionId: string;
  branchId: string;
  principalAmount: number;
  startDate: string;
  tenureMonths: number;
  maturityDate: string;
  profitCycle: 'monthly' | 'quarterly' | 'four_monthly' | 'semi_annual' | 'annual';
  interestRatePct: number; // e.g. 10%
  annualGovVatPct: number; // e.g. 15% VAT on profit
  estimatedProfit: number;
  netProfitTotal: number;
  accumulatedProfit: number;
  nextPayoutDate: string;
  details: Record<string, any>; // Gold carats, land size, shop details, etc.
  status: 'active' | 'matured' | 'closed';
  manualAdjustments: {
    id: string;
    amount: number; // Positive for profit, negative for loss
    reason: string;
    date: string;
    byUser: string;
  }[];
}

export interface InstitutionalBorrowing {
  id: string;
  lenderNameBn: string;
  lenderNameEn: string;
  principalAmount: number;
  interestRatePct: number;
  annualGovVatPct: number;
  startDate: string;
  tenureMonths: number;
  gracePeriodMonths: number;
  maturityDate: string;
  monthlyInstallment: number;
  totalRepayable: number;
  totalPaid: number;
  nextInstallmentDate: string;
  status: 'active' | 'repaid' | 'defaulted';
  visibleToSubUsers: boolean; // Super admin toggle
}

export type PackageType =
  | 'general_savings'
  | 'cooperative_package'
  | 'fdr'
  | 'dps'
  | 'investment'
  | 'loan';

export interface ExtraSubscriptionFee {
  id: string;
  titleBn: string;
  titleEn: string;
  amount: number;
  dueDate: string;
}

export interface SchemePackage {
  id: string;
  type: PackageType;
  titleBn: string;
  titleEn: string;
  institutionId: string;
  descriptionBn: string;
  descriptionEn: string;
  totalShares?: number;
  pricePerShare?: number;
  tenureMonths?: number;
  paymentCycle?: 'weekly' | 'monthly' | 'semi_annual' | 'annual';
  profitRatePct?: number;
  interestRatePct?: number;
  annualGovVatPct?: number;
  earlyWithdrawalPenaltyPct?: number;
  lateFeeAmount?: number;
  paymentGraceDays?: number;
  extraFees?: ExtraSubscriptionFee[];
  minAmount?: number;
  maxAmount?: number;
  status: 'active' | 'inactive';
  joinedCustomerCount?: number;
  totalCollectedAmount?: number;
}

export interface JoinedCustomerPackage {
  id: string;
  customerId: string;
  packageId: string;
  branchId: string;
  sharesCount: number;
  totalAmount: number;
  startDate: string;
  maturityDate: string;
  nextDueDate: string;
  totalPaid: number;
  status: 'active' | 'matured' | 'cancelled';
}

export interface CustomerLoanApplication {
  id: string;
  customerId: string;
  customerNameBn: string;
  customerNameEn: string;
  packageId: string;
  branchId: string;
  requestedAmount: number;
  tenureMonths: number;
  interestRatePct: number;
  annualGovVatPct: number;
  totalRepayable: number;
  monthlyInstallment: number;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'repaid';
  reviewedBy?: string;
  reviewDate?: string;
  repaidAmount: number;
  nextInstallmentDate?: string;
}

export interface SupportTicket {
  id: string;
  ticketNo?: string;
  customerId: string;
  customerNameBn: string;
  customerNameEn: string;
  branchId: string;
  subjectBn: string;
  subjectEn: string;
  categoryBn: string;
  categoryEn: string;
  message: string;
  paymentRef?: string;
  priority?: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'solved' | 'resolved';
  createdAt: string;
  replies: {
    id: string;
    userName: string;
    role: string;
    message: string;
    createdAt: string;
  }[];
}

export interface CustomerMessage {
  id: string;
  customerId: string;
  senderName: string;
  senderRole: string;
  message: string;
  sentAt: string;
  isRead?: boolean;
}

export interface KycRecord {
  id: string;
  customerId: string;
  photoUrl?: string;
  nidNumber?: string;
  nameBn: string;
  nameEn: string;
  fatherNameBn: string;
  fatherNameEn: string;
  motherNameBn: string;
  motherNameEn: string;
  presentAddressBn: string;
  presentAddressEn: string;
  permanentAddressBn: string;
  permanentAddressEn: string;
  mobile: string;
  email: string;
  signatureDataUrl?: string;
  nomineeNameBn: string;
  nomineeNameEn: string;
  nomineeFatherBn: string;
  nomineeFatherEn: string;
  nomineeMotherBn: string;
  nomineeMotherEn: string;
  nomineeMobile: string;
  nomineeEmail: string;
  nomineeAddressBn: string;
  nomineeAddressEn: string;
  nomineePhotoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  updatedAt: string;
}

export interface AdjustmentRequest {
  id: string;
  customerId: string;
  customerNameBn: string;
  customerNameEn: string;
  branchId: string;
  packageId?: string;
  packageNameBn?: string;
  packageNameEn?: string;
  amount: number;
  paymentDate: string;
  paymentChannelId: string;
  channelNameBn: string;
  channelNameEn: string;
  accountNoUsed: string;
  transactionId: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  performedBy: string;
  role: UserRole;
  actionBn: string;
  actionEn: string;
  moduleBn: string;
  moduleEn: string;
  details: string;
}

export interface CustomerVisibleModules {
  assetInvestments: boolean;
  institutionalBorrowings: boolean;
  reportsAudit: boolean;
  packageSchemes: boolean;
  kycForm: boolean;
  adjustmentRequests: boolean;
  supportComplaints: boolean;
  paymentChannels: boolean;
  institutions: boolean;
  branchManagement: boolean;
}

export interface SystemSettings {
  siteNameBn: string;
  siteNameEn: string;
  noticeBannerBn: string;
  noticeBannerEn: string;
  footerTextBn: string;
  footerTextEn: string;
  developerName: string;
  developerPoweredBy: string;
  developerWebsite: string;
  demoMode: boolean;
  defaultProfitRatePct: number;
  defaultGovVatPct: number;
  generalSavingsInterestPct: number;
  generalSavingsVatPct: number;
  generalSavingsPayoutMonth: number; // 1-12 (e.g. 12 = December)
  customerVisibleModules?: CustomerVisibleModules;
}

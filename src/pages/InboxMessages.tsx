import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Inbox,
  Send,
  Search,
  CheckCircle2,
  Clock,
  User,
  Building2,
  Trash2,
  Plus,
  X,
  MessageSquare,
  ShieldCheck,
  Building,
  UserCheck,
  ChevronRight,
  Filter,
  CheckCheck,
  AlertCircle,
  Phone,
  Sparkles,
} from 'lucide-react';
import { Customer } from '../types';

interface InboxMessagesProps {
  onNavigate?: (menu: string) => void;
  initialCustomerId?: string;
}

export const InboxMessages: React.FC<InboxMessagesProps> = ({
  onNavigate,
  initialCustomerId,
}) => {
  const {
    currentUser,
    lang,
    customers,
    branches,
    customerMessages,
    sendCustomerMessage,
    replyToCustomerMessage,
    markMessageAsRead,
    markAllCustomerMessagesAsRead,
    deleteCustomerMessage,
    activeBranchId,
    getUserAccessibleBranches,
  } = useApp();

  const isCustomer = currentUser?.role === 'customer';
  const myCustomerRecord = isCustomer
    ? customers.find((c) => c.userId === currentUser?.id || c.email === currentUser?.email)
    : null;

  // Accessible branches for multi-branch filtering
  const accessibleBranches = getUserAccessibleBranches ? getUserAccessibleBranches() : [];
  const accessibleBranchIds = accessibleBranches.map((b) => b.id);

  // Filter customers by active branch
  const filteredCustomers = useMemo(() => {
    let list = customers;
    if (currentUser?.role !== 'super_admin' && accessibleBranchIds.length > 0) {
      list = list.filter((c) => accessibleBranchIds.includes(c.branchId));
    }
    if (activeBranchId && activeBranchId !== 'all') {
      list = list.filter((c) => c.branchId === activeBranchId);
    }
    return list;
  }, [customers, currentUser, accessibleBranchIds, activeBranchId]);

  // Selected customer thread for admin/manager/staff
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => {
    if (isCustomer && myCustomerRecord) return myCustomerRecord.id;
    if (initialCustomerId) return initialCustomerId;
    return filteredCustomers[0]?.id || 'cust-1';
  });

  useEffect(() => {
    if (isCustomer && myCustomerRecord) {
      setSelectedCustomerId(myCustomerRecord.id);
    } else if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    }
  }, [isCustomer, myCustomerRecord, initialCustomerId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');
  const [replyText, setReplyText] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  // New Message Form State
  const [newMsgCustomerId, setNewMsgCustomerId] = useState<string>('');
  const [newMsgSubject, setNewMsgSubject] = useState('');
  const [newMsgBody, setNewMsgBody] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group messages by customer thread
  const customerThreads = useMemo(() => {
    const threadMap: Record<
      string,
      {
        customer: Customer | undefined;
        latestMessage: (typeof customerMessages)[0] | undefined;
        unreadCount: number;
        totalCount: number;
      }
    > = {};

    filteredCustomers.forEach((cust) => {
      const msgs = (customerMessages || []).filter((m) => m.customerId === cust.id);
      const unread = msgs.filter((m) => {
        if (isCustomer) {
          return !m.isRead && m.senderRole !== 'customer';
        }
        return !m.isRead && m.senderRole === 'customer';
      }).length;

      const latest = msgs.length > 0 ? msgs[0] : undefined;

      threadMap[cust.id] = {
        customer: cust,
        latestMessage: latest,
        unreadCount: unread,
        totalCount: msgs.length,
      };
    });

    return threadMap;
  }, [filteredCustomers, customerMessages, isCustomer]);

  // Filtered customer list for left sidebar
  const searchedThreads = useMemo(() => {
    return filteredCustomers.filter((cust) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cust.nameBn.toLowerCase().includes(q) ||
        cust.nameEn.toLowerCase().includes(q) ||
        cust.accountNo.toLowerCase().includes(q) ||
        cust.mobile.includes(q);

      const thread = customerThreads[cust.id];
      const matchesFilter = filterType === 'all' || (thread && thread.unreadCount > 0);

      return matchesSearch && matchesFilter;
    });
  }, [filteredCustomers, searchQuery, filterType, customerThreads]);

  // Active Customer Conversation Messages
  const activeMessages = useMemo(() => {
    const targetCustId = isCustomer && myCustomerRecord ? myCustomerRecord.id : selectedCustomerId;
    return (customerMessages || [])
      .filter((m) => m.customerId === targetCustId)
      .slice()
      .reverse(); // Chronological order: oldest to newest
  }, [customerMessages, selectedCustomerId, isCustomer, myCustomerRecord]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // Auto mark messages as read when opening thread
  useEffect(() => {
    const targetCustId = isCustomer && myCustomerRecord ? myCustomerRecord.id : selectedCustomerId;
    if (!targetCustId) return;

    const unreadMsgs = (customerMessages || []).filter((m) => {
      if (m.customerId !== targetCustId || m.isRead) return false;
      if (isCustomer) return m.senderRole !== 'customer';
      return m.senderRole === 'customer';
    });

    unreadMsgs.forEach((m) => {
      markMessageAsRead(m.id);
    });
  }, [selectedCustomerId, isCustomer, myCustomerRecord, customerMessages, markMessageAsRead]);

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId);
  const activeBranch = branches.find((b) => b.id === activeCustomer?.branchId);

  // Send Reply Handler
  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim()) return;

    const targetCustId = isCustomer && myCustomerRecord ? myCustomerRecord.id : selectedCustomerId;
    if (!targetCustId) return;

    replyToCustomerMessage(targetCustId, replyText.trim());
    setReplyText('');
  };

  // Quick Template Replies
  const quickTemplates = isCustomer
    ? [
        { bn: 'ধন্যবাদ, আমি বিষয়টি বুঝতে পেরেছি।', en: 'Thank you, I understand.' },
        { bn: 'আমার সঞ্চয় সংক্রান্ত একটি তথ্য জানতে চাই।', en: 'I want to ask about my savings.' },
        { bn: 'অনুরোধটি দ্রুত সম্পন্ন করার জন্য অনুরোধ করছি।', en: 'Please process my request soon.' },
        { bn: 'আমি অফিসে এসে দেখা করব।', en: 'I will visit the office.' },
      ]
    : [
        { bn: 'আপনার অনুরোধটি সফলভাবে অনুমোদিত হয়েছে।', en: 'Your request has been approved.' },
        { bn: 'আপনার চলতি মাসের কিস্তি সফলভাবে গ্রহণ করা হয়েছে।', en: 'Your monthly installment was received.' },
        { bn: 'প্রয়োজনীয় কাগজপত্র নিয়ে দয়া করে শাখা অফিসে যোগাযোগ করুন।', en: 'Please contact the branch office.' },
        { bn: 'আপনার আবেদনটি বর্তমানে বিবেচনাধীন রয়েছে।', en: 'Your application is under review.' },
      ];

  // Send New Message Modal Submit
  const handleCreateNewMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgBody.trim()) return;

    const targetCustId = isCustomer && myCustomerRecord ? myCustomerRecord.id : newMsgCustomerId;
    if (!targetCustId) return;

    sendCustomerMessage(targetCustId, newMsgBody.trim(), newMsgSubject.trim() || undefined);
    setNewMsgSubject('');
    setNewMsgBody('');
    setNewMsgCustomerId('');
    setShowNewMessageModal(false);
    if (!isCustomer) {
      setSelectedCustomerId(targetCustId);
    }
  };

  // Unread badge for logged-in user
  const totalMyUnread = useMemo(() => {
    if (isCustomer && myCustomerRecord) {
      return (customerMessages || []).filter(
        (m) => m.customerId === myCustomerRecord.id && !m.isRead && m.senderRole !== 'customer'
      ).length;
    }
    return (customerMessages || []).filter((m) => !m.isRead && m.senderRole === 'customer').length;
  }, [customerMessages, isCustomer, myCustomerRecord]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'ইনবক্স ও অফিসিয়াল বার্তা' : 'Inbox & Official Messaging'}
              </h1>
              {totalMyUnread > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white animate-pulse">
                  {totalMyUnread} {lang === 'bn' ? 'অপঠিত' : 'Unread'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isCustomer
                ? lang === 'bn'
                  ? 'সমিতি প্রশাসন ও শাখা অফিসের সাথে নিরাপদ ও সরাসরি যোগাযোগ মাধ্যম'
                  : 'Direct official communication channel with management and branch officers'
                : lang === 'bn'
                ? 'সদস্য গ্রাহকদের সাথে সরাসরি বার্তা আদান-প্রদান ও তাৎক্ষণিক নোটিফিকেশন সিস্টেম'
                : 'Direct messaging and real-time notice center for member customers'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              {isCustomer
                ? lang === 'bn'
                  ? 'অফিসে বার্তা পাঠান'
                  : 'Message Office'
                : lang === 'bn'
                ? 'নতুন বার্তা পাঠান'
                : 'Send New Message'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Inbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] max-h-[80vh]">
        {/* Left Side: Thread Directory (For Admin / Managers / Staff) */}
        {!isCustomer && (
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
            {/* Search and Filters */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'bn' ? 'নাম, মোবাইল বা হিসাব নম্বর...' : 'Search name, mobile, acc...'}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFilterType('all')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    filterType === 'all'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'bn' ? 'সকল বার্তা' : 'All'} ({filteredCustomers.length})
                </button>
                <button
                  onClick={() => setFilterType('unread')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    filterType === 'unread'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'bn' ? 'অপঠিত' : 'Unread'}
                  {totalMyUnread > 0 && ` (${totalMyUnread})`}
                </button>
              </div>
            </div>

            {/* Customer List Threads */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
              {searchedThreads.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  {lang === 'bn' ? 'কোনো গ্রাহক থ্রেড খুঁজে পাওয়া যায়নি' : 'No message threads found'}
                </div>
              ) : (
                searchedThreads.map((cust) => {
                  const thread = customerThreads[cust.id];
                  const isSelected = selectedCustomerId === cust.id;
                  const cBranch = branches.find((b) => b.id === cust.branchId);

                  return (
                    <button
                      key={cust.id}
                      onClick={() => setSelectedCustomerId(cust.id)}
                      className={`w-full p-3.5 text-left transition-all flex items-start gap-3 relative cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                        {cust.nameEn.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                            {lang === 'bn' ? cust.nameBn : cust.nameEn}
                          </p>
                          {thread?.latestMessage && (
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                              {thread.latestMessage.sentAt.split(',')[0]}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{cust.accountNo}</span>
                          <span>•</span>
                          <span className="truncate">{lang === 'bn' ? cBranch?.nameBn : cBranch?.nameEn}</span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-1">
                          {thread?.latestMessage ? (
                            <span>
                              {thread.latestMessage.senderRole === 'customer' ? '👤 ' : '🏢 '}
                              {thread.latestMessage.message}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">
                              {lang === 'bn' ? 'বার্তা শুরু করুন...' : 'Start conversation...'}
                            </span>
                          )}
                        </p>
                      </div>

                      {thread && thread.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {thread.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Right Side: Active Chat View (or Full Width for Customers) */}
        <div
          className={`${
            isCustomer ? 'lg:col-span-12' : 'lg:col-span-8'
          } bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden`}
        >
          {/* Active Chat Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              {isCustomer ? (
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center shadow-xs">
                  <Building className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {(activeCustomer?.nameEn || 'C').charAt(0)}
                </div>
              )}

              <div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  {isCustomer
                    ? lang === 'bn'
                      ? 'সমিতি প্রশাসন ও শাখা অফিস'
                      : 'Society Administration & Branch Office'
                    : lang === 'bn'
                    ? activeCustomer?.nameBn
                    : activeCustomer?.nameEn}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {isCustomer
                      ? lang === 'bn'
                        ? 'অফিসিয়াল চ্যানেল'
                        : 'Official Channel'
                      : activeCustomer?.accountNo}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>
                    {lang === 'bn' ? 'শাখা:' : 'Branch:'}{' '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? activeBranch?.nameBn : activeBranch?.nameEn}
                    </strong>
                  </span>
                  {activeCustomer?.mobile && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {activeCustomer.mobile}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {activeMessages.length > 0 && (
                <button
                  onClick={() => {
                    const targetCustId = isCustomer && myCustomerRecord ? myCustomerRecord.id : selectedCustomerId;
                    markAllCustomerMessagesAsRead(targetCustId);
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                  title={lang === 'bn' ? 'সকল বার্তা পঠিত করুন' : 'Mark All Read'}
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'bn' ? 'সব পঠিত' : 'Mark Read'}</span>
                </button>
              )}

              {!isCustomer && onNavigate && (
                <button
                  onClick={() => onNavigate('customer_directory')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors"
                >
                  {lang === 'bn' ? 'গ্রাহক প্রোফাইল' : 'Profile'}
                </button>
              )}
            </div>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/30 custom-scrollbar">
            {activeMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-400">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 opacity-50" />
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {lang === 'bn' ? 'এখনো কোনো বার্তা আদান-প্রদান হয়নি' : 'No messages exchanged yet'}
                </p>
                <p className="text-[11px] max-w-xs text-slate-400">
                  {isCustomer
                    ? lang === 'bn'
                      ? 'অফিসের সাথে যোগাযোগ করতে নিচের বক্সে বার্তা লিখুন বা নতুন নোটিফিকেশন এর জন্য অপেক্ষা করুন।'
                      : 'Write a message in the box below to communicate with the branch office.'
                    : lang === 'bn'
                    ? 'গ্রাহককে অফিসিয়াল নোটিশ, কিস্তি স্মরণ করিয়ে দেওয়া বা যেকোনো নির্দেশনা পাঠাতে বার্তা লিখুন।'
                    : 'Send notices, payment reminders, or official updates to this member.'}
                </p>
              </div>
            ) : (
              activeMessages.map((msg) => {
                const isSentByCustomer = msg.senderRole === 'customer';
                // For customer view, customer's own messages are on the right (sent), office on left (received)
                // For admin view, admin/staff messages are on right (sent), customer on left (received)
                const isMyMessage = isCustomer ? isSentByCustomer : !isSentByCustomer;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 font-mono">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {msg.senderName}
                      </span>
                      <span>•</span>
                      <span>{msg.sentAt}</span>
                      {msg.subject && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            [{msg.subject}]
                          </span>
                        </>
                      )}
                    </div>

                    <div
                      className={`group relative max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isMyMessage
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.message}</p>

                      {/* Message footer & delete option */}
                      <div className="mt-2 flex items-center justify-between gap-3 text-[10px] opacity-80 pt-1 border-t border-white/20 dark:border-slate-700/60">
                        <span className="font-extrabold text-[9px] uppercase tracking-wider">
                          {isSentByCustomer ? (lang === 'bn' ? 'গ্রাহক বার্তা' : 'Customer Message') : (lang === 'bn' ? 'অফিসিয়াল' : 'Official Notice')}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {currentUser?.role === 'super_admin' && (
                            <button
                              onClick={() => deleteCustomerMessage(msg.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-rose-400"
                              title={lang === 'bn' ? 'বার্তা মুছে ফেলুন' : 'Delete Message'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                          <CheckCheck className={`w-3 h-3 ${msg.isRead ? 'text-emerald-300' : 'opacity-60'}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Response Suggestion Chips */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-[11px]">
            <span className="text-slate-400 font-semibold shrink-0 text-[10px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {lang === 'bn' ? 'দ্রুত উত্তর:' : 'Quick:'}
            </span>
            {quickTemplates.map((t, idx) => (
              <button
                key={idx}
                onClick={() => setReplyText(lang === 'bn' ? t.bn : t.en)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap transition-colors cursor-pointer"
              >
                {lang === 'bn' ? t.bn : t.en}
              </button>
            ))}
          </div>

          {/* Reply Composition Box */}
          <form
            onSubmit={handleSendReply}
            className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-end gap-2"
          >
            <div className="flex-1 min-w-0">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                rows={2}
                placeholder={
                  isCustomer
                    ? lang === 'bn'
                      ? 'অফিসের উদ্দেশ্যে আপনার বার্তা বা উত্তর লিখুন (Enter চাপুন)...'
                      : 'Write your reply to the office (Press Enter to send)...'
                    : lang === 'bn'
                    ? 'সদস্যের জন্য অফিশিয়াল বার্তা বা উত্তর লিখুন...'
                    : 'Type official message or reply for member...'
                }
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!replyText.trim()}
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              title={lang === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Send New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>
                  {isCustomer
                    ? lang === 'bn'
                      ? 'সমিতি কার্যালয়ে নতুন বার্তা পাঠান'
                      : 'Send Message to Society Office'
                    : lang === 'bn'
                    ? 'সদস্য গ্রাহককে নতুন বার্তা প্রেরণ'
                    : 'Send Official Message to Customer'}
                </span>
              </h3>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewMessage} className="space-y-4 text-xs">
              {/* Recipient Selector for Admin */}
              {!isCustomer && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                    {lang === 'bn' ? 'প্রাপক গ্রাহক নির্বাচন করুন *' : 'Select Recipient Customer *'}
                  </label>
                  <select
                    value={newMsgCustomerId}
                    onChange={(e) => setNewMsgCustomerId(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="">{lang === 'bn' ? '-- গ্রাহক নির্বাচন করুন --' : '-- Select Customer --'}</option>
                    {filteredCustomers.map((cust) => (
                      <option key={cust.id} value={cust.id}>
                        {lang === 'bn' ? cust.nameBn : cust.nameEn} ({cust.accountNo}) - {cust.mobile}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  {lang === 'bn' ? 'বার্তার বিষয়/শিরোনাম (ঐচ্ছিক)' : 'Subject / Topic (Optional)'}
                </label>
                <input
                  type="text"
                  value={newMsgSubject}
                  onChange={(e) => setNewMsgSubject(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: সঞ্চয় কিস্তি বা লোন সংক্রান্ত নোটিশ' : 'e.g., Savings installment update'}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  {lang === 'bn' ? 'বার্তার বিস্তারিত বিবরণ *' : 'Message Details *'}
                </label>
                <textarea
                  value={newMsgBody}
                  onChange={(e) => setNewMsgBody(e.target.value)}
                  required
                  rows={4}
                  placeholder={lang === 'bn' ? 'আপনার বার্তা বা নোটিশটি এখানে লিখুন...' : 'Type your message details here...'}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewMessageModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!newMsgBody.trim() || (!isCustomer && !newMsgCustomerId)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

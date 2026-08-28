import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SupportTicket } from '../types';
import { MessageSquare, Plus, Search, Send, Clock, CheckCircle2, ShieldAlert, Trash2, CornerDownRight } from 'lucide-react';

export const SupportComplaints: React.FC = () => {
  const { currentUser, supportTickets, createTicket, updateTicketStatus, addTicketReply, deleteTicket, lang } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Comment state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  if (!currentUser) return null;
  const isStaffOrAdmin = currentUser.role === 'super_admin' || currentUser.role === 'branch_manager' || currentUser.role === 'field_officer';

  const filteredTickets = (supportTickets || []).filter((t) => {
    const query = (searchQuery || '').toLowerCase();
    const ticketNo = (t.ticketNo || t.id || '').toLowerCase();
    const subj = (t.subjectBn || t.subjectEn || t.subject || '').toLowerCase();
    const msg = (t.message || '').toLowerCase();
    const user = (t.userName || t.customerNameBn || t.customerNameEn || '').toLowerCase();
    return ticketNo.includes(query) || subj.includes(query) || msg.includes(query) || user.includes(query);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    createTicket({
      userId: currentUser.id,
      userName: lang === 'bn' ? currentUser.nameBn : currentUser.nameEn,
      branchId: currentUser.branchId || 'br-1',
      subject,
      message,
      priority,
    });
    setShowModal(false);
    setSubject('');
    setMessage('');
  };

  const handleAddReply = (ticketId: string) => {
    const text = replyTextMap[ticketId];
    if (!text || !text.trim()) return;
    addTicketReply(
      ticketId,
      lang === 'bn' ? currentUser.nameBn : currentUser.nameEn,
      currentUser.role,
      text.trim()
    );
    setReplyTextMap({ ...replyTextMap, [ticketId]: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '১১. অভিযোগ ও সাপোর্ট টিকিট' : '11. Support Tickets & Complaints'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'গ্রাহক ও শাখা কর্মীদের সেবা সংক্রান্ত যেকোনো অভিযোগ, ম্যানুয়াল মন্তব্য ও ট্র্যাকিং'
              : 'Customer support tickets, staff comments, and resolution workflow'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'bn' ? 'নতুন টিকিট খুলুন' : 'Open Ticket'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'ইউনিক টিকিট নম্বর (#TK-...), বিষয় বা বার্তা দিয়ে খুঁজুন...'
                : 'Search by unique ticket No (#TK-...), subject or message...'
            }
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
          />
        </div>
      </div>

      <div className="space-y-4">
        {(filteredTickets || []).map((t) => {
          const displaySubject = t.subjectBn || t.subjectEn || t.subject || 'সাপোর্ট রিকোয়েস্ট';
          const ticketNum = t.ticketNo || `#TK-${t.id.slice(-6)}`;
          return (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono font-black text-xs border border-emerald-800/80 shadow-2xs">
                      {ticketNum}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                        t.priority === 'high'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          : t.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}
                    >
                      {(t.priority || 'normal').toUpperCase()}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                        t.status === 'resolved' || t.status === 'solved'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}
                    >
                      {(t.status || 'open').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white pt-1">{displaySubject}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t.message}</p>
                  <p className="text-[10px] text-slate-400 font-mono pt-1">
                    আবেদনকারী: {t.userName || t.customerNameBn} • সময়: {t.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {isStaffOrAdmin && (
                    <button
                      onClick={() => updateTicketStatus(t.id, t.status === 'resolved' ? 'pending' : 'resolved')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-xs flex items-center gap-1 cursor-pointer ${
                        t.status === 'resolved'
                          ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.status === 'resolved' ? (lang === 'bn' ? 'পুনরায় খুলুন' : 'Reopen') : (lang === 'bn' ? 'সমাধান করুন' : 'Mark Resolved')}</span>
                    </button>
                  )}

                  {isStaffOrAdmin && (
                    <button
                      onClick={() => deleteTicket(t.id)}
                      className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 cursor-pointer"
                      title={lang === 'bn' ? 'টিকিট মুছুন' : 'Delete Ticket'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Conversation / Comments Thread */}
              <div className="space-y-2 pt-1">
                {t.replies && t.replies.length > 0 && (
                  <div className="space-y-2 pl-3 border-l-2 border-emerald-500/30">
                    {(t.replies || []).map((reply) => (
                      <div key={reply.id} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-0.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3 text-emerald-600" />
                            {reply.userName} <span className="text-emerald-600 uppercase font-mono">({reply.role})</span>
                          </span>
                          <span className="text-slate-400 font-mono">{reply.createdAt}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 pl-4">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input Box */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={replyTextMap[t.id] || ''}
                    onChange={(e) => setReplyTextMap({ ...replyTextMap, [t.id]: e.target.value })}
                    placeholder={lang === 'bn' ? 'অফিসিয়াল মন্তব্য/উত্তর লিখুন...' : 'Write an official comment/reply...'}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => handleAddReply(t.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'মতামত দিন' : 'Reply'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              {lang === 'bn' ? 'নতুন সাপোর্ট টিকিট খুলুন' : 'Open Support Ticket'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'বিষয় (Subject)' : 'Subject'}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'গুরুত্ব' : 'Priority'}
                </label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'বিস্তারিত বর্ণনা' : 'Description'}
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
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
                  {lang === 'bn' ? 'জমা দিন' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

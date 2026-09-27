import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Users,
  Plus,
  Search,
  CheckCheck,
  Smile,
  Paperclip,
  MoreVertical,
  ShieldCheck,
  Building,
  Lock,
  Sparkles,
  X,
  Phone,
  Video,
  Hash
} from 'lucide-react';
import { useHR } from '../context/HRContext';

export const GoogleChatView: React.FC = () => {
  const {
    currentUser,
    currentEmployee,
    chatGroups,
    chatMessages,
    activeGroupId,
    setActiveGroupId,
    sendChatMessage,
    createChatGroup,
    companyBranding,
    employees
  } = useHR();

  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<'all' | 'my-dept'>('all');
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);

  // New Group Form States
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDept, setNewGroupDept] = useState(currentEmployee?.department || 'الهندسة والتقنية');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [isDeptOnly, setIsDeptOnly] = useState(true);

  const activeGroup = chatGroups.find((g) => g.id === activeGroupId) || chatGroups[0];

  // Filter messages for active group
  const groupMessages = chatMessages.filter((m) => m.groupId === activeGroup?.id);

  // Filter groups
  const filteredGroups = chatGroups.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.department.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterDept === 'my-dept' && currentEmployee) {
      return matchesSearch && (g.department === currentEmployee.department || g.department === 'all');
    }
    return matchesSearch;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeGroup) return;
    sendChatMessage(activeGroup.id, messageInput);
    setMessageInput('');
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    createChatGroup({
      name: newGroupName.trim(),
      department: newGroupDept,
      description: newGroupDesc.trim() || `مجموعة محادثة خاصة بقسم ${newGroupDept}`,
      isDepartmentOnly: isDeptOnly,
    });

    setNewGroupName('');
    setNewGroupDesc('');
    setShowNewGroupModal(false);
  };

  const quickTemplates = [
    'السلام عليكم، يرجى مراجعة المهام المسندة على النظام اليوم.',
    'تم اعتماد التقرير ورفعه بنجاح.',
    'شكراً جزيلاً وبالتوفيق للجميع.',
    'هل يمكن عقد اجتماع سريع لمدة 10 دقائق؟',
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden h-[calc(100vh-140px)] min-h-[580px] flex flex-col font-['Cairo',sans-serif]">
      
      {/* WhatsApp Two-Pane Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Right Pane (Sidebar in RTL): Channels & Department Groups */}
        <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
          
          {/* Top User Bar */}
          <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || ''}
                  className="w-9 h-9 rounded-full object-cover border border-emerald-500"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {currentUser?.displayName ? currentUser.displayName[0] : 'U'}
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {currentUser?.displayName || 'محادثات الشركة'}
                </h4>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                  شات {companyBranding.companyName.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* New Group Button */}
            <button
              onClick={() => setShowNewGroupModal(true)}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              title="إنشاء مجموعة محادثة خاصة بقسم"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">مجموعة جديدة</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث في المجموعات أو الأقسام..."
                className="w-full pr-9 pl-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-slate-200"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1">
              <button
                onClick={() => setFilterDept('all')}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                  filterDept === 'all'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                كافة المجموعات ({chatGroups.length})
              </button>
              <button
                onClick={() => setFilterDept('my-dept')}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                  filterDept === 'my-dept'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                قسمي فقط ({currentEmployee?.department.split(' ')[0] || 'القسم'})
              </button>
            </div>
          </div>

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredGroups.map((grp) => {
              const isActive = grp.id === activeGroup?.id;
              const lastMsg = chatMessages.filter((m) => m.groupId === grp.id).slice(-1)[0];

              return (
                <button
                  key={grp.id}
                  onClick={() => setActiveGroupId(grp.id)}
                  className={`w-full p-3 text-right flex items-start gap-3 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-r-4 border-emerald-600'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 font-bold shadow-xs ${
                    grp.department === 'all'
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                  }`}>
                    {grp.department === 'all' ? '📢' : '👥'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {grp.name}
                      </h4>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {lastMsg.timestamp}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold truncate">
                        {grp.department}
                      </span>
                      {grp.isDepartmentOnly && (
                        <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" />
                          خاص
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                      {lastMsg ? `${lastMsg.senderName.split(' ')[0]}: ${lastMsg.content}` : grp.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Left Pane (Main Chat in RTL) */}
        <div className="flex-1 flex flex-col bg-[#efeae2]/30 dark:bg-slate-950 overflow-hidden">
          
          {/* Active Group Header */}
          {activeGroup ? (
            <div className="p-3 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
                  {activeGroup.department === 'all' ? '📢' : '👥'}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {activeGroup.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {activeGroup.department}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[220px]">{activeGroup.description}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-lg text-[11px] font-bold">
                  {activeGroup.isDepartmentOnly ? 'قناة محصورة للقسم' : 'مجموعة عامة'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-400 text-xs">يرجى اختيار مجموعة</div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {groupMessages.length > 0 ? (
              groupMessages.map((msg) => {
                const isMe = msg.senderEmail.toLowerCase().trim() === (currentUser?.email || '').toLowerCase().trim();

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-xs text-xs relative ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-bl-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-br-sm'
                      }`}
                    >
                      {!isMe && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-bold text-[11px] text-emerald-700 dark:text-emerald-400">
                            {msg.senderName}
                          </span>
                        </div>
                      )}

                      <p className="leading-relaxed text-[12px] whitespace-pre-wrap">{msg.content}</p>

                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-mono ${
                        isMe ? 'text-emerald-100' : 'text-slate-400'
                      }`}>
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs font-bold">لا توجد رسائل سابقة في هذه المجموعة بعد</p>
                <p className="text-[11px] mt-1">ابدأ المحادثة وشارك فريق عملك الآن</p>
              </div>
            )}
          </div>

          {/* Quick Preset Template Buttons */}
          <div className="px-3 py-1.5 bg-slate-100/70 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto text-[10px]">
            {quickTemplates.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => setMessageInput(tmpl)}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 whitespace-nowrap transition-colors shrink-0 cursor-pointer"
              >
                {tmpl}
              </button>
            ))}
          </div>

          {/* Input Bar (WhatsApp-like) */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-slate-100 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`اكتب رسالة إلى ${activeGroup?.name || 'المجموعة'}...`}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />

            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
              title="إرسال"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>

        </div>

      </div>

      {/* Create New Department Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">إنشاء مجموعة محادثة للقسم</h3>
              </div>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اسم المجموعة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فريق تطوير البوابة أو شات مبيعات القاهرة..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">القسم التابع له</label>
                <select
                  value={newGroupDept}
                  onChange={(e) => setNewGroupDept(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="الهندسة والتقنية">الهندسة والتقنية</option>
                  <option value="الموارد البشرية والإدارة العليا">الموارد البشرية والإدارة العليا</option>
                  <option value="المالية والمحاسبة">المالية والمحاسبة</option>
                  <option value="التسويق والمبيعات">التسويق والمبيعات</option>
                  <option value="العمليات التشغيلية">العمليات التشغيلية</option>
                  <option value="all">عام لكافة أقسام الشركة</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">وصف المجموعة</label>
                <input
                  type="text"
                  placeholder="هدف المجموعة والغرض منها..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                <input
                  type="checkbox"
                  id="deptPrivacy"
                  checked={isDeptOnly}
                  onChange={(e) => setIsDeptOnly(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="deptPrivacy" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  عزل المحادثة لتكون خاصة بأعضاء هذا القسم فقط بعيداً عن باقي الأقسام
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  إنشاء المجموعة والبدء
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

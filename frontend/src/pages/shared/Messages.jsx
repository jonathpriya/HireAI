import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Send, Sparkles, MessageSquare, Search, User, Clock, CheckCheck, 
  ShieldCheck, Loader2, ArrowLeft, Bot, Phone, Mail, ExternalLink, Briefcase 
} from 'lucide-react';
import AvatarWithBadge from '../../components/AvatarWithBadge';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserIdParam = searchParams.get('user_id');

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch all conversations
  const fetchConversations = async () => {
    try {
      const res = await API.get('/messages/conversations');
      setConversations(res.data);

      // If user_id param was passed in URL, load or create that conversation
      if (targetUserIdParam && !activeUser) {
        const found = res.data.find(c => c.other_user_id === parseInt(targetUserIdParam));
        if (found) {
          selectConversation(found.other_user_id);
        } else {
          // Open direct thread with new recipient
          selectConversation(parseInt(targetUserIdParam));
        }
      } else if (!activeUser && res.data.length > 0) {
        selectConversation(res.data[0].other_user_id);
      }
    } catch (err) {
      console.error('Error fetching conversations', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Polling for new chats
    return () => clearInterval(interval);
  }, [targetUserIdParam]);

  // 2. Select conversation & fetch history
  const selectConversation = async (otherUserId) => {
    setLoadingMessages(true);
    setAiSuggestions([]);
    try {
      const res = await API.get(`/messages/history/${otherUserId}`);
      setActiveUser(res.data.other_user);
      setMessages(res.data.messages);

      // Fetch AI Smart Replies
      const lastMsg = res.data.messages.length > 0 ? res.data.messages[res.data.messages.length - 1].message : '';
      fetchAiSuggestions(otherUserId, lastMsg);
    } catch (err) {
      console.error('Error fetching message history', err);
    } finally {
      setLoadingMessages(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  // 3. Fetch AI Smart Reply suggestions
  const fetchAiSuggestions = async (otherUserId, lastMessage) => {
    setLoadingAi(true);
    try {
      const res = await API.post('/messages/ai-smart-replies', {
        other_user_id: otherUserId,
        last_message: lastMessage
      });
      setAiSuggestions(res.data.suggestions || []);
    } catch (err) {
      console.error('Error fetching AI suggestions', err);
    } finally {
      setLoadingAi(false);
    }
  };

  // 4. Send Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeUser) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    // Optimistic UI update
    const tempMsg = {
      id: Date.now(),
      sender_id: user.id,
      receiver_id: activeUser.id,
      message: messageText,
      created_at: new Date().toISOString(),
      is_read: false
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      await API.post('/messages/send', {
        receiver_id: activeUser.id,
        message: messageText
      });
      fetchConversations();
      fetchAiSuggestions(activeUser.id, messageText);
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setSending(false);
    }
  };

  const handleApplySuggestion = (suggestion) => {
    setInputMessage(suggestion);
  };

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shadow-sm mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Direct InMail &amp; 1-on-1 Messaging</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Messages</h1>
        </div>
      </div>

      {/* 2-Column Messaging Layout */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px] max-h-[720px]">
        
        {/* ── LEFT COLUMN: Contacts / Conversation List ── */}
        <div className={`md:col-span-5 lg:col-span-4 border-r border-slate-200 flex flex-col ${activeUser ? 'hidden md:flex' : 'flex'}`}>
          {/* Search Header */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConversations ? (
              <div className="p-8 text-center text-slate-400 text-xs font-bold flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span>Loading messages...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No conversations yet</p>
                <p className="text-[11px]">Direct messages from recruiters and candidates will appear here.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeUser && activeUser.id === conv.other_user_id;
                return (
                  <button
                    key={conv.other_user_id}
                    onClick={() => selectConversation(conv.other_user_id)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition hover:bg-slate-50 ${isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''}`}
                  >
                    <AvatarWithBadge
                      src={conv.profile_pic_url}
                      name={conv.name}
                      role={conv.role}
                      isOpenToWork={conv.is_open_to_work}
                      isHiring={conv.is_hiring}
                      size="sm"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{conv.name}</h4>
                        {conv.latest_time && (
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(conv.latest_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 font-medium truncate mb-1">{conv.title}</p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-600 truncate font-medium max-w-[170px]">
                          {conv.latest_sender_id === user.id ? 'You: ' : ''}{conv.latest_message}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0 shadow-sm">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Active Chat Stream ── */}
        <div className={`md:col-span-7 lg:col-span-8 flex flex-col bg-slate-50/50 ${activeUser ? 'flex' : 'hidden md:flex'}`}>
          {activeUser ? (
            <>
              {/* Chat Active User Top Bar */}
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveUser(null)}
                    className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-600"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <AvatarWithBadge
                    src={activeUser.profile_pic_url}
                    name={activeUser.name}
                    role={activeUser.role}
                    isOpenToWork={activeUser.is_open_to_work}
                    isHiring={activeUser.is_hiring}
                    size="sm"
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900">{activeUser.name}</h3>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                        {activeUser.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{activeUser.title || activeUser.email}</p>
                  </div>
                </div>

                {activeUser.role === 'candidate' && (
                  <a
                    href={`/in/${activeUser.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <span>Public Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span>Loading conversation history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2 py-12">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Start the conversation with {activeUser.name}</p>
                    <p className="text-[11px] max-w-xs text-slate-500">
                      Send a message or select one of the 1-click AI smart suggestions below!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[78%] px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 font-semibold mt-1 px-1 flex items-center gap-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && <CheckCheck className="w-3 h-3 text-blue-500" />}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── 💡 AI 1-CLICK SMART REPLIES (LinkedIn Style) ── */}
              {aiSuggestions.length > 0 && (
                <div className="px-4 py-2 bg-white/80 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
                  <span className="text-[10px] font-extrabold text-blue-700 uppercase flex items-center gap-1 shrink-0 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                    <Sparkles className="w-3 h-3 text-blue-600" /> AI Suggestions:
                  </span>
                  {aiSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="shrink-0 px-3 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 text-xs font-semibold transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Message ${activeUser.name}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Select a conversation to start chatting</h3>
              <p className="text-xs text-slate-500 max-w-sm font-medium">
                Connect directly with recruiters or candidates using instant messaging with AI reply suggestions.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

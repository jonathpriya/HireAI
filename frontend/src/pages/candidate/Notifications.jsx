import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Bell, Check, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await API.get('/candidate/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await API.post(`/candidate/notifications/${id}/read`);
      fetchNotifs();
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">System Notifications</h1>
        <p className="text-xs text-slate-500 mt-1">Updates regarding your job invitations and profile status.</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 font-semibold">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-slate-500 space-y-3 bg-white border border-slate-200">
          <Bell className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-800">No notifications yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`glass-card p-5 rounded-2xl flex items-start justify-between gap-4 border ${
                n.is_read ? 'border-slate-200 bg-slate-50 opacity-80' : 'border-blue-200 bg-white shadow-sm'
              }`}
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> {n.title}
                </h4>
                <p className="text-xs text-slate-600">{n.message}</p>
                <p className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 transition"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

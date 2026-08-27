import React from 'react';
import { User, Sparkles } from 'lucide-react';

export default function AvatarWithBadge({
  src,
  name,
  role = 'candidate',
  isOpenToWork = false,
  isHiring = false,
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  className = ''
}) {
  // Size mapping
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-base',
    xl: 'w-28 h-28 text-lg'
  };

  const badgeTextSize = {
    sm: 'text-[7px] py-0.2 px-1',
    md: 'text-[9px] py-0.5 px-1.5',
    lg: 'text-[10px] py-0.5 px-2',
    xl: 'text-[11px] py-1 px-2.5'
  };

  const ringColor = isOpenToWork 
    ? 'ring-2 ring-emerald-500 ring-offset-2' 
    : isHiring 
    ? 'ring-2 ring-purple-600 ring-offset-2' 
    : 'border border-slate-200';

  const avatarUrl = src && src.startsWith('http') 
    ? src 
    : src 
    ? `http://localhost:8000${src}` 
    : null;

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {/* Avatar Circle */}
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-slate-100 flex items-center justify-center font-bold text-slate-700 shadow-sm ${ringColor}`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name || 'User Avatar'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <span className="uppercase">{name ? name.slice(0, 2) : <User className="w-1/2 h-1/2 text-slate-400" />}</span>
        )}
      </div>

      {/* 🟢 LinkedIn #OpenToWork Badge Overlay */}
      {isOpenToWork && role === 'candidate' && (
        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-black rounded-full uppercase tracking-tighter shadow-md whitespace-nowrap border border-white flex items-center gap-0.5 ${badgeTextSize[size]}`}>
          <span>#OpenToWork</span>
        </div>
      )}

      {/* 🟣 LinkedIn #Hiring Badge Overlay */}
      {isHiring && role === 'recruiter' && (
        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 bg-purple-700 text-white font-black rounded-full uppercase tracking-tighter shadow-md whitespace-nowrap border border-white flex items-center gap-0.5 ${badgeTextSize[size]}`}>
          <span>#Hiring</span>
        </div>
      )}
    </div>
  );
}

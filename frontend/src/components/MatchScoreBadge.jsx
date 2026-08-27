import React from 'react';

export default function MatchScoreBadge({ score }) {
  let colorClass = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  let label = "High Match";

  if (score < 60) {
    colorClass = "bg-amber-500/15 text-amber-400 border-amber-500/30";
    label = "Moderate Match";
  }
  if (score < 40) {
    colorClass = "bg-rose-500/15 text-rose-400 border-rose-500/30";
    label = "Low Match";
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
      <span>{score}% Match</span>
      <span className="text-[10px] opacity-75 font-normal">({label})</span>
    </div>
  );
}

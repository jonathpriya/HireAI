import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-400 py-4 mt-auto text-center">
      <div className="max-w-7xl mx-auto px-4 text-xs font-medium">
        &copy; {new Date().getFullYear()} HireAI Platform. All rights reserved.
      </div>
    </footer>
  );
}

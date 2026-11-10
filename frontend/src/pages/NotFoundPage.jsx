import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 shadow-sm">
        <span className="text-3xl font-extrabold">404</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The destination you are looking for does not exist or has been relocated within the StayEase portal.
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-secondary transition-all shadow-sm"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 bg-white text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Home Landing
        </Link>
      </div>
    </div>
  );
};
export default NotFoundPage;

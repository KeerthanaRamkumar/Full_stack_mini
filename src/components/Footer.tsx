import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { systemAPI } from '../services/api';
import { Database, CheckCircle2, Info, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; type: string; uri: string } | null>(null);

  useEffect(() => {
    systemAPI
      .getHealth()
      .then((data) => {
        if (data.database) {
          setDbStatus(data.database);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="border-t border-stone-200 bg-[#FAF8F5] pt-12 pb-16 text-stone-600 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <span className="font-serif text-xl font-bold text-stone-900 tracking-tight">
              Ink & Quill
            </span>
            <p className="text-xs text-stone-600 max-w-md leading-relaxed">
              An educational and production-grade Content Management Platform built strictly with the
              MERN stack: MongoDB Community Server, Express.js, React, and Node.js.
              Zero external cloud dependencies or third-party APIs.
            </p>

            {/* Database Connection Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs">
              <Database className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-stone-700 font-medium">
                {dbStatus?.connected ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> MongoDB Connected
                  </span>
                ) : (
                  <span className="text-stone-700 flex items-center gap-1">
                    <Info className="w-3 h-3 text-stone-400" /> Local Storage Engine Ready
                  </span>
                )}
              </span>
              <span className="text-stone-300">|</span>
              <span className="text-stone-500 font-mono text-[11px] truncate max-w-[200px]">
                {dbStatus?.uri || 'mongodb://127.0.0.1:27017/blog_platform'}
              </span>
            </div>
          </div>

          {/* Editorial Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 font-mono mb-3">
              Editorial
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/blogs" className="hover:text-stone-900 transition-colors">
                  All Essays & Articles
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-stone-900 transition-colors">
                  Curated Categories
                </Link>
              </li>
              <li>
                <Link to="/bookmarks" className="hover:text-stone-900 transition-colors">
                  Saved Bookmarks
                </Link>
              </li>
              <li>
                <Link to="/create-blog" className="hover:text-stone-900 transition-colors">
                  Draft an Essay
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer & Learning Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 font-mono mb-3">
              Architecture & Setup
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/mern-architecture" className="hover:text-stone-900 font-medium transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-stone-700" />
                  MERN Data Flow Visualizer
                </Link>
              </li>
              <li>
                <a
                  href="#setup-guide"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/mern-architecture#local-setup';
                  }}
                  className="hover:text-stone-900 transition-colors"
                >
                  Localhost Setup Instructions
                </a>
              </li>
              <li>
                <Link to="/author/dashboard" className="hover:text-stone-900 transition-colors">
                  Author CMS Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-stone-900 transition-colors">
                  Admin System Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Ink & Quill. Open Architecture. Self-Hosted MERN Platform.</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px]">Node.js · Express · React · MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, PenTool } from 'lucide-react';
import heroImage from '../assets/images/hero_editorial_workspace_1791021169224.jpg';

interface HeroSectionProps {
  featuredBlog?: any;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ featuredBlog }) => {
  return (
    <section className="relative mb-12 border-b border-stone-200/80 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Editorial Headline & Manifesto */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-stone-500 font-mono">
            <span>Vol. 2026</span>
            <span aria-hidden="true">·</span>
            <span>Local MERN Architecture Edition</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.1] [text-wrap:balance]">
            Thoughtful engineering, literary prose, and local autonomy.
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
            A full-stack publishing and content management platform built strictly with
            MongoDB Community Server, Express, React, and Node.js. No third-party clouds,
            no trackers—just pure, resilient full-stack code.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to={featuredBlog ? `/blogs/${featuredBlog._id}` : '/blogs'}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Featured Essay</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/create-blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <PenTool className="w-4 h-4" />
              <span>Start Writing</span>
            </Link>
          </div>

          {/* Operational Ribbon: Localhost & Tech Info */}
          <div className="pt-4 border-t border-stone-200/60 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-500 font-mono">
            <div>
              <span className="text-stone-400">Database:</span> Local MongoDB
            </div>
            <div>
              <span className="text-stone-400">Backend:</span> Express API
            </div>
            <div>
              <span className="text-stone-400">Auth:</span> JWT & bcryptjs
            </div>
            <div>
              <span className="text-stone-400">Uploads:</span> Multer Local Disk
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Artwork */}
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-100 group">
            <img
              src={heroImage}
              alt="Editorial workspace with journal, coffee, and fountain pen"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            {/* Subtle bottom scrim for editorial caption */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent flex items-end p-5">
              <div className="text-white">
                <p className="text-xs uppercase tracking-wider text-stone-300 font-mono">Curated Perspective</p>
                <p className="font-serif text-sm italic text-stone-100 mt-0.5">
                  "Simplicity is the prerequisite for reliability."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { blogsAPI, categoriesAPI } from '../services/api';
import { HeroSection } from '../components/HeroSection';
import { BlogCard, BlogItem } from '../components/BlogCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { Search, Sparkles, BookOpen, ArrowRight, Layers } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [categories, setCategories] = useState<Array<{ _id?: string; name: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [blogsRes, catsRes] = await Promise.all([
          blogsAPI.getBlogs({ limit: 12 }),
          categoriesAPI.getCategories(),
        ]);
        if (blogsRes.success) setBlogs(blogsRes.blogs);
        if (catsRes.success) setCategories(catsRes.categories);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    if (catName !== 'all') {
      navigate(`/blogs?category=${encodeURIComponent(catName)}`);
    }
  };

  const featuredBlog = blogs[0];
  const recentBlogs = blogs.slice(1, 7);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Editorial Hero Marquee */}
      <HeroSection featuredBlog={featuredBlog} />

      {/* Discovery & Search Bar + Filter Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 bg-white border border-stone-200 rounded-xl p-3 shadow-2xs">
        {/* Category Filter Tabs */}
        <div className="overflow-hidden">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        {/* Local Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px] md:max-w-xs w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, tags..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50/50"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center">
          <p className="font-serif italic text-stone-500">Loading publication catalogue...</p>
        </div>
      ) : (
        <div className="space-y-14">
          {/* Featured Lead Story */}
          {featuredBlog && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-stone-700" />
                  <span>Lead Monograph</span>
                </h2>
                <span className="text-xs text-stone-500 font-mono">Curator's Choice</span>
              </div>
              <BlogCard blog={featuredBlog} featured={true} />
            </section>
          )}

          {/* Recent Articles Grid */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-stone-200/80 pb-3">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Recent Dispatches & Analyses
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Peer-reviewed technical deep dives and philosophical essays
                </p>
              </div>

              <Link
                to="/blogs"
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-800 hover:text-stone-900 border-b border-stone-400 pb-0.5"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentBlogs.length === 0 ? (
              <p className="font-serif italic text-stone-500 text-center py-12">
                No published articles found.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentBlogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            )}
          </section>

          {/* Educational Callout Banner */}
          <section className="bg-stone-900 text-stone-100 rounded-2xl p-8 sm:p-10 border border-stone-800 relative overflow-hidden">
            <div className="max-w-2xl relative z-10 space-y-4">
              <span className="text-xs uppercase font-mono tracking-wider text-amber-400">
                Full-Stack MERN Architecture
              </span>
              <h2 className="font-serif text-3xl font-bold text-stone-50 leading-tight">
                Understand the Request-Response Journey
              </h2>
              <p className="text-sm text-stone-300 leading-relaxed">
                Ever wondered how data flows from a React input state through Express middleware,
                Mongoose ORM validation, down to MongoDB BSON storage? Explore our interactive
                architecture guide.
              </p>
              <div className="pt-2">
                <Link
                  to="/mern-architecture"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-stone-100 rounded-lg hover:bg-white transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Explore Architecture & Localhost Guide</span>
                </Link>
              </div>
            </div>

            {/* Background watermark motif */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
              <BookOpen className="w-64 h-64 text-white" />
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

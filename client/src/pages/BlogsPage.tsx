import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { blogsAPI, categoriesAPI } from '../services/api';
import { BlogCard, BlogItem } from '../components/BlogCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { Search, Filter, RefreshCw, X } from 'lucide-react';

export const BlogsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [categories, setCategories] = useState<Array<{ _id?: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialTag = searchParams.get('tag') || '';

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTag, setSelectedTag] = useState(initialTag);

  useEffect(() => {
    categoriesAPI.getCategories().then((res) => {
      if (res.success) setCategories(res.categories);
    });
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await blogsAPI.getBlogs({
        search: searchInput,
        category: selectedCategory,
        tag: selectedTag,
        limit: 50,
      });

      if (res.success) {
        setBlogs(res.blogs);
        setTotalCount(res.total);
      }
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // Sync state with URL params
    const params: Record<string, string> = {};
    if (searchInput) params.search = searchInput;
    if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
    if (selectedTag) params.tag = selectedTag;
    setSearchParams(params, { replace: true });
  }, [searchInput, selectedCategory, selectedTag]);

  const clearFilters = () => {
    setSearchInput('');
    setSelectedCategory('all');
    setSelectedTag('');
    setSearchParams({});
  };

  const hasActiveFilters = searchInput || (selectedCategory && selectedCategory !== 'all') || selectedTag;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          Articles & Monographs
        </h1>
        <p className="text-sm text-stone-600 mt-1 max-w-xl">
          Search, filter, and explore published essays across technology, software engineering, UI/UX,
          and lifestyle.
        </p>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, content, or tags..."
              className="w-full text-xs pl-9 pr-8 py-2.5 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-400 bg-stone-50/50"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reset Filters CTA */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Categories Filter Strip */}
        <div className="border-t border-stone-100 pt-3">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-stone-700">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>Topic Filter:</span>
          </div>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />
        </div>

        {/* Active Tag indicator */}
        {selectedTag && (
          <div className="flex items-center gap-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
            <span>Filtered by tag:</span>
            <span className="font-semibold text-stone-900">#{selectedTag}</span>
            <button
              type="button"
              onClick={() => setSelectedTag('')}
              className="text-stone-400 hover:text-stone-700 ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-stone-500 mb-6 px-1">
        <span>
          Showing <span className="font-semibold text-stone-800 tabular-nums">{totalCount}</span> published {totalCount === 1 ? 'article' : 'articles'}
        </span>
        {hasActiveFilters && (
          <span className="text-stone-400 italic">Filter active</span>
        )}
      </div>

      {/* Article Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <p className="font-serif italic text-stone-500">Searching archive...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-stone-300 rounded-2xl p-8">
          <p className="font-serif text-lg font-bold text-stone-800 mb-1">
            No matching articles found
          </p>
          <p className="text-xs text-stone-500 mb-4">
            Try adjusting your search keywords or removing selected filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

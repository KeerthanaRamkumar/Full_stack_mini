import React, { useEffect, useState } from 'react';
import { blogsAPI } from '../services/api';
import { BlogCard, BlogItem } from '../components/BlogCard';
import { Bookmark, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await blogsAPI.getMyBookmarks();
      if (res.success) {
        setBookmarks(res.bookmarks || []);
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-stone-500 text-xs font-mono mb-1">
          <Bookmark className="w-3.5 h-3.5 text-stone-700" />
          <span>Personal Reading Archive</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          My Saved Bookmarks
        </h1>
        <p className="text-xs text-stone-600 mt-1">
          Articles and monographs you have saved for quiet reading and reference.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <p className="font-serif italic text-stone-500">Retrieving saved articles...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-stone-300 rounded-2xl p-8 max-w-lg mx-auto">
          <Bookmark className="w-8 h-8 text-stone-400 mx-auto mb-3" />
          <p className="font-serif text-lg font-bold text-stone-800 mb-1">
            Your reading list is empty
          </p>
          <p className="text-xs text-stone-500 mb-6">
            Click the bookmark icon on any article card or detail page to save it here for later.
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800"
          >
            <span>Explore Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              onBookmarkToggled={fetchBookmarks}
            />
          ))}
        </div>
      )}
    </div>
  );
};

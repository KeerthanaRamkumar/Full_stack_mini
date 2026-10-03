import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogsAPI } from '../services/api';
import {
  BookOpen,
  CheckCircle,
  FileText,
  Heart,
  MessageSquare,
  PenLine,
  Edit,
  Trash2,
  ExternalLink,
  Plus,
} from 'lucide-react';

export const AuthorDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await blogsAPI.getAuthorDashboard();
      if (res.success) {
        setStats(res.stats);
        setBlogs(res.blogs || []);
      }
    } catch (err) {
      console.error('Failed to load author dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleDeleteBlog = async (blogId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await blogsAPI.deleteBlog(blogId);
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to delete article.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="font-serif italic text-stone-500">Compiling author statistics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Author Publishing Studio
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Monitor article performance, manage publication states, and craft new monographs.
          </p>
        </div>

        <Link
          to="/create-blog"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
            <BookOpen className="w-3.5 h-3.5 text-stone-700" />
            <span>Total Works</span>
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
            {stats?.totalBlogs || 0}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Published</span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
            {stats?.publishedBlogs || 0}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Drafts</span>
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
            {stats?.draftBlogs || 0}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
            <Heart className="w-3.5 h-3.5 text-rose-600" />
            <span>Total Likes</span>
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
            {stats?.totalLikes || 0}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-stone-700" />
            <span>Discussions</span>
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
            {stats?.totalComments || 0}
          </p>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            My Articles & Manuscripts
          </h2>
          <span className="text-xs text-stone-500 font-mono">
            {blogs.length} {blogs.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <PenLine className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="font-serif text-lg text-stone-800 font-medium">No articles yet</p>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Begin your author journey by drafting your first publication.
            </p>
            <Link
              to="/create-blog"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg"
            >
              <span>Draft an Article</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/75 text-stone-500 font-mono uppercase text-[11px]">
                  <th className="py-3 px-4 font-semibold">Title & Category</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Published Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Likes</th>
                  <th className="py-3 px-4 font-semibold text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {blogs.map((b) => {
                  const dateStr = new Date(b.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={b._id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          to={`/blogs/${b._id}`}
                          className="font-serif font-bold text-stone-900 hover:underline block truncate text-sm"
                        >
                          {b.title}
                        </Link>
                        <span className="text-[11px] text-stone-500">
                          {b.category?.name || b.categoryName || 'General'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                            b.status === 'published'
                              ? 'text-emerald-800 bg-emerald-50'
                              : 'text-amber-800 bg-amber-50'
                          }`}
                        >
                          {b.status === 'published' ? '● Published' : '○ Draft'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap font-mono text-[11px]">
                        {dateStr}
                      </td>

                      <td className="py-3.5 px-4 text-right text-stone-700 font-mono tabular-nums">
                        {b.likes?.length || 0}
                      </td>

                      <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/blogs/${b._id}`}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded"
                            title="View article"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/blogs/${b._id}/edit`}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded"
                            title="Edit article"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlog(b._id, b.title)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { adminAPI, blogsAPI, categoriesAPI } from '../services/api';
import {
  Users,
  BookOpen,
  CheckCircle,
  FileText,
  MessageSquare,
  Heart,
  Layers,
  Trash2,
  Plus,
  Edit2,
  Shield,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'blogs' | 'categories' | 'comments'>('users');
  const [loading, setLoading] = useState(true);

  // Tab data states
  const [usersList, setUsersList] = useState<any[]>([]);
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [commentsList, setCommentsList] = useState<any[]>([]);

  // Category modal/edit states
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, blogsRes, catsRes, commentsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers(),
        blogsAPI.getBlogs({ status: 'all', limit: 100 }),
        categoriesAPI.getCategories(),
        adminAPI.getAllComments(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsersList(usersRes.users || []);
      if (blogsRes.success) setBlogsList(blogsRes.blogs || []);
      if (catsRes.success) setCategoriesList(catsRes.categories || []);
      if (commentsRes.success) setCommentsList(commentsRes.comments || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Category Actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await categoriesAPI.createCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
      });
      if (res.success && res.category) {
        setCategoriesList([...categoriesList, res.category]);
        setNewCatName('');
        setNewCatDesc('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add category.');
    }
  };

  const handleUpdateCategory = async (catId: string) => {
    try {
      const res = await categoriesAPI.updateCategory(catId, {
        name: editCatName,
        description: editCatDesc,
      });
      if (res.success) {
        setCategoriesList(categoriesList.map((c) => (c._id === catId ? res.category : c)));
        setEditingCatId(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update category.');
    }
  };

  const handleDeleteCategory = async (catId: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await categoriesAPI.deleteCategory(catId);
      setCategoriesList(categoriesList.filter((c) => c._id !== catId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete category.');
    }
  };

  // User Actions
  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await adminAPI.updateUserRole(userId, newRole);
      if (res.success) {
        setUsersList(usersList.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Delete user "${name}" and all associated content?`)) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsersList(usersList.filter((u) => u._id !== userId));
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  // Blog Actions
  const handleDeleteBlog = async (blogId: string, title: string) => {
    if (!window.confirm(`Admin: Force delete article "${title}"?`)) return;
    try {
      await blogsAPI.deleteBlog(blogId);
      setBlogsList(blogsList.filter((b) => b._id !== blogId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete blog.');
    }
  };

  // Comment Actions
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Admin: Delete this comment?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentsList(commentsList.filter((c) => c._id !== commentId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete comment.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="font-serif italic text-stone-500">Accessing administrative ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-stone-600 text-xs font-mono mb-1">
          <ShieldAlert className="w-4 h-4 text-stone-900" />
          <span>System Governance & Ledger</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Administrator Command Console
        </h1>
        <p className="text-xs text-stone-600 mt-1">
          Manage system users, publish states, taxonomies, and platform-wide moderation.
        </p>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-8">
        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-stone-700" />
            <span>Users</span>
          </div>
          <p className="text-xl font-bold font-mono text-stone-900 tabular-nums">
            {stats?.totalUsers || 0}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
            <BookOpen className="w-3.5 h-3.5 text-stone-700" />
            <span>Total Blogs</span>
          </div>
          <p className="text-xl font-bold font-mono text-stone-900 tabular-nums">
            {stats?.totalBlogs || 0}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Published</span>
          </div>
          <p className="text-xl font-bold font-mono text-emerald-800 tabular-nums">
            {stats?.publishedBlogs || 0}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Drafts</span>
          </div>
          <p className="text-xl font-bold font-mono text-stone-900 tabular-nums">
            {stats?.draftBlogs || 0}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
            <Heart className="w-3.5 h-3.5 text-rose-600" />
            <span>Total Likes</span>
          </div>
          <p className="text-xl font-bold font-mono text-stone-900 tabular-nums">
            {stats?.totalLikes || 0}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-stone-700" />
            <span>Comments</span>
          </div>
          <p className="text-xl font-bold font-mono text-stone-900 tabular-nums">
            {stats?.totalComments || 0}
          </p>
        </div>
      </div>

      {/* Admin Tabbed Navigation */}
      <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-xl mb-6 max-w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'users' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users ({usersList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('blogs')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'blogs' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>All Articles ({blogsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'categories' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Categories ({categoriesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'comments' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Comments ({commentsList.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-stone-900">User Accounts Ledger</h2>
            <span className="text-xs text-stone-500 font-mono">Role-based Access Control</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/75 text-stone-500 font-mono uppercase text-[11px]">
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Joined Date</th>
                  <th className="py-3 px-4 font-semibold text-right pr-6">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-stone-50/50">
                    <td className="py-3.5 px-4 font-semibold text-stone-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-stone-800 text-stone-100 flex items-center justify-center font-serif text-[11px]">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleRole(u._id, u.role)}
                        className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-800 font-bold border border-purple-200'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                        title="Click to toggle User / Admin role"
                      >
                        <Shield className="w-3 h-3" />
                        <span className="capitalize">{u.role}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right pr-6">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="text-stone-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ALL BLOGS */}
      {activeTab === 'blogs' && (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-stone-900">Platform Article Index</h2>
            <span className="text-xs text-stone-500 font-mono">Includes drafts & published</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/75 text-stone-500 font-mono uppercase text-[11px]">
                  <th className="py-3 px-4 font-semibold">Title</th>
                  <th className="py-3 px-4 font-semibold">Author</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Likes</th>
                  <th className="py-3 px-4 font-semibold text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {blogsList.map((b) => (
                  <tr key={b._id} className="hover:bg-stone-50/50">
                    <td className="py-3.5 px-4 max-w-xs">
                      <Link
                        to={`/blogs/${b._id}`}
                        className="font-serif font-bold text-stone-900 hover:underline block truncate"
                      >
                        {b.title}
                      </Link>
                      <span className="text-[11px] text-stone-500">
                        {b.category?.name || b.categoryName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 font-medium">
                      {b.author?.name || 'Unknown'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                          b.status === 'published'
                            ? 'text-emerald-800 bg-emerald-50'
                            : 'text-amber-800 bg-amber-50'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-stone-700">
                      {b.likes?.length || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/blogs/${b._id}`}
                          className="p-1.5 text-stone-500 hover:text-stone-900 rounded"
                          title="View"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlog(b._id, b.title)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded"
                          title="Delete Blog"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Add Category Form */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
            <h3 className="font-serif text-base font-bold text-stone-900 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-stone-700" />
              <span>Add New Editorial Category</span>
            </h3>

            <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-stone-600 uppercase font-mono mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Data Engineering"
                  className="w-full text-xs p-2 border border-stone-300 rounded-lg bg-stone-50"
                  required
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-[11px] font-semibold text-stone-600 uppercase font-mono mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Pipelines, ETL, and distributed analytics."
                  className="w-full text-xs p-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-100">
              <h3 className="font-serif text-base font-bold text-stone-900">Active Taxonomies</h3>
            </div>

            <div className="divide-y divide-stone-100">
              {categoriesList.map((cat) => {
                const isEditing = editingCatId === cat._id;
                return (
                  <div key={cat._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50">
                    {isEditing ? (
                      <div className="flex-1 flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={editCatName}
                          onChange={(e) => setEditCatName(e.target.value)}
                          className="text-xs p-1.5 border border-stone-300 rounded"
                        />
                        <input
                          type="text"
                          value={editCatDesc}
                          onChange={(e) => setEditCatDesc(e.target.value)}
                          className="text-xs p-1.5 border border-stone-300 rounded flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCategory(cat._id)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-emerald-700 rounded"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="px-2 py-1 text-xs text-stone-600 bg-stone-100 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-stone-900">{cat.name}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">{cat.description || 'No description'}</p>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(cat._id);
                            setEditCatName(cat.name);
                            setEditCatDesc(cat.description || '');
                          }}
                          className="p-1.5 text-stone-500 hover:text-stone-900 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat._id, cat.name)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMMENTS */}
      {activeTab === 'comments' && (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-stone-900">All Discussions & Comments</h2>
            <span className="text-xs text-stone-500 font-mono">Platform Moderation</span>
          </div>

          <div className="divide-y divide-stone-100">
            {commentsList.length === 0 ? (
              <p className="p-8 text-center font-serif italic text-stone-500 text-xs">
                No comments posted yet across the platform.
              </p>
            ) : (
              commentsList.map((comm) => (
                <div key={comm._id} className="p-4 flex items-start justify-between gap-4 hover:bg-stone-50/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-stone-900">{comm.user?.name || 'User'}</span>
                      <span className="text-stone-300">·</span>
                      <span className="text-stone-500 font-mono text-[11px]">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-stone-500 italic">on "{comm.blog?.title || 'Article'}"</span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">{comm.text}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comm._id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

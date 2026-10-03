import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User as UserIcon, Mail, Shield, BookOpen, FileText, Bookmark, Heart, Upload, CheckCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [stats, setStats] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    authAPI.getMe().then((res) => {
      if (res.success && res.user) {
        setName(res.user.name);
        setBio(res.user.bio || '');
        setProfileImage(res.user.profileImage || '');
        setStats(res.user.stats);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateUserProfile({ name, bio, profileImage });
      setSuccessMsg('Your profile has been updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('image', file);

      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.imageUrl) {
          setProfileImage(data.imageUrl);
        }
      } catch (err) {
        console.error('Avatar upload failed:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="font-serif italic text-stone-500">Loading author profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          User Profile & Settings
        </h1>
        <p className="text-xs text-stone-600 mt-1">
          Manage your author identity, biography, and view writing statistics.
        </p>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs mb-1">
            <BookOpen className="w-3.5 h-3.5 text-stone-700" />
            <span>Total Articles</span>
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
            {stats?.totalBlogs || 0}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Published</span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
            {stats?.publishedBlogs || 0}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs mb-1">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Drafts</span>
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
            {stats?.draftBlogs || 0}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs mb-1">
            <Bookmark className="w-3.5 h-3.5 text-stone-700" />
            <span>Bookmarks</span>
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
            {stats?.totalBookmarks || 0}
          </p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h2 className="font-serif text-xl font-bold text-stone-900 mb-6">
          Personal Information
        </h2>

        {successMsg && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar and file selection */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-stone-100">
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover border-2 border-stone-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-2xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="space-y-2 text-center sm:text-left">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Avatar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-stone-400">
                Square format recommended. File stored locally on backend.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-name" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                required
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
                Email Address (Read-only)
              </label>
              <input
                id="profile-email"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full text-xs p-2.5 bg-stone-100 border border-stone-200 text-stone-500 rounded-lg cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-role" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
              Account Role
            </label>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200 rounded-md text-xs font-mono">
              <Shield className="w-3.5 h-3.5 text-stone-600" />
              <span className="uppercase text-stone-800 font-semibold">{user?.role}</span>
            </div>
          </div>

          <div>
            <label htmlFor="profile-bio" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
              Author Biography
            </label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder="A brief sentence describing your background or focus..."
              className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-400"
            />
            <span className="text-[11px] text-stone-400 font-mono mt-1 block">
              {bio.length}/200 characters
            </span>
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-xs"
            >
              {saving ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

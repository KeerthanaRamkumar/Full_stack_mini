import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogsAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Upload, ArrowLeft, CheckCircle } from 'lucide-react';

export const EditBlogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [existingCoverImage, setExistingCoverImage] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<Array<{ _id?: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [blogRes, catRes] = await Promise.all([
          blogsAPI.getBlogById(id),
          categoriesAPI.getCategories(),
        ]);

        if (catRes.success) setCategories(catRes.categories);

        if (blogRes.success && blogRes.blog) {
          const b = blogRes.blog;
          setTitle(b.title);
          setContent(b.content);
          setStatus(b.status || 'published');
          setExistingCoverImage(b.coverImage || '');
          setTags(Array.isArray(b.tags) ? b.tags.join(', ') : '');
          setCategory(b.category?._id || b.category || b.categoryName || '');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load article for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and article content.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('category', category);

      const selectedCatObj = categories.find((c) => c._id === category || c.name === category);
      formData.append('categoryName', selectedCatObj ? selectedCatObj.name : 'General');

      formData.append('tags', tags);
      formData.append('status', status);

      if (coverImageFile) {
        formData.append('coverImage', coverImageFile);
      } else {
        formData.append('coverImage', existingCoverImage);
      }

      const res = await blogsAPI.updateBlog(id, formData);
      if (res.success) {
        navigate(`/blogs/${id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="font-serif italic text-stone-500">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel & Return</span>
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-6">
          Edit Article
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="edit-title" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
              Article Title *
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full font-serif text-2xl font-bold p-3 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-400"
              required
            />
          </div>

          {/* Category & Tags Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-category" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
                Category
              </label>
              <select
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c._id || c.name} value={c._id || c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit-tags" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
                Tags (Comma separated)
              </label>
              <input
                id="edit-tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          {/* Cover image update */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
              Cover Image
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors whitespace-nowrap">
                <Upload className="w-4 h-4" />
                <span>Replace Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {coverImageFile ? (
                <span className="text-xs text-stone-600 truncate flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  New file: {coverImageFile.name}
                </span>
              ) : existingCoverImage ? (
                <span className="text-xs text-stone-500">
                  Current image preserved unless replaced.
                </span>
              ) : null}
            </div>

            {(imagePreview || existingCoverImage) && (
              <div className="mt-3 relative aspect-[16/9] max-w-sm rounded-xl overflow-hidden border border-stone-300 shadow-xs">
                <img
                  src={imagePreview || existingCoverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Body Content */}
          <div>
            <label htmlFor="edit-content" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
              Article Content *
            </label>
            <textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              className="w-full text-sm font-sans p-4 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-400 leading-relaxed bg-stone-50/50"
              required
            />
          </div>

          {/* Status & Submit */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="edit-status"
                  value="published"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                  className="accent-stone-900"
                />
                <span className="font-medium text-stone-800">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="edit-status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="accent-stone-900"
                />
                <span className="font-medium text-stone-600">Draft</span>
              </label>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-xs"
              >
                {submitting ? 'Saving...' : 'Save & Update Article'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

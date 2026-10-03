import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogsAPI, categoriesAPI } from '../services/api';
import { RichTextEditor } from '../components/RichTextEditor';
import { Upload, Eye, PenLine, CheckCircle, ArrowLeft } from 'lucide-react';

export const CreateBlogPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<Array<{ _id?: string; name: string }>>([]);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoriesAPI.getCategories().then((res) => {
      if (res.success && res.categories) {
        setCategories(res.categories);
        if (res.categories.length > 0) {
          setCategory(res.categories[0]._id || res.categories[0].name);
        }
      }
    });
  }, []);

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

  const handleSubmit = async (e: React.FormEvent, overrideStatus?: 'draft' | 'published') => {
    e.preventDefault();
    const finalStatus = overrideStatus || status;

    if (!title.trim()) {
      setError('Please provide an article title.');
      return;
    }

    if (!content.trim() || content === '<p><br></p>') {
      setError('Please write content for your article using the rich text editor.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('category', category);

      // Find category name
      const selectedCatObj = categories.find((c) => c._id === category || c.name === category);
      formData.append('categoryName', selectedCatObj ? selectedCatObj.name : 'General');

      formData.append('tags', tags);
      formData.append('status', finalStatus);

      if (coverImageFile) {
        formData.append('coverImage', coverImageFile);
      }

      const res = await blogsAPI.createBlog(formData);

      if (res.success && res.blog) {
        if (finalStatus === 'draft') {
          navigate('/author/dashboard');
        } else {
          navigate(`/blogs/${res.blog._id}`);
        }
      }
    } catch (err: any) {
      console.error('Create blog error:', err);
      setError(err.message || 'Failed to publish article.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel & Return</span>
        </button>

        {/* Editor vs Preview Mode Switch */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'write' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Rich Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'preview' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Create New Article
          </h1>
          <span className="text-xs text-stone-500 font-mono">Quill.js Rich Text Enabled</span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
            {error}
          </div>
        )}

        {activeTab === 'write' ? (
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="blog-title" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
                Article Title *
              </label>
              <input
                id="blog-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Architecture of High-Throughput Node.js Monoliths"
                className="w-full font-serif text-xl sm:text-2xl font-bold p-3 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-400 placeholder:text-stone-300"
                required
              />
            </div>

            {/* Category & Tags Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="blog-category" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
                  Curated Category
                </label>
                <select
                  id="blog-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                >
                  {categories.map((c) => (
                    <option key={c._id || c.name} value={c._id || c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="blog-tags" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
                  Tags (Comma separated)
                </label>
                <input
                  id="blog-tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Architecture, Express, MERN"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>

            {/* Cover Image Upload (Multer) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
                Cover Image (Saved locally in server/uploads/)
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors whitespace-nowrap">
                  <Upload className="w-4 h-4" />
                  <span>Choose Cover Image</span>
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
                    {coverImageFile.name} ({(coverImageFile.size / 1024).toFixed(1)} KB)
                  </span>
                ) : (
                  <span className="text-xs text-stone-400">
                    JPG, PNG, WebP up to 5MB. Multer saves directly to local disk.
                  </span>
                )}
              </div>

              {imagePreview && (
                <div className="mt-3 relative aspect-[16/9] max-w-sm rounded-xl overflow-hidden border border-stone-300 shadow-xs">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Rich Text Editor Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider font-mono">
                  Article Body (Quill.js Rich Text) *
                </label>
                <span className="text-[11px] text-stone-400 font-mono">
                  Format headings, bold, italics, quotes, lists, links
                </span>
              </div>

              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your article narrative here. Use the toolbar above to style headings, quotes, lists, and links..."
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={status === 'published'}
                    onChange={() => setStatus('published')}
                    className="accent-stone-900"
                  />
                  <span className="font-medium text-stone-800">Publish Immediately</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="accent-stone-900"
                  />
                  <span className="font-medium text-stone-600">Save as Draft</span>
                </label>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'draft')}
                  disabled={submitting}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-xs"
                >
                  {submitting ? 'Publishing...' : status === 'draft' ? 'Save as Draft' : 'Publish Article'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Live Preview Mode */
          <div className="space-y-6">
            <div className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-500 font-mono">
              Live HTML Preview Rendering
            </div>

            {imagePreview && (
              <div className="aspect-[16/9] rounded-xl overflow-hidden border border-stone-200">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              {title || 'Untitled Article'}
            </h1>

            <div className="text-xs text-stone-500 flex items-center gap-2">
              <span className="font-semibold text-stone-800">
                {categories.find((c) => c._id === category || c.name === category)?.name || 'General'}
              </span>
              <span>·</span>
              <span>{status === 'draft' ? 'Draft' : 'Published'}</span>
              <span>·</span>
              <span>{tags || 'No tags'}</span>
            </div>

            {/* Render formatted HTML preview */}
            <div
              className="article-rich-content pt-4 border-t border-stone-100 text-stone-800 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: content || '<p class="italic text-stone-400">Content preview will appear here...</p>' }}
            />

            <div className="pt-6 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className="px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg"
              >
                Back to Rich Editor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from '../components/CommentSection';
import { BlogCard, BlogItem } from '../components/BlogCard';
import {
  Heart,
  Bookmark,
  Share2,
  Calendar,
  Clock,
  Edit,
  Trash2,
  ArrowLeft,
  Check,
  Tag,
} from 'lucide-react';

// Helper to convert plain text or markdown fallback to clean HTML
const renderArticleHTML = (content: string) => {
  if (!content) return '';

  // Check if content is already rich HTML (from Quill.js)
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  if (isHtml) {
    return content;
  }

  // Fallback for markdown/plain text
  return content
    .split('\n\n')
    .map((block) => {
      if (block.startsWith('### ')) {
        return `<h3 class="font-serif text-2xl font-bold text-stone-900 mt-8 mb-3">${block.replace('### ', '')}</h3>`;
      }
      if (block.startsWith('## ')) {
        return `<h2 class="font-serif text-3xl font-bold text-stone-900 mt-10 mb-4">${block.replace('## ', '')}</h2>`;
      }
      if (block.startsWith('# ')) {
        return `<h1 class="font-serif text-3xl font-bold text-stone-900 mt-10 mb-4">${block.replace('# ', '')}</h1>`;
      }
      return `<p class="mb-5 leading-loose text-stone-700">${block}</p>`;
    })
    .join('');
};

export const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [blog, setBlog] = useState<any>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await blogsAPI.getBlogById(id);
        if (res.success && res.blog) {
          setBlog(res.blog);
          setIsLiked(res.blog.isLiked);
          setLikesCount(res.blog.likesCount || 0);
          setIsBookmarked(res.blog.isBookmarked);

          // Fetch related articles in same category
          const catName = res.blog.category?.name || res.blog.categoryName;
          if (catName) {
            blogsAPI.getBlogs({ category: catName, limit: 3 }).then((rel) => {
              if (rel.success) {
                setRelatedBlogs(rel.blogs.filter((b) => b._id !== id).slice(0, 2));
              }
            });
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load article.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like this article.');
      return;
    }
    if (!id) return;

    try {
      const res = await blogsAPI.toggleLike(id);
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (err: any) {
      alert(err.message || 'Failed to update like.');
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      alert('Please log in to bookmark this article.');
      return;
    }
    if (!id) return;

    try {
      const res = await blogsAPI.toggleBookmark(id);
      setIsBookmarked(res.bookmarked);
    } catch (err: any) {
      alert(err.message || 'Failed to update bookmark.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }
    if (!id) return;

    try {
      await blogsAPI.deleteBlog(id);
      navigate('/blogs');
    } catch (err: any) {
      alert(err.message || 'Failed to delete article.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="font-serif italic text-stone-500">Unfolding manuscript...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Article Unavailable</h2>
        <p className="text-sm text-stone-600 mb-6">{error || 'This article could not be retrieved.'}</p>
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Articles</span>
        </Link>
      </div>
    );
  }

  // Ownership checks
  const blogAuthorId = (blog.author?._id || blog.author || '').toString();
  const isOwner = user && user._id.toString() === blogAuthorId;
  const isAdmin = user && user.role === 'admin';
  const canModify = isOwner || isAdmin;

  // Approximate word count and read time
  const plainText = (blog.content || '').replace(/<[^>]*>/g, ' ');
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const categoryName = blog.category?.name || blog.categoryName || 'General';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Articles</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="mb-8">
        {/* Unboxed metadata discipline */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-3">
          <Link
            to={`/blogs?category=${encodeURIComponent(categoryName)}`}
            className="font-semibold text-stone-900 hover:underline"
          >
            {categoryName}
          </Link>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <time dateTime={blog.createdAt}>{formattedDate}</time>
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readTime} min read
          </span>
          {blog.status === 'draft' && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                Draft (Unpublished)
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-[1.15] mb-6 [text-wrap:balance]">
          {blog.title}
        </h1>

        {/* Author Bylines and Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-b border-stone-200 py-3.5">
          <div className="flex items-center gap-3">
            {blog.author?.profileImage ? (
              <img
                src={blog.author.profileImage}
                alt={blog.author.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-stone-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-sm font-semibold">
                {(blog.author?.name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-stone-900">
                {blog.author?.name || 'Unknown Author'}
              </p>
              <p className="text-[11px] text-stone-500">
                {blog.author?.bio || 'Author and essayist at Ink & Quill'}
              </p>
            </div>
          </div>

          {/* Social / Reading Interactions */}
          <div className="flex items-center gap-2">
            {canModify && (
              <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-stone-200">
                <Link
                  to={`/blogs/${blog._id}/edit`}
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Edit this article"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete this article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isLiked
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Heart className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} />
              <span className="tabular-nums font-mono">{likesCount}</span>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={handleBookmark}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                isBookmarked
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
              }`}
              title={isBookmarked ? 'Saved to Bookmarks' : 'Bookmark this article'}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
              title="Copy article link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Cover Image Slot */}
      {blog.coverImage && (
        <div className="mb-10 rounded-2xl overflow-hidden border border-stone-200 aspect-[16/9] shadow-xs">
          <img
            src={blog.coverImage}
            alt={blog.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Body - Rich Editorial HTML Content from Quill.js */}
      <article
        className="article-rich-content text-stone-800 leading-relaxed font-sans text-base sm:text-lg"
        dangerouslySetInnerHTML={{ __html: renderArticleHTML(blog.content) }}
      />

      {/* Tags list */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="pt-8 border-t border-stone-200 mt-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-stone-500 font-mono flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Tags:
            </span>
            {blog.tags.map((tag: string) => (
              <Link
                key={tag}
                to={`/blogs?tag=${encodeURIComponent(tag)}`}
                className="text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Author Profile Box */}
      <div className="my-12 p-6 bg-white border border-stone-200 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {blog.author?.profileImage ? (
          <img
            src={blog.author.profileImage}
            alt={blog.author.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-full object-cover border border-stone-200 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-xl font-bold shrink-0">
            {(blog.author?.name || 'A').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-center sm:text-left">
          <h3 className="font-serif text-lg font-bold text-stone-900">
            About {blog.author?.name || 'the Author'}
          </h3>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
            {blog.author?.bio ||
              'Essayist and technical thinker contributing monographs to Ink & Quill.'}
          </p>
          <div className="mt-3 flex items-center justify-center sm:justify-start gap-3 text-xs font-semibold text-stone-800">
            <span>Author role: {blog.author?.role || 'Contributor'}</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection blogId={blog._id} initialComments={[]} />

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <section className="mt-16 pt-10 border-t border-stone-200">
          <h3 className="font-serif text-2xl font-bold text-stone-900 mb-6">
            More in {categoryName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedBlogs.map((b) => (
              <BlogCard key={b._id} blog={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Heart, Clock, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { blogsAPI } from '../services/api';

export interface BlogItem {
  _id: string;
  title: string;
  content: string;
  author: {
    _id?: string;
    name?: string;
    email?: string;
    profileImage?: string;
  };
  category?: {
    _id?: string;
    name?: string;
  };
  categoryName?: string;
  tags?: string[];
  coverImage?: string;
  status: 'draft' | 'published';
  likes?: string[];
  createdAt: string;
  updatedAt?: string;
}

interface BlogCardProps {
  blog: BlogItem;
  onBookmarkToggled?: () => void;
  featured?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onBookmarkToggled, featured = false }) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(blog.likes?.length || 0);
  const [isLiked, setIsLiked] = React.useState(
    user && blog.likes ? blog.likes.some((id) => id.toString() === user._id.toString()) : false
  );

  // Approximate reading time (200 words per minute)
  const wordCount = (blog.content || '').split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Clean excerpt without markdown characters
  const cleanExcerpt = (blog.content || '')
    .replace(/[#*`_~>[\]]/g, '')
    .slice(0, featured ? 160 : 110)
    .trim();

  // Format date: e.g., "Feb 28, 2026"
  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const categoryTitle = blog.category?.name || blog.categoryName || 'General';

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to bookmark articles.');
      return;
    }
    try {
      const res = await blogsAPI.toggleBookmark(blog._id);
      setIsBookmarked(res.bookmarked);
      if (onBookmarkToggled) onBookmarkToggled();
    } catch (err: any) {
      console.error('Bookmark error:', err);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to like articles.');
      return;
    }
    try {
      const res = await blogsAPI.toggleLike(blog._id);
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (err: any) {
      console.error('Like error:', err);
    }
  };

  return (
    <article
      className={`group relative flex flex-col bg-white border border-stone-200/90 rounded-xl overflow-hidden hover:border-stone-400 hover:shadow-sm transition-all duration-200 ${
        featured ? 'md:grid md:grid-cols-12 md:gap-6' : ''
      }`}
    >
      {/* Cover Image Slot */}
      <div
        className={`relative overflow-hidden bg-stone-100 ${
          featured ? 'md:col-span-5 aspect-[16/10] md:aspect-auto' : 'aspect-[16/10]'
        }`}
      >
        {blog.coverImage ? (
          <img
            src={blog.coverImage}
            alt={blog.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400 font-serif italic text-sm">
            <span>Ink & Quill Monograph</span>
          </div>
        )}

        {/* Quick bookmark affordance overlay */}
        <button
          type="button"
          onClick={handleBookmark}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
          className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-colors ${
            isBookmarked
              ? 'bg-stone-900 text-amber-300'
              : 'bg-white/80 text-stone-700 hover:bg-white hover:text-stone-900'
          }`}
        >
          <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Card Content Area */}
      <div className={`p-5 flex flex-col justify-between flex-1 ${featured ? 'md:col-span-7 md:p-6' : ''}`}>
        <div>
          {/* Metadata Discipline: Clean unboxed text with · separators */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2.5">
            <span className="font-semibold text-stone-800 tracking-wide">{categoryTitle}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={blog.createdAt}>{formattedDate}</time>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readTime} min read
            </span>
          </div>

          {/* Primary Title */}
          <h3
            className={`font-serif font-bold text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-2 ${
              featured ? 'text-2xl md:text-3xl leading-snug mb-3' : 'text-lg leading-snug mb-2'
            }`}
          >
            <Link to={`/blogs/${blog._id}`} className="focus:outline-hidden">
              {blog.title}
            </Link>
          </h3>

          {/* Article Excerpt */}
          <p className="text-sm text-stone-600 leading-relaxed line-clamp-2 mb-4">
            {cleanExcerpt}...
          </p>
        </div>

        {/* Card Footer: Author + Metrics & Read Action */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3 text-xs">
          {/* Author info */}
          <div className="flex items-center gap-2.5 min-w-0">
            {blog.author?.profileImage ? (
              <img
                src={blog.author.profileImage}
                alt={blog.author.name || 'Author'}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-stone-200 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-serif text-xs font-semibold shrink-0">
                {(blog.author?.name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-stone-800 truncate">
              {blog.author?.name || 'Unknown Author'}
            </span>
          </div>

          {/* Actions & Reactions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors ${
                isLiked ? 'text-rose-600 font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Like this article"
            >
              <Heart className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} />
              <span className="tabular-nums font-mono text-[11px]">{likesCount}</span>
            </button>

            <Link
              to={`/blogs/${blog._id}`}
              className="inline-flex items-center gap-1 font-semibold text-stone-900 hover:text-stone-600 transition-colors whitespace-nowrap pl-1"
            >
              <span>Read</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { commentsAPI } from '../services/api';
import { MessageSquare, Trash2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CommentItem {
  _id: string;
  blog: string;
  user: {
    _id?: string;
    name?: string;
    email?: string;
    profileImage?: string;
    role?: string;
  };
  text: string;
  createdAt: string;
}

interface CommentSectionProps {
  blogId: string;
  initialComments: CommentItem[];
}

export const CommentSection: React.FC<CommentSectionProps> = ({ blogId, initialComments }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>(initialComments || []);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await commentsAPI.createComment(blogId, text.trim());
      if (res.success && res.comment) {
        setComments([res.comment, ...comments]);
        setText('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentsAPI.deleteComment(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete comment.');
    }
  };

  return (
    <section className="pt-10 border-t border-stone-200 mt-12">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-stone-700" />
        <h3 className="font-serif text-2xl font-bold text-stone-900">
          Discussions <span className="text-stone-500 font-sans text-base font-normal">({comments.length})</span>
        </h3>
      </div>

      {/* New Comment Input */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-3 mb-3">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-stone-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-stone-800 text-stone-100 flex items-center justify-center font-serif text-xs font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-medium text-stone-700">
              Commenting as <span className="font-semibold text-stone-900">{user.name}</span>
            </span>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share a thoughtful observation or perspective..."
            rows={3}
            maxLength={1000}
            className="w-full text-sm p-3 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-400 focus:border-stone-400 resize-y bg-stone-50/50"
            required
          />

          {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}

          <div className="flex items-center justify-between mt-3 pt-2">
            <span className="text-[11px] text-stone-400 font-mono">
              {text.length}/1000 characters
            </span>
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-5 bg-stone-100/80 rounded-xl border border-stone-200/80 text-center">
          <p className="text-sm text-stone-700 font-medium mb-2">Join the conversation</p>
          <p className="text-xs text-stone-500 mb-4 max-w-md mx-auto">
            Sign in to post comments, discuss with authors, and share your perspective.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded-md hover:bg-stone-50"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-md hover:bg-stone-800"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-10 bg-white border border-dashed border-stone-200 rounded-xl">
            <p className="text-sm font-serif italic text-stone-500">
              No comments yet. Be the first to start the discussion!
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const commentUserId = comment.user?._id?.toString() || '';
            const isOwner = user && user._id.toString() === commentUserId;
            const isAdmin = user && user.role === 'admin';
            const canDelete = isOwner || isAdmin;

            const dateStr = new Date(comment.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={comment._id}
                className="bg-white border border-stone-200/80 rounded-xl p-4 transition-all"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    {comment.user?.profileImage ? (
                      <img
                        src={comment.user.profileImage}
                        alt={comment.user.name || 'User'}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover border border-stone-200"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-serif text-[11px] font-semibold">
                        {(comment.user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-stone-900">
                        {comment.user?.name || 'Anonymous Reader'}
                      </span>
                      {comment.user?.role === 'admin' && (
                        <span className="ml-1.5 text-[10px] uppercase font-mono text-stone-500">
                          (Staff)
                        </span>
                      )}
                    </div>
                    <span className="text-stone-300">·</span>
                    <span className="text-[11px] text-stone-500">{dateStr}</span>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment._id)}
                      className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title={isAdmin && !isOwner ? 'Admin: Delete Comment' : 'Delete My Comment'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-sm text-stone-700 leading-relaxed pl-8 whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

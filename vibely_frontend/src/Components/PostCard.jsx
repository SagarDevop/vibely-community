import React, { useState } from "react";
import api from "../api";
import CommentsSection from "./CommentsSection";
import { useNavigate } from "react-router-dom";

export default function PostCard({ post }) {
  const initialLikeCount = post.like_count ?? post.likes ?? 0;
  const initialLiked = post.is_liked ?? false;

  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();
  const onSelectUser = (user) => {
    navigate(`/user/${user}`);
  };

  const toggleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(likeCount + (newLiked ? 1 : -1));

    try {
      setLoading(true);
      const res = await api.post(`/posts/${post.id}/like/`);

      setLikeCount(res.data.like_count);
      setLiked(Boolean(res.data.liked));
    } catch (err) {
      setLiked(!newLiked);
      setLikeCount(likeCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#2E2E2E] rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div
          onClick={() => onSelectUser(post.user)}
          className="flex items-center gap-3"
        >
          {post.avatar ? (
            <img
              src={post.avatar}
              alt={post.username}
              className="w-11 h-11 rounded-full object-cover border border-gray-600"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gray-600 flex items-center justify-center text-white">
              {post.username ? post.username[0].toUpperCase() : "?"}
            </div>
          )}

          <div>
            <h2 className="font-semibold text-white text-lg">
              {post.username}
            </h2>
            <p className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Post Image */}
      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="w-full max-h-[500px] object-cover"
        />
      )}

      {/* Caption */}
      {post.caption && (
        <div className="px-4 py-3 text-gray-200">{post.caption}</div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 px-4 py-2 border-t border-gray-700">
        <button
          onClick={toggleLike}
          disabled={loading}
          className={`flex items-center gap-2 transition ${
            liked ? "text-red-500" : "text-gray-300 hover:text-white"
          }`}
        >
          <span className="text-xl">{liked ? "❤️" : "🤍"}</span>
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition"
        >
          💬 <span>{post.comment_count ?? 0}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="p-4 border-t border-gray-700">
          <CommentsSection postId={post.id} />
        </div>
      )}
    </div>
  );
}

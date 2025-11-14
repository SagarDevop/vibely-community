import React, { useState } from "react";
import api from "../api";
import CommentsSection from "./CommentsSection"; // we’ll use this from before

export default function PostCard({ post }) {
  const initialLikeCount = post.like_count ?? post.likes ?? 0;
  const initialLiked = post.is_liked ?? false;

  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false); // 🔹 NEW

  const toggleLike = async () => {
    const newLiked = !liked;
    const prevCount = likeCount;
    setLiked(newLiked);
    setLikeCount(prevCount + (newLiked ? 1 : -1));

    try {
      setLoading(true);
      const res = await api.post(`/posts/${post.id}/like/`);
      if (res?.data?.like_count !== undefined) {
        setLikeCount(res.data.like_count);
      }
      setLiked(Boolean(res?.data?.liked));
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setLiked(!newLiked);
      setLikeCount(prevCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#474B4F] rounded-xl p-4 shadow-md flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {post.avatar ? (
            <img
              src={post.avatar}
              alt={`${post.username}'s avatar`}
              className="w-10 h-10 rounded-full object-cover border border-gray-600"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#6B6E70] flex items-center justify-center text-white font-semibold">
              {post.username ? post.username[0].toUpperCase() : "?"}
            </div>
          )}
          <h2 className="font-bold text-lg">{post.username || "Anonymous"}</h2>
        </div>

        <span className="text-sm text-gray-300">
          {new Date(post.created_at).toLocaleString()}
        </span>
      </div>

      {/* Post image */}
      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="rounded-lg mt-2 max-h-96 object-cover"
        />
      )}

      {/* Caption */}
      {post.caption && <p className="mt-2">{post.caption}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-2">
        {/* ❤️ Like */}
        <button
          onClick={toggleLike}
          disabled={loading}
          className={`flex items-center gap-2 px-3 py-1 rounded-full transition font-semibold
            ${liked ? "text-red-500" : "text-gray-200 hover:text-red-400"}`}
        >
          <span className="text-lg">{liked ? "❤️" : "🤍"}</span>
          <span>{likeCount}</span>
        </button>

        {/* 💬 Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-3 py-1 text-gray-200 hover:text-blue-400"
        >
          💬 <span>{post.comment_count ?? 0}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 border-t border-gray-600 pt-3">
          <CommentsSection
            postId={post.id}
            currentUser={post.username}
          />
        </div>
      )}
    </div>
  );
}

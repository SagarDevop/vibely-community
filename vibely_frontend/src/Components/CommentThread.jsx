import { useState } from "react";
import api from "../api";

export default function CommentThread({ comment, postId, onReplyAdded, currentUser }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await api.post(`/posts/${postId}/comments/`, {
      text: replyText,
      parent: comment.id, // tells backend it's a reply
    });
    setReplyText("");
    setShowReplyBox(false);
    onReplyAdded(); // reload comments in parent
  };

  const timeAgo = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);

    const diffMs = now - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      return `${diffDays}d`;
    }
  };

  return (
    <div className="mb-3 ml-2">
      <div className="text-white">
         <div className="flex gap-3 items-center">
          <img
                      className="h-9 rounded-full"
                      src={comment.user_avatar || "/default-avatar.png"}
                      alt=""
                    />
        <p className="font-semibold">{comment.user}</p>
        <span className="text-gray-400 text-xs">
                          {timeAgo(comment.created_at)}
                        </span>
         </div>
        <p className="mt-1 ml-10">{comment.text}</p>
        <button
          onClick={() => setShowReplyBox(!showReplyBox)}
          className="text-gray-400 text-xs w-8 ml-44"
        >
          {showReplyBox ? "Cancel" : "Reply"}
        </button>
      </div>

      {showReplyBox && (
        <form onSubmit={handleReplySubmit} className="mt-2 ml-4 flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 bg-gray-800 text-white p-2 rounded"
          />
          <button type="submit" className="bg-blue-600 text-white px-3 rounded">
            Reply
          </button>
        </form>
      )}

      {/* render child replies recursively */}
      {comment.replies?.length > 0 && (
        <div className="ml-5 mt-2 border-l border-gray-600 pl-2">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              postId={postId}
              onReplyAdded={onReplyAdded}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}

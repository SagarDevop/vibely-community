import { useEffect, useState } from "react";
import api from "../api";
import CommentThread from "./CommentThread";

export default function CommentsSection({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const loadComments = async () => {
    const res = await api.get(`/posts/${postId}/comments/`);
    console.log("Loaded comments:", res.data);
    setComments(res.data);
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post(`/posts/${postId}/comments/`, { text });
    setText("");
    loadComments();
  };

  return (
    <div className="mt-2">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-gray-800 text-white p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-3 rounded">
          Post
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="text-gray-400">No comments yet.</p>
      ) : (
        comments.map((c) => (
          <CommentThread
            key={c.id}
            comment={c}
            postId={postId}
            onReplyAdded={loadComments}
            currentUser={currentUser}
          />
        ))
      )}
    </div>
  );
}

import { useState } from "react";
import api from "../api"; // your axios instance

export default function CreatePost({ onPostCreated }) {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", image);

    try {
      setLoading(true);
      setError("");
      const res = await api.post("/posts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (onPostCreated) onPostCreated(res.data);
      setCaption("");
      setImage(null);
    } catch (err) {
      setError("Failed to upload post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#1F1F1F] p-6 rounded-xl border border-[#333]">
      <h2 className="text-xl font-bold mb-4 text-white">Create Post</h2>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="mb-3 w-full text-sm text-gray-300"
        />

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          className="w-full p-2 rounded-md bg-[#2A2A2A] text-gray-200 border border-[#444] mb-3"
          rows={3}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-[#86C232] text-[#1F1F1F] font-semibold rounded-md hover:bg-[#9fe84c] transition"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}

import { useState } from "react";
import api from "../api";
import CropModal from "./CropModal";
import { useNavigate } from "react-router-dom";

export default function CreatePost({ onPostCreated }) {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const navigate = useNavigate();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewURL = URL.createObjectURL(file);
    setSelectedImage(previewURL);
    setShowCrop(true);
  };

  const handleCroppedImage = (blob) => {
    const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
    setImage(file);
    setShowCrop(false);
  };

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
      setSelectedImage(null);
      navigate("/feed");
    } catch (err) {
      setError("Failed to upload post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#121212] p-6">
      {showCrop && selectedImage && (
        <CropModal image={selectedImage} onClose={() => setShowCrop(false)} onSave={handleCroppedImage} />
      )}

      <div className="w-full max-w-2xl bg-[#1E1E1E] rounded-2xl p-8 shadow-2xl border border-[#2A2A2A] backdrop-blur-lg relative">
        <h2 className="text-3xl font-bold text-white mb-6 text-center tracking-wide">Create New Post</h2>

        {error && <p className="text-red-400 text-center mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="flex flex-col items-center justify-center h-72 border-2 border-dashed border-[#3A3A3A] rounded-2xl cursor-pointer bg-[#1A1A1A] hover:bg-[#222] transition-all duration-300">
            <p className="text-gray-300 text-lg">Tap to Upload Image</p>
            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </label>

          {image && (
            <img src={URL.createObjectURL(image)} className="rounded-xl w-full max-h-96 object-cover shadow-lg" alt="preview" />
          )}

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write something..."
            className="w-full p-4 rounded-xl bg-[#2A2A2A] text-gray-200 border border-[#444] focus:border-[#86C232] outline-none text-lg placeholder-gray-500 min-h-[120px]"
          />

          <button

            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#86C232] text-black text-xl font-semibold rounded-xl hover:bg-[#9FE84C] transition-all duration-300 shadow-lg active:scale-95"
          >
            {loading ? "Posting..." : "Publish Post"}
          </button>
          
        </form>
      </div>
    </div>
  );
}
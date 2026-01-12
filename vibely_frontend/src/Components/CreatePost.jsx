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
    } catch {
      setError("Failed to upload post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#121212] px-4 py-6 sm:p-6">
      {showCrop && selectedImage && (
        <CropModal
          image={selectedImage}
          onClose={() => setShowCrop(false)}
          onSave={handleCroppedImage}
        />
      )}

      <div className="w-full max-w-xl sm:max-w-2xl bg-[#1E1E1E] rounded-2xl p-5 sm:p-8 shadow-2xl border border-[#2A2A2A]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 text-center">
          Create New Post
        </h2>

        {error && (
          <p className="text-red-400 text-center mb-3 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
        
          <label className="flex flex-col items-center justify-center h-48 sm:h-72 border-2 border-dashed border-[#3A3A3A] rounded-2xl cursor-pointer bg-[#1A1A1A] hover:bg-[#222] transition">
            <p className="text-gray-300 text-base sm:text-lg">
              Tap to Upload Image
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>

          
          {image && (
            <img
              src={URL.createObjectURL(image)}
              className="rounded-xl w-full max-h-72 sm:max-h-96 object-cover shadow-lg"
              alt="preview"
            />
          )}

          
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write something..."
            className="
              w-full p-3 sm:p-4 rounded-xl
              bg-[#2A2A2A] text-gray-200
              border border-[#444]
              focus:border-[#86C232]
              outline-none
              text-base sm:text-lg
              placeholder-gray-500
              min-h-[100px] sm:min-h-[120px]
            "
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 sm:py-4
              bg-[#86C232] text-black
              text-lg sm:text-xl font-semibold
              rounded-xl
              hover:bg-[#9FE84C]
              transition
              active:scale-95
              disabled:opacity-60
            "
          >
            {loading ? "Posting..." : "Publish Post"}
          </button>
        </form>
      </div>
    </div>
  );
}

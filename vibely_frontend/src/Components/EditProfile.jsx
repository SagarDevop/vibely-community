import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function EditProfile() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    bio: "",
    website: "",
    avatar: null,
  });
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/");
        setFormData({
          username: res.data.username || "",
          name: res.data.name || "",
          bio: res.data.bio || "",
          website: res.data.website || "",
          avatar: null,
        });
        setPreview(res.data.avatar);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, avatar: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (let key in formData) {
      if (formData[key] !== null) data.append(key, formData[key]);
    }

    try {
      await api.patch("/profile/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/profile/" + formData.username);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-6 text-center">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <img
            src={preview || "https://via.placeholder.com/150"}
            alt="avatar preview"
            className="w-32 h-32 rounded-full object-cover border"
          />
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleChange}
            className="mt-3 text-sm"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-semibold mb-1">Username</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-1">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold mb-1">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
            className="w-full border rounded-md p-2"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-semibold mb-1">Website</label>
          <input
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

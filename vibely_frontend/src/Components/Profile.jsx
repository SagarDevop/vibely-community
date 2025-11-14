import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Profile() {
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get("/profile/"),
          api.get("/my-posts/"),
        ]);
        setUser(profileRes.data);
        console.log(profileRes.data)
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-8">
      {/* Profile Info */}
      <div className="flex flex-col sm:flex-row sm:items-center w-full px-4 sm:px-0">
        <div className="flex justify-center sm:justify-start w-full sm:w-1/3">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border"
          />
        </div>

        <div className="sm:w-2/3 mt-4 sm:mt-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">{user.username}</h2>
            <button
              onClick={() => navigate("/edit-profile")}
              className="bg-gray-200 text-sm px-3 py-1 rounded-md hover:bg-gray-300"
            >
              Edit Profile
            </button>
          </div>

          <div className="flex gap-6 mt-4 text-sm">
            <p>
              <span className="font-semibold">{posts.length}</span> posts
            </p>
            <p><span className="font-semibold">{user.followers_count}</span>Follower</p>
            <p><span className="font-semibold">{user.following_count}</span>Following</p>
          </div>

          <div className="mt-4">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-700">{user.bio}</p>
            <a className="text-sm text-gray-700" href={user.website}>
              {user.website}
            </a>
          </div>
        </div>
      </div>

      <hr className="w-full my-8 border-gray-300" />

      {/* User Posts Grid */}
      <div className="grid grid-cols-3 gap-4 w-full">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="aspect-square overflow-hidden rounded-md">
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover hover:opacity-80 transition"
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-3 text-center">No posts yet.</p>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import PostCard from "../Components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, usersRes] = await Promise.all([
          api.get("/posts/"),
          api.get("/users/"),
        ]);
        setPosts(postsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load feed. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#222629] text-white">
        <h2 className="text-xl">Loading feed...</h2>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-[#222629] text-white">
        <h2 className="text-xl">{error}</h2>
      </div>
    );

  return (
    <div className="flex h-screen bg-[#222629] text-white p-6 gap-6 overflow-hidden">
      {/* Main Feed */}
      <div
        className="flex-1 max-w-2xl mx-auto overflow-y-auto space-y-6 pr-2 
                   [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
      >
        {posts.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">No posts yet.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-72 hidden lg:block mt-[20vh] sticky top-20 space-y-6 overflow-y-auto h-screen">
        <div className="bg-[#222629] border border-[#474B4F] rounded-xl p-4">
          <h3 className="font-bold text-lg mb-4">People You May Know</h3>
          <ul className="space-y-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-[#474B4F] transition-colors cursor-pointer"
                onClick={() => navigate(`/user/${user.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6B6E70] flex items-center justify-center text-white font-semibold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span>{user.username}</span>
                </div>

                
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

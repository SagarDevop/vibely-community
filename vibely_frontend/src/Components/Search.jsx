import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Search() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch posts once
  useEffect(() => {
    const fetchPosts = async () => {
      const res = await api.get("/posts/");
      console.log(res.data);
      setPosts(res.data);
    };
    fetchPosts();
  }, []);

  // LIVE SEARCH (debounced)
  useEffect(() => {
    if (!search.trim()) {
      setUser(null);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await api.get(`/user/${search}/`);
        setUser(res.data.profile); // your API format
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <>
      {/* Search Bar */}
      <div className="bg-[#1A1A1A] h-[10vh] flex items-center px-6 sticky top-0 z-50 shadow-lg">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search user..."
          className="w-full p-3 rounded-md bg-[#2A2A2A] text-gray-200 border border-[#444]"
        />

        {/* Dropdown Search Result */}
        {(user || loading) && (
          <div className="absolute top-full mt-2 left-6 w-full bg-[#222] rounded-md shadow-lg p-3 z-50">
            {loading && <p className="text-gray-400">Searching...</p>}

            {!loading && user && (
              <div
                className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-[#333] transition"
                onClick={() => navigate(`/user/${user.id}`)}
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-gray-200 font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-400">{user.name}</p>
                </div>
              </div>
            )}

            {!loading && !user && (
              <p className="text-gray-500">No user found</p>
            )}
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-4 p-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`/user/${post.user}`)}
              className="aspect-square overflow-hidden rounded-md cursor-pointer"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover hover:opacity-75 transition"
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">No posts yet.</p>
        )}
      </div>
    </>
  );
}

export default Search;

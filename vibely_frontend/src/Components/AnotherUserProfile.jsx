import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Chat from "./Chat";

export default function AnotherUserProfile() {
  const { userId } = useParams();
  const [followerlist, setFollowerList] = useState([])
  const [followinglist , setFollowingList] = useState([])
  const [user, setUser] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openChat, setOpenChat] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile & posts of the selected user
        const res = await api.get(`/user/${userId}/`);
        setUser(res.data.profile);
        setPosts(res.data.posts);
        const resf = await api.get(`/profiles/${res.data.profile.username}/followers/`);
        setFollowerList(resf.data.map(f => f.username))
        const resp = await api.get(`/profiles/${res.data.profile.username}/following/`);
        setFollowingList(resp.data.map(f => f.username))
        const currentUser = await api.get("/me/");
        setCurrentUserId(currentUser.data.id);
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const handleFollowToggle = async () => {
    try {
      const res = await api.post(`/profiles/${user.username}/follow/`);

      if (res.data.status === "followed") {
        setUser((prev) => ({
          ...prev,
          is_following: true,
          followers_count: prev.followers_count + 1,
        }));
      } else {
        setUser((prev) => ({
          ...prev,
          is_following: false,
          followers_count: prev.followers_count - 1,
        }));
      }
    } catch (err) {
      console.error("Follow error:", err);
    }
  };
  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center w-full px-4 sm:px-0">
        <div className="flex justify-center sm:justify-start w-full sm:w-1/3">
          <img
            src={user.avatar || "/default-avatar.png"}
            alt={user.username}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border"
          />
        </div>

        <div className="sm:w-2/3 mt-4 sm:mt-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">{user.username}</h2>

           
            {currentUserId &&
              user.id &&
              user.id !== currentUserId && (
                <button
                  onClick={() => setOpenChat(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                >
                  Message
                </button>
              )}
          </div>

          <button
                onClick={handleFollowToggle}
                className={`px-3 py-1 text-sm rounded-md ${
                  user.is_following
                    ? "bg-gray-300 hover:bg-gray-400"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {user.is_following ? "Unfollow" : "Follow"}
              </button>

          <div className="flex gap-6 mt-4 text-sm">
            <p>
              <span className="font-semibold">{posts.length}</span> posts
            </p>
            <p>
              <span className="font-semibold">{user.followers_count}</span> followers
            </p>
            <p>
              <span className="font-semibold">{user.following_count}</span> following
            </p>
          </div>

          <div className="mt-4">
            {user.name && <p className="font-semibold">{user.name}</p>}
            {user.bio && <p className="text-sm text-gray-700">{user.bio}</p>}
            {user.website && (
              <a
                className="text-sm text-gray-700"
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {user.website}
              </a>
            )}
          </div>
        </div>
      </div>

      <hr className="w-full my-8 border-gray-300" />

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-4 w-full">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="aspect-square overflow-hidden rounded-md"
            >
              <img
                src={post.image || "/default-post.png"}
                alt={post.caption || ""}
                className="w-full h-full object-cover hover:opacity-80 transition"
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-3 text-center">No posts yet.</p>
        )}
      </div>

      {/* Chat Modal */}
      {openChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#222629] w-96 h-[500px] rounded-lg p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">{user.username}</h3>
              <button onClick={() => setOpenChat(false)}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Chat otherUserId={user.id} currentUserId={currentUserId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

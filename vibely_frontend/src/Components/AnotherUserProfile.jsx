import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Chat from "./Chat";

export default function AnotherUserProfile() {
  const { userId } = useParams();
  const [followerlist, setFollowerList] = useState([]);
  const [followinglist, setFollowingList] = useState([]);
  const [user, setUser] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openChat, setOpenChat] = useState(false);
  const [open, setOpen] = useState(false);
  const [openf, setOpenF] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/user/${userId}/`);
        setUser(res.data.profile);
        setPosts(res.data.posts);
        const resf = await api.get(
          `/profiles/${res.data.profile.username}/followers/`
        );
        setFollowerList(resf.data.map((f) => f.username));
        const resp = await api.get(
          `/profiles/${res.data.profile.username}/following/`
        );
        setFollowingList(resp.data.map((f) => f.username));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedPost) return;

    await api.post(`/posts/${selectedPost.id}/comments/`, {
      text,
    });

    setText("");
    loadComments(selectedPost.id);
  };

  const loadComments = async (postId) => {
    try {
      const res = await api.get(`/posts/${postId}/comments/`);
      console.log("Loaded comments:", res.data);
      setComments(res.data);
    } catch (err) {
      console.error("Error loading comments", err);
    }
  };

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

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingTo) return;

    await api.post(`/posts/${selectedPost.id}/comments/`, {
      text: replyText,
      parent: replyingTo,
    });

    setReplyText("");
    setReplyingTo(null);
    loadComments(selectedPost.id);
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center w-full px-4 sm:px-0">
        <div className="flex justify-center sm:justify-start w-full sm:w-1/3">
          <img
            src={user?.avatar ? user.avatar : "/defaultavatar.jpg"}
            alt={user?.username || "user"}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border"
          />
        </div>

        <div className="sm:w-2/3 mt-4 sm:mt-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">{user.username}</h2>
          </div>

          <div className="flex gap-6 mt-4 text-sm">
            <p>
              <span className="font-semibold">{posts.length}</span> posts
            </p>
            <p onClick={() => setOpen(true)}>
              <span className="font-semibold">{user.followers_count}</span>{" "}
              followers
            </p>
            {open && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-md w-64 shadow-lg">
                  <h2 className="font-semibold mb-2">List</h2>

                  <ul className="list-disc ml-5 space-y-1">
                    {followerlist.map((item, i) => (
                      <li className="text-red-900" key={i}>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="mt-4 w-full bg-gray-800 text-white py-2 rounded"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            <p onClick={() => setOpenF(true)}>
              <span className="font-semibold">{user.following_count}</span>{" "}
              following
            </p>
            {openf && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-md w-64 shadow-lg">
                  <h2 className="font-semibold mb-2">List</h2>

                  <ul className="list-disc ml-5 space-y-1">
                    {followinglist.map((item, i) => (
                      <li className="text-red-900" key={i}>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="mt-4 w-full bg-gray-800 text-white py-2 rounded"
                    onClick={() => setOpenF(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            {user.name && <p className="font-semibold">{user.name}</p>}
            {user.bio && <p className="text-sm text-white">{user.bio}</p>}
            {user.website && (
              <a
                className="text-sm text-gray-300"
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {user.website}
              </a>
            )}
            <div className="flex gap-14 mt-6">
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

              {currentUserId && user.id && user.id !== currentUserId && (
                <button
                  onClick={() => setOpenChat(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                >
                  Message
                </button>
              )}
            </div>
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
              onClick={() => {
                setSelectedPost(post);
                loadComments(post.id);
              }}
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
      
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 w-[100vw] h-[100vh] flex items-center justify-center z-50">
          <div className="flex h-[90vh] w-[75vw] bg-white rounded-md">
            <div className="w-[55%] rounded-md">
              <img
                className="w-full h-full object-cover rounded-sm"
                src={selectedPost.image || "/default-post.png"}
                alt={selectedPost.caption || ""}
              />
            </div>
            <div className="w-[45%] bg-slate-900 rounded-sm">
              <div className="flex h-12 items-center gap-3 p-4">
                <img
                  className="h-9 rounded-full"
                  src={selectedPost.avatar || "/default-avatar.png"}
                  alt=""
                />
                <p className="text-white font-bold">{selectedPost.username}</p>
              </div>
              <div className="flex items-center gap-3 pl-4 pt-5 pb-3">
                <img
                  className="h-9 rounded-full"
                  src={selectedPost.avatar || "/default-avatar.png"}
                  alt=""
                />
                <p className="text-white font-bold">{selectedPost.username}</p>
                <p className="text-white">{selectedPost.caption}</p>
              </div>
              <div className="m-4 h-[58.5vh] overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="pb-7">
                    <div className="flex items-center gap-3">
                      <img
                        className="h-9 rounded-full"
                        src={comment.user_avatar || "/default-avatar.png"}
                        alt=""
                      />
                      <p className="text-white font-bold">{comment.user}</p>
                      <span className="text-gray-400 text-xs">
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                    <div className="flex flex-col ml-12">
                      <p className="text-white">{comment.text}</p>
                      <button
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === comment.id ? null : comment.id
                          )
                        }
                        className="text-gray-400 text-xs w-8"
                      >
                        {replyingTo === comment.id ? "Cancel" : "Reply"}
                      </button>

                      {replyingTo === comment.id && (
                        <form
                          onSubmit={handleReplySubmit}
                          className="mt-2 ml-4 flex gap-2"
                        >
                          <input
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 bg-gray-800 text-white p-2 rounded"
                          />
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-3 rounded"
                          >
                            Reply
                          </button>
                        </form>
                      )}
                      <div className="ml-5 mt-2 border-l border-gray-600 pl-2">
                        {comment.replies?.map((reply) => (
                          <div key={reply.id} className="">
                            <div className="ml-1 mt-2 flex gap-3 items-center ">
                              <img
                                className="h-9 rounded-full"
                                src={reply.user_avatar || "/default-avatar.png"}
                                alt=""
                              />
                              <p className="font-bold">{reply.user}</p>
                              <span className="text-gray-400 text-xs">
                                {timeAgo(reply.created_at)}
                              </span>
                            </div>
                            <p className="ml-[4vw] text-white">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex h-10 items-center justify-center gap-3">
                <form onSubmit={handleSubmit} className="flex ">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-gray-800 text-white p-2 w-[29.7vw]
           border-none outline-none focus:outline-none focus:ring-0 focus:shadow-none"
                  />
                  <button type="submit" className="bg-gray-800 text-white px-3">
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
          <button
            className="bottom-[43vh] left-24 relative text-red-600 font-bold text-2xl"
            onClick={() => setSelectedPost(null)}
          >
            ✕
          </button>
        </div>
      )}

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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiDotsVertical } from "react-icons/hi";
import api from "../api";
import PostModal from "./PostModal";
export default function Profile() {
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [followerlist, setFollowerList] = useState([]);
  const [followinglist, setFollowingList] = useState([]);
  const [openmenu, setOpenMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const [openf, setOpenF] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get("/profile/"),
          api.get("/my-posts/"),
        ]);
        setUser(profileRes.data);
        setPosts(postsRes.data);
        const resf = await api.get(
          `/profiles/${profileRes.data.username}/followers/`
        );
        setFollowerList(resf.data.map((f) => f.username));
        const resp = await api.get(
          `/profiles/${profileRes.data.username}/following/`
        );
        setFollowingList(resp.data.map((f) => f.username));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);
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

  const loadComments = async (postId) => {
    try {
      const res = await api.get(`/posts/${postId}/comments/`);
      console.log("Loaded comments:", res.data);
      setComments(res.data);
    } catch (err) {
      console.error("Error loading comments", err);
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

  const handleDeletePost = async (id) => {
    try {
      await api.delete(`/posts/${id}/`);
      setPosts(posts.filter((p) => p.id !== id));
      setOpenMenu(false);
      setSelectedPost(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };
  const handleEditPost = async (id, updatedData) => {
    try {
      const response = await api.patch(`/posts/${id}/`, updatedData);

      const updatedPost = response.data;

      setPosts(posts.map((p) => (p.id === id ? updatedPost : p)));
      setOpenMenu(false);
      setSelectedPost(null);
    } catch (error) {
      console.error("Update failed:", error);
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
      {/* Profile Info */}
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
              <span className="font-semibold ">{user.followers_count}</span>{" "}
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
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-white">{user.bio}</p>
            <a className="text-sm text-gray-300" href={user.website}>
              {user.website}
            </a>
          </div>
          <button
            onClick={() => navigate("/edit-profile")}
            className="bg-green-500 text-sm text-black px-3 py-1 rounded-md hover:bg-gray-300 mt-6"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <hr className="w-full my-8 border-gray-300" />

      {/* User Posts Grid */}
      <div className="grid grid-cols-3 gap-4 w-full">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="aspect-square overflow-hidden rounded-md cursor-pointer"
              onClick={() => {
                setSelectedPost(post);
                loadComments(post.id);
              }}
            >
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
      {selectedPost && (
        <PostModal
          post={selectedPost}
          comments={comments}
          text={text}
          setText={setText}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          replyText={replyText}
          setReplyText={setReplyText}
          timeAgo={timeAgo}
          isOwner
          onClose={() => setSelectedPost(null)}
          onSubmitComment={handleSubmit}
          onSubmitReply={handleReplySubmit}
          onDelete={(postId) => {
            handleDeletePost(postId);
            setSelectedPost(null);
          }}
          onEdit={(post) => {
            setEditCaption(post.caption);
            setIsEditing(true);
          }}
        />
      )}
    </div>
  );
}

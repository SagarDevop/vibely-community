import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiDotsVertical } from "react-icons/hi";
import api from "../api";

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
             <div className="flex justify-between items-center">
               <div className="flex h-12 items-center gap-3 p-4">
                <img
                  className="h-9 rounded-full"
                  src={selectedPost.avatar || "/default-avatar.png"}
                  alt=""
                />
                <p className="text-white font-bold">{selectedPost.username}</p>
              </div>
              <p
                onClick={() => setOpenMenu(!openmenu)}
                className="text-white cursor-pointer "
              >
                <HiDotsVertical />
              </p>
              {openmenu && (
                <div className="absolute bg-white border mt-8 p-2 rounded shadow w-32 right-[38vw]">
                  <p
                    className="text-red-600 cursor-pointer"
                    onClick={() => {
                      handleDeletePost(selectedPost.id);
                    }}
                  >
                    Delete
                  </p>
                  <p
                    className="text-black cursor-pointer"
                    onClick={() => {
                      setEditCaption(selectedPost.caption);
                      setIsEditing(true);
                      setOpenMenu(false);
                    }}
                  >
                    Edit
                  </p>
                </div>
              )}
             </div>
              <div className="flex items-center gap-3 pl-4 pt-5 pb-3">
                <img
                  className="h-9 rounded-full"
                  src={selectedPost.avatar || "/default-avatar.png"}
                  alt=""
                />
                <p className="text-white font-bold">{selectedPost.username}</p>
                <div className=" flex justify-between items-center">
              {isEditing ? (
                <input
                  autoFocus
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEditPost(selectedPost.id, { caption: editCaption });
                      setIsEditing(false);
                    }
                  }}
                  className="w-[10vw] text-white outline-nonee py-1"
                />
              ) : (
                <p
                  className="cursor-text text-white"
                  onClick={() => {
                    setEditCaption(selectedPost.caption);
                    setIsEditing(true);
                  }}
                >
                  {selectedPost.caption}
                </p>
              )}

              {isEditing && (
                <button
                  onClick={() => {
                    handleEditPost(selectedPost.id, { caption: editCaption });
                    setIsEditing(false);
                  }}
                  className=" text-white py-1 px-3 rounded"
                >
                  Save
                </button>
              )}
            </div>
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
    </div>
  );
}

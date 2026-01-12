import { HiDotsVertical } from "react-icons/hi";
import { useState } from "react";

export default function PostModal({
  post,
  comments,
  text,
  setText,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  timeAgo,
  onClose,
  onLoadComments,
  onSubmitComment,
  onSubmitReply,
  isOwner = false,
  onDelete,
  onEdit,
}) {
  if (!post) return null;

  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="fixed inset-0 h-[90vh] bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white w-full h-[90vh] sm:h-[90vh] sm:w-[90vw] lg:w-[75vw] rounded-none sm:rounded-md flex flex-col sm:flex-row relative overflow-hidden">

        
        <div className="w-full sm:w-[55%] h-[35vh] sm:h-full relative shrink-0">
          <img
            src={post.image || "/default-post.png"}
            alt=""
            className="w-full h-full object-cover"
          />

          <div className="absolute top-0 left-0 w-full sm:hidden">
            <div className="flex justify-between items-center p-3 bg-gradient-to-b from-black/70 to-transparent">
              <div className="flex items-center gap-3">
                <img
                  src={post.avatar || "/default-avatar.png"}
                  className="h-8 w-8 rounded-full"
                  alt=""
                />
                <p className="text-white font-semibold text-sm">
                  {post.username}
                </p>
              </div>

              {isOwner && (
                <div className="relative">
                  <HiDotsVertical
                    className="text-white cursor-pointer"
                    onClick={() => setOpenMenu(!openMenu)}
                  />

                  {openMenu && (
                    <div className="absolute right-0 mt-2 bg-white rounded shadow w-28 z-50">
                      <button
                        onClick={() => {
                          onEdit(post);
                          setOpenMenu(false);
                        }}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDelete(post.id);
                          setOpenMenu(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full sm:w-[45%] bg-slate-900 flex flex-col h-full">

          {/* DESKTOP HEADER */}
          <div className="hidden sm:flex justify-between items-center p-4 shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={post.avatar || "/default-avatar.png"}
                className="h-9 rounded-full"
                alt=""
              />
              <p className="text-white font-bold">{post.username}</p>
            </div>

            {isOwner && (
              <div className="relative">
                <HiDotsVertical
                  className="text-white cursor-pointer"
                  onClick={() => setOpenMenu(!openMenu)}
                />
              </div>
            )}
          </div>

          {/* CAPTION */}
          <div className="flex gap-3 px-4 pb-3 shrink-0">
            <img
              src={post.avatar || "/default-avatar.png"}
              className="h-9 rounded-full"
              alt=""
            />
            <p className="text-white text-sm">
              <span className="font-bold mr-2">{post.username}</span>
              {post.caption}
            </p>
          </div>

          {/* COMMENTS — MAIN SCROLL AREA */}
          <div className="flex-1 overflow-y-auto px-4 pb-28">
            {comments.map((comment) => (
              <div key={comment.id} className="mb-6">
                <div className="flex gap-3 items-center">
                  <img
                    src={comment.user_avatar || "/default-avatar.png"}
                    className="h-8 rounded-full"
                    alt=""
                  />
                  <p className="text-white font-bold">{comment.user}</p>
                  <span className="text-xs text-gray-400">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>

                <div className="ml-11">
                  <p className="text-white text-sm">{comment.text}</p>

                  <button
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )
                    }
                    className="text-xs text-gray-400"
                  >
                    {replyingTo === comment.id ? "Cancel" : "Reply"}
                  </button>

                  {replyingTo === comment.id && (
                    <form onSubmit={onSubmitReply} className="flex gap-2 mt-2">
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 bg-gray-800 text-white p-2 rounded text-sm"
                        placeholder="Write a reply..."
                      />
                      <button className="bg-blue-600 text-white px-3 rounded text-sm">
                        Reply
                      </button>
                    </form>
                  )}

                  {comment.replies?.map((reply) => (
                    <div key={reply.id} className="ml-4 mt-2">
                      <div className="flex gap-3 items-center">
                        <img
                          src={reply.user_avatar || "/default-avatar.png"}
                          className="h-7 rounded-full"
                          alt=""
                        />
                        <p className="text-white font-bold text-sm">
                          {reply.user}
                        </p>
                        <span className="text-xs text-gray-400">
                          {timeAgo(reply.created_at)}
                        </span>
                      </div>
                      <p className="ml-10 text-white text-sm">{reply.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={onSubmitComment}
            className="sticky bottom-0 flex border-t border-gray-700 bg-slate-900"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-800 text-white p-3 outline-none text-sm"
            />
            <button className="px-4 text-white">Post</button>
          </form>
        </div>
        
      </div>
      <button
          onClick={onClose}
          className="absolute sm:top-7 top-[36vh] sm:right-[10vh]  right-4 text-red-500 text-2xl"
        >
          ✕
        </button>
    </div>
  );
}

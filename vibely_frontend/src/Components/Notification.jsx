import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    const res = await api.get("/notifications/");
    setNotifs(res.data);
  };

  useEffect(() => {
    const markAndLoad = async () => {
      await api.post("/notifications/mark-all-read/");
      await loadNotifications();
    };
    markAndLoad();
  }, []);

  const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
  const now = new Date();

  const visibleNotifs = notifs.filter((n) => {
    if (!n.is_read) return true;
  
    const createdTime = new Date(n.created_at).getTime();
    return now - createdTime <= TWO_DAYS;
  });
  


  return (
    <div className="text-white w-full">
      <h1 className="text-xl font-semibold p-4 border-b border-gray-800">
        Notifications
      </h1>

      {visibleNotifs.length === 0 && (
        <p className="text-gray-400 p-4">No notifications yet.</p>
      )}

      <div className="flex flex-col">
        {visibleNotifs.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-3 px-4 py-3 
              ${!n.is_read ? "bg-[#1f1f1f]" : ""}`}
          >
            <img
              src={n.actor_avatar || "/default-avatar.png"}
              alt=""
              onClick={() => navigate(`/user/${n.actor_id}`)}
              className="h-10 w-10 rounded-full cursor-pointer object-cover"
            />
            <div className="flex-1  leading-snug">
              <span
                onClick={() => navigate(`/user/${n.actor_id}`)}
                className="font-semibold cursor-pointer text-xl text-green-400"
              >
                {n.actor_username}
              </span>{" "}
              {n.type === "like" && "liked your post"}
              {n.type === "comment" && (
                <>
                  commented:{" "}
                  <span className="text-red-300">
                    “{n.comment_text}”
                  </span>
                </>
              )}
              {n.type === "follow" && "started following you"}

              <div className="text-xs text-gray-500 mt-1">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
            {(n.type === "like" || n.type === "comment") && n.post_image && (
              <img
                src={n.post_image}
                alt=""
                className="h-10 w-10 object-cover cursor-pointer"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

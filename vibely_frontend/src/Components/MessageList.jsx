import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; 

export default function MessageList({ onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const res = await api.get("/recent-chats/");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching recent chats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentChats();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading chats...</p>;
  if (!users.length) return <p className="text-center mt-4">No chats yet</p>;

  return (
    <div className="flex flex-col gap-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="p-2 rounded-md cursor-pointer flex justify-between items-center"
          onClick={() => onSelectUser(user) }
        >
          <div
          className="flex items-center w-full gap-3 p-2 rounded-md cursor-pointer transition bg-emerald-500  hover:bg-emerald-950 "
        >
          <img
            src={user.profile.avatar}
            alt={user.profile.username}
            className="w-12 h-12 rounded-full object-cover"
            onClick={() => navigate(`/user/${user.id}`)}
          />
          <div>
            <p className="text-gray-200 font-semibold">{user.profile.name}</p>
        
          </div>
        </div>
        </div>
      ))}
    </div>
  );
}

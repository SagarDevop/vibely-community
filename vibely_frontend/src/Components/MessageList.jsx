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
          className="p-2 rounded-md hover:bg-gray-700 cursor-pointer flex justify-between items-center"
          onClick={() => onSelectUser(user) }
        >
          <div className="font-medium">{user.username}</div>
        </div>
      ))}
    </div>
  );
}

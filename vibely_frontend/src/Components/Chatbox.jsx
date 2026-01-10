import React, { useState, useEffect } from "react";
import Chat from "./Chat";
import api from "../api";
import MessageList from "./MessageList";
import { Navigate, useNavigate } from "react-router-dom";

export default function Chatbox() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userpro, setUserPro] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fechcurr = async () => {
      try {
        const res = await api.get("/me/");
        setCurrentUserId(res.data.id);
        setUserPro(res.data.profile);
      } catch (error) {
        console.log(error);
      }
    };
    fechcurr();
  }, []);
  
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedUser(null);
  };

  return (
    <>
      <div className="h-[10vh] bg-[#86C232] w-full sticky top-0 z-20 flex">
        <div
          className="flex items-center gap-3 p-2 rounded-md cursor-pointer transition"
          onClick={() => navigate(`/user/${currentUserId}`)}
        >
          <img
            src={userpro.avatar}
            alt={userpro.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="text-gray-900 font-semibold">{userpro.username}</p>
            <p className="text-sm text-gray-900">{userpro.name}</p>
          </div>
        </div>
      </div>
      <div className="flex h-[88vh] gap-4">
        {/* Left: Recent chats */}
        <div className="w-1/3 border-r border-gray-700 p-2 overflow-y-auto">
          <MessageList onSelectUser={handleSelectUser} />
        </div>

        {/* Right: Chat dialog */}
        <div className="flex-1 p-2 relative">
          {!showChat && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 8h10M7 12h6m-6 4h8M5 6a2 2 0 012-2h10a2 2 0 012 2v12l-4-3H7a2 2 0 01-2-2V6z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm text-gray-500 mt-1">
                Select a user from the left to open a chat.
              </p>
            </div>
          )}

          {showChat && selectedUser && (
            <div className="flex flex-col h-[88vh] border rounded shadow-md">
              {/* Header */}
              <div className="flex justify-between items-center p-2 border-b border-gray-700">
                <span className="font-medium">{selectedUser.username}</span>
                <button
                  onClick={handleCloseChat}
                  className="text-red-500 hover:text-red-700"
                >
                  Close
                </button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-2">
                <Chat
                  otherUserId={selectedUser.id}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

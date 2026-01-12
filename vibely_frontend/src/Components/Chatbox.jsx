import React, { useState, useEffect } from "react";
import Chat from "./Chat";
import api from "../api";
import MessageList from "./MessageList";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Chatbox() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userpro, setUserPro] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const res = await api.get("/me/");
        setCurrentUserId(res.data.id);
        setUserPro(res.data.profile);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCurrent();
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  return (
    <div className="h-screen flex flex-col bg-[#181a1b]">
      {!selectedUser && (
        <div className="flex h-16-  bg-[#86C232] items-center px-4 lg:hidden">
          <h1 className="text-white text-2xl font-bold">Messages</h1>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`
            w-full lg:w-1/3
            border-r border-gray-700
            overflow-y-auto
            ${selectedUser ? "hidden lg:block" : "block"}
          `}
        >
          
          <div className="hidden lg:flex items-center h-16 px-4 border-b border-gray-700 bg-[#222629]">
            <h1 className="text-white text-xl font-semibold">Messages</h1>
          </div>

          <MessageList onSelectUser={handleSelectUser} />
        </div>

      
        <div
          className={`
            flex-1
            ${selectedUser ? "block" : "hidden lg:block"}
          `}
        >
          {!selectedUser ? (
            
            <div className="hidden lg:flex flex-col items-center justify-center h-full text-gray-400">
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
                Select a user to begin chatting
              </p>
            </div>
          ) : (
            <div className="lg:h-full h-[90vh] flex flex-col">
              
              <div className="flex items-center gap-3 p-3 border-b border-gray-700 bg-[#222629]">
                <button
                  onClick={handleBack}
                  className="lg:hidden text-white"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>

                <img
                  className="h-9 w-9 rounded-full object-cover"
                  src={selectedUser.profile?.avatar || "/default-avatar.png"}
                  alt=""
                />

                <span className="font-medium text-white">
                  {selectedUser.username}
                </span>
              </div>

              <div className="flex-1 overflow-hidden">
                <Chat
                  otherUserId={selectedUser.id}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

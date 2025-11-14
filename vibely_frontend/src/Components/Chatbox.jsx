import React, { useState ,useEffect } from "react";
import Chat from "./Chat";
import api from "../api";
import MessageList from "./MessageList";

export default function Chatbox() {
  const [currentUserId , setCurrentUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() =>{
    const fechcurr = async() =>{
        try {
            const res = await api.get('/me/')
            setCurrentUserId(res.data.id)
        } catch (error) {
            console.log(error)
            
        }
    } 
    fechcurr();

  }, [])

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedUser(null);
  };

  return (
    <div className="flex h-full gap-4">
      {/* Left: Recent chats */}
      <div className="w-1/3 border-r border-gray-700 p-2 overflow-y-auto">
        <MessageList onSelectUser={handleSelectUser} />
      </div>

      {/* Right: Chat dialog */}
      <div className="flex-1 p-2 relative">
        {!showChat && (
          <p className="text-center mt-10">Select a user to chat</p>
        )}

        {showChat && selectedUser && (
          <div className="flex flex-col h-[100vh] border rounded shadow-md">
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
  );
}

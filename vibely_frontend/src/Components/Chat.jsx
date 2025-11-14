import { useEffect, useState, useRef } from "react";
import api from "../api";

export default function Chat({ otherUserId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!otherUserId) return;

      try {
        const res = await api.get(`/messages/?user=${otherUserId}`);
        console.log(currentUserId, otherUserId);
        setMessages(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setLoading(false);
      }
    };

    fetchMessages();
  }, [otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!messageText.trim() || !otherUserId) return;

    try {
      await api.post("/messages/", {
        receiver: otherUserId,
        text: messageText,
      });
      setMessageText("");

      // Refresh messages after sending
      const res = await api.get(`/messages/?user=${otherUserId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading messages...</p>;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-2 p-1">
        {messages.map((msg) => {
          const isSender = msg.sender === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex my-1 ${
                isSender ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2 rounded-2xl max-w-[75%] ${
                  isSender
                    ? "bg-white text-black rounded-br-none"
                    : "bg-gray-700 text-white rounded-bl-none"
                }`}
              >
                <div>{msg.text}</div>
                <div className="text-[10px] mt-1 text-gray-500 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded border border-gray-600 bg-[#333] text-white"
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}

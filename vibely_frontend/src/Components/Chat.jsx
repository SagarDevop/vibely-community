import { useEffect, useState, useRef } from "react";
import api from "../api";

export default function Chat({ otherUserId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!otherUserId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/messages/?user=${otherUserId}`);
        setMessages(
          res.data.map((msg) => ({
            sender: msg.sender,
            message: msg.text,
            timestamp: msg.timestamp,
          }))
        );
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [otherUserId]);

  useEffect(() => {
    if (!otherUserId || !currentUserId) return;

    const roomName =
      currentUserId < otherUserId
        ? `${currentUserId}_${otherUserId}`
        : `${otherUserId}_${currentUserId}`;

    const backendHost = import.meta.env.VITE_BACKEND_HOST;

    const wsUrl = import.meta.env.DEV
      ? `ws://127.0.0.1:8000/ws/chat/${roomName}/`
      : `wss://https://vibely-backend.onrender.com/ws/chat/${roomName}/`;

    console.log("Connecting WS →", wsUrl);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected:", roomName);
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, data]);
    };

    socket.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    socket.onclose = (e) => {
      console.warn("WebSocket closed:", e.code, e.reason);
    };

    return () => {
      socket.close();
    };
  }, [otherUserId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (
      !messageText.trim() ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        message: messageText,
        sender: currentUserId,
      })
    );

    setMessageText("");
  };

  if (loading) {
    return <p className="text-center mt-10">Loading messages...</p>;
  }
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-2 p-1">
        {messages.map((msg, index) => {
          const isSender = msg.sender === currentUserId;

          return (
            <div
              key={index}
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
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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

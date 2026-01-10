import { useEffect, useState, useRef } from "react";
import api from "../api";

export default function Chat({ otherUserId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages from API
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

  // Setup WebSocket
  useEffect(() => {
    if (!otherUserId || !currentUserId) return;

    const roomName =
      currentUserId < otherUserId
        ? `${currentUserId}_${otherUserId}`
        : `${otherUserId}_${currentUserId}`;

    // Determine correct WebSocket URL depending on environment
    const wsScheme =
      window.location.protocol === "https:" ? "wss" : "ws";
    const wsHost = window.location.host; // works both locally and prod
    const wsUrl = `${wsScheme}://${wsHost}/ws/chat/${roomName}/`;

    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () =>
      console.log("Connected to chat room:", roomName);

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, data]);
    };

    socketRef.current.onerror = (err) => console.error("WebSocket error:", err);

    socketRef.current.onclose = (e) => {
      console.log("WebSocket closed, trying to reconnect...");
      setTimeout(() => {
        // reconnect logic
        socketRef.current = new WebSocket(wsUrl);
      }, 3000);
    };

    return () => {
      socketRef.current?.close();
    };
  }, [otherUserId, currentUserId]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!messageText.trim() || !socketRef.current) return;

    socketRef.current.send(
      JSON.stringify({
        message: messageText,
        sender: currentUserId,
      })
    );

    setMessageText("");
  };

  if (loading) return <p className="text-center mt-10">Loading messages...</p>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-2 p-1">
        {messages.map((msg, index) => {
          const isSender = msg.sender === currentUserId;
          return (
            <div
              key={index}
              className={`flex my-1 ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-2 rounded-2xl max-w-[75%] ${
                  isSender
                    ? "bg-white text-black rounded-br-none"
                    : "bg-gray-700 text-white rounded-bl-none"
                }`}
              >
                <div>{msg.message}</div>
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

import React from "react";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserCircleIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import api from "../api";
import { useEffect, useState } from "react";
export default function VerticalNav({ currentUser, onLogout }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("notifications/unread-count/");
        console.log(res.data.unread_count);
        setData(res.data.unread_count);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const navItems = [
    { name: "Home", icon: <HomeIcon className="w-6 h-6" />, path: "/feed" },
    {
      name: "Search",
      icon: <MagnifyingGlassIcon className="w-6 h-6" />,
      path: "/search",
    },
    { name: "Post", icon: <PlusIcon className="w-6 h-6" />, path: "/Post" },
    {
      name: "Message",
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
      path: "/message",
    },
    {
      name: "Notifications",
      icon: (
        <div className="relative">
          <BellIcon className="w-6 h-6" />
          {data > 0 && (
            <span
              className="absolute -top-1 -right-1 bg-red-600 text-white text-xs
                         min-w-[18px] h-[18px] px-1 flex items-center justify-center
                         rounded-full"
            >
              {data}
            </span>
          )}
        </div>
      ),
      path: "/notifications",
    },
    {
      name: "Profile",
      icon: <UserCircleIcon className="w-6 h-6" />,
      path: `/profile/${currentUser?.username}`,
    },
  ];
  const location = useLocation();

  return (
    <div className="flex flex-col justify-between h-screen w-[15vw] bg-[#222629] text-white p-4 border border-[#6B6E70]/30 sticky top-0">
      <div className="flex flex-col  gap-6 mt-4">
        <div className="text-[#86C232] font-bold text-2xl ml-3 mb-6">
          Vibely
        </div>

        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex gap-3 items-center  w-full p-2 rounded-lg transition-colors
              ${active ? "bg-[#86C232] text-[#222629]" : "hover:bg-[#474B4F]"}`}
              title={item.name}
            >
              {item.icon} {item.name}
            </Link>
          );
        })}
      </div>

      {/* Bottom logout */}
      <button
        className="flex flex-col w-full p-2 rounded-lg hover:bg-[#474B4F] transition-colors mb-4"
        onClick={onLogout}
        title="Logout"
      >
        <ArrowRightOnRectangleIcon className="w-6 h-6" />
      </button>
    </div>
  );
}

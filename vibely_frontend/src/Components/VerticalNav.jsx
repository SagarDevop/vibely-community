import React, { useEffect, useState } from "react";
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

export default function VerticalNav({ currentUser, onLogout }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get("notifications/unread-count/");
        setUnreadCount(res.data.unread_count || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "Home", icon: HomeIcon, path: "/feed" },
    { name: "Search", icon: MagnifyingGlassIcon, path: "/search" },
    { name: "Post", icon: PlusIcon, path: "/Post" },
    { name: "Message", icon: ChatBubbleLeftRightIcon, path: "/message" },
    { name: "Notifications", icon: BellIcon, path: "/notifications" },
    {
      name: "Profile",
      icon: UserCircleIcon,
      path: `/profile/${currentUser?.username}`,
    },
  ];

  return (
    <nav
      className="
        fixed lg:sticky
        bottom-0 lg:top-0
        w-full lg:w-64
        h-16 lg:h-screen
        bg-[#222629] text-white
        border-t lg:border-r border-[#6B6E70]/30
        z-50
        flex lg:flex-col
        justify-evenly
      "
    >
      <div className="hidden lg:block text-[#86C232] font-bold text-2xl px-6 py-6">
        Vibely
      </div>

      <div className="flex lg:flex-col justify-around lg:justify-start lg:gap-2 px-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`
                flex flex-col lg:flex-row items-center gap-1 lg:gap-3
                px-3 py-2 rounded-lg transition
                ${
                  active
                    ? "bg-[#86C232] text-[#222629]"
                    : "hover:bg-[#474B4F]"
                }
              `}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.name === "Notifications" && unreadCount > 0 && (
                  <span
                    className="
                      absolute -top-1 -right-2
                      bg-red-600 text-white text-xs
                      min-w-[18px] h-[18px]
                      flex items-center justify-center
                      rounded-full
                    "
                  >
                    {unreadCount}
                  </span>
                )}
              </div>

              <span className="hidden lg:inline">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <button
        onClick={onLogout}
        className="
          flex items-center justify-center lg:justify-start
          gap-2 px-4 py-3
          hover:bg-[#474B4F]
        "
      >
        <ArrowRightOnRectangleIcon className="w-6 h-6" />
        <span className="hidden lg:inline">Logout</span>
      </button>
    </nav>
  );
}

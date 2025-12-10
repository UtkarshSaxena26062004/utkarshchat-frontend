import React, { useState } from "react";
import { FaCircle, FaSearch, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import ConversationItem from "./ConversationItem";

const Sidebar = ({
  user,
  contacts,
  conversations,
  setConversations,
  activeConversation,
  setActiveConversation,
  onlineUsers,
}) => {
  const { logout, updateAvatar } = useAuth();
  const [search, setSearch] = useState("");

  const startConversation = async (contact) => {
    const { data } = await api.post("/api/chat/conversation", {
      userId: contact._id,
    });
    const exists = conversations.find((c) => c._id === data._id);
    if (!exists) {
      setConversations((prev) => [data, ...prev]);
    }
    setActiveConversation(data);
  };

  const filteredConversations = conversations.filter((c) => {
    const other = c.participants.find((p) => p._id !== user._id);
    return other?.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const { data } = await api.post("/api/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      updateAvatar(data.avatar);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-[30%] min-w-[260px] border-r border-slate-800 flex flex-col bg-gradient-to-b from-slate-900/80 to-slate-950/80">

      {/* USER HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-3">

          {/* USER DP */}
          <div className="relative h-10 w-10 rounded-full overflow-hidden border border-slate-700">
            {user.avatar &&
            (user.avatar.startsWith("http") || user.avatar.startsWith("/uploads")) ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-emerald-600 flex items-center justify-center text-slate-900 font-bold">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}

            <input
              type="file"
              id="avatarUpload"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <label
              htmlFor="avatarUpload"
              className="absolute bottom-0 right-0 bg-emerald-500 text-[8px] px-1 py-0.5 rounded-full cursor-pointer"
            >
              Edit
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-50">{user.name}</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <FaCircle className="text-[7px]" /> Online
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* SEARCH */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 bg-slate-800/60 rounded-2xl px-3 py-1.5 text-xs">
          <FaSearch className="text-slate-500" />
          <input
            className="bg-transparent flex-1 outline-none text-[11px] placeholder:text-slate-500"
            placeholder="Search chats"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* CONTACTS */}
      <div className="px-3 pb-2">
        <p className="text-[11px] text-slate-400 mb-1 px-1">Contacts</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {contacts.map((c) => {
            const isOnline = onlineUsers.includes(c._id);
            return (
              <button
                key={c._id}
                onClick={() => startConversation(c)}
                className="flex-shrink-0 flex flex-col items-center text-[10px] text-slate-300"
              >
                <div className="relative">

                  {/* CONTACT DP — FIXED */}
                  <img
                    src={
                      c.avatar &&
                      (c.avatar.startsWith("http") || c.avatar.startsWith("/uploads"))
                        ? c.avatar
                        : "/default-avatar.png"
                    }
                    alt={c.name}
                    className="h-10 w-10 rounded-full object-cover border border-slate-700"
                  />

                  {/* ONLINE DOT */}
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-500 border border-slate-900 rounded-full" />
                  )}
                </div>

                <span className="truncate max-w-[70px]">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent px-2">
        {filteredConversations.length === 0 ? (
          <p className="text-[11px] text-slate-500 text-center mt-6">
            Start a chat with a contact to see it here.
          </p>
        ) : (
          filteredConversations.map((c) => (
            <ConversationItem
              key={c._id}
              conversation={c}
              isActive={activeConversation?._id === c._id}
              currentUserId={user._id}
              onlineUsers={onlineUsers}
              onClick={() => setActiveConversation(c)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;

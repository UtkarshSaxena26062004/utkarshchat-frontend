import React from "react";

const ConversationItem = ({
  conversation,
  isActive,
  currentUserId,
  onlineUsers,
  onClick,
}) => {
  const other = conversation.participants.find((p) => p._id !== currentUserId);
  const isGroup = conversation.isGroup;
  const title = isGroup ? conversation.name : other?.name;
  const isOnline = !isGroup && onlineUsers.includes(other?._id);

  const renderAvatar = () => {
    if (isGroup) {
      return title?.[0]?.toUpperCase();
    }

    if (
      other?.avatar &&
      (other.avatar.startsWith("http") || other.avatar.startsWith("/uploads"))
    ) {
      return (
        <img
          src={other.avatar}
          alt={other?.name}
          className="h-full w-full rounded-2xl object-cover"
        />
      );
    }

    return other?.avatar || other?.name?.[0]?.toUpperCase();
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl mb-1 text-left transition ${
        isActive
          ? "bg-emerald-500/15 border border-emerald-500/40"
          : "hover:bg-slate-800/60"
      }`}
    >
      <div className="relative h-9 w-9 rounded-2xl bg-slate-800 flex items-center justify-center text-xs font-semibold border border-slate-700 overflow-hidden">
        {renderAvatar()}
        {isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-slate-900" />
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-xs font-medium text-slate-50 truncate">{title}</p>
          {conversation.updatedAt && (
            <p className="text-[10px] text-slate-500">
              {new Date(conversation.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
        <p className="text-[11px] text-slate-400 truncate">
          {conversation.lastMessage?.content || "Say hi 👋"}
        </p>
      </div>
    </button>
  );
};

export default ConversationItem;

import React from "react";
import { FaTrash } from "react-icons/fa";

const MessageBubble = ({ message, isOwn, otherUserId, onDelete }) => {
  const created = new Date(message.createdAt);
  const time = created.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = created.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(message._id);
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={`max-w-[70%] rounded-2xl px-3 py-1.5 text-xs shadow-md ${
          isOwn
            ? "bg-emerald-500 text-slate-950 rounded-br-sm"
            : "bg-slate-800 text-slate-50 rounded-bl-sm"
        }`}
      >
        {message.attachmentUrl && (
          <div className="mb-1">
            {message.attachmentType === "image" ? (
              <img
                src={message.attachmentUrl}
                alt="attachment"
                className="rounded-2xl max-h-60 mb-1"
              />
            ) : (
              <a
                href={message.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="underline text-[11px]"
              >
                Open attachment
              </a>
            )}
          </div>
        )}

        {message.content && (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}

        <div
          className={`mt-0.5 text-[9px] flex items-center justify-between gap-2 ${
            isOwn ? "text-emerald-950/80" : "text-slate-400/80"
          }`}
        >
          <span className="flex items-center gap-1">
            <span>{time}</span>
            <span>•</span>
            <span>{date}</span>
          </span>

          <span className="flex items-center gap-1">
            {isOwn && (
              <button
                onClick={handleDeleteClick}
                className="opacity-70 hover:opacity-100 transition"
                title="Delete message"
              >
                <FaTrash className="text-[9px]" />
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

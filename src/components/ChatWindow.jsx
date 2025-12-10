// import React, { useEffect, useRef, useState } from "react";
// import { FaPaperPlane, FaPaperclip, FaSmile } from "react-icons/fa";
// import { useSocket } from "../context/SocketContext";
// import api from "../api/axios";
// import MessageBubble from "./MessageBubble";

// const EMOJIS = [
//   "😀","😁","😂","🤣","😃","😄","😅","😊","😍","😘",
//   "😎","🤩","😇","😉","🙃","😋","😜","🤪","🤗","🤭",
//   "😢","😭","😡","🤬","😱","😴","🤔","🤨","😐","😶",
//   "👍","👎","🙏","👏","🙌","🤝","👌","✌️","🤞","🫶",
// ];

// const ChatWindow = ({ user, activeConversation, setActiveConversation }) => {
//   const { socket } = useSocket();
//   const [message, setMessage] = useState("");
//   const bottomRef = useRef(null);
//   const typingTimeoutRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const [pendingAttachment, setPendingAttachment] = useState(null);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);

//   const messages = activeConversation?.messages || [];

//   // Load messages from server
//   useEffect(() => {
//     const loadMessages = async () => {
//       if (!activeConversation) return;
//       try {
//         const { data } = await api.get(`/api/chat/messages/${activeConversation._id}`);
//         setActiveConversation((prev) =>
//           prev && prev._id === activeConversation._id
//             ? { ...prev, messages: data }
//             : prev
//         );
//         if (socket) {
//           socket.emit("join-conversation", activeConversation._id);
//         }
//       } catch (err) {
//         console.error("loadMessages error", err);
//       }
//     };
//     loadMessages();
//   }, [activeConversation?._id, socket, setActiveConversation]);

//   // Auto scroll
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Mark messages as seen
//   useEffect(() => {
//     const markSeen = async () => {
//       if (!activeConversation || !socket) return;
//       try {
//         await api.put(`/api/chat/messages/seen/${activeConversation._id}`);
//         socket.emit("messages-seen", { conversationId: activeConversation._id });
//       } catch (err) {
//         console.error("seen error", err);
//       }
//     };
//     markSeen();
//   }, [activeConversation?._id, socket]);

//   // SEND MESSAGE
//   const handleSend = () => {
//     if (!message.trim() && !pendingAttachment) return;
//     if (!socket || !activeConversation) return;

//     socket.emit("send-message", {
//       conversationId: activeConversation._id,
//       content: message.trim(),
//       attachmentUrl: pendingAttachment?.url || null,
//       attachmentType: pendingAttachment?.type || null,
//     });

//     setMessage("");
//     setPendingAttachment(null);
//     setShowEmojiPicker(false);
//   };

//   // DELETE MESSAGE
//   const handleDeleteMessage = (id) => {
//     if (!socket || !activeConversation) return;

//     socket.emit("delete-message", { messageId: id });
//   };

//   // HANDLE TYPING
//   const handleTyping = (value) => {
//     setMessage(value);

//     if (!socket || !activeConversation) return;

//     socket.emit("typing", { conversationId: activeConversation._id, isTyping: true });

//     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

//     typingTimeoutRef.current = setTimeout(() => {
//       socket.emit("typing", { conversationId: activeConversation._id, isTyping: false });
//     }, 1500);
//   };

//   // FILE UPLOAD
//   const handleFileChange = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const { data } = await api.post("/api/chat/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" }
//       });

//       let type = "file";
//       if (data.mimeType.startsWith("image/")) type = "image";

//       setPendingAttachment({ url: data.url, type });
//     } catch (err) {
//       console.error("upload error", err);
//     }
//   };

//   if (!activeConversation) {
//     return (
//       <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-950/80 to-slate-900/80">
//         <div className="text-center">
//           <p className="text-emerald-400 text-sm font-semibold mb-1">Welcome to UtkarshChat</p>
//           <p className="text-xs text-slate-400">
//             Select a contact from the left or start a new conversation to begin chatting.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // DETECT OPPOSITE USER (DP FIX)
//   const isGroup = activeConversation.isGroup;
//   let other = null;

//   if (!isGroup && Array.isArray(activeConversation.participants)) {
//     other = activeConversation.participants.find(
//       (p) => String(p._id) !== String(user._id)
//     );
//     if (!other) other = activeConversation.participants[0];
//   }

//   const title = isGroup ? activeConversation.name : other?.name;

//   const avatarElement = isGroup
//     ? title?.charAt(0)?.toUpperCase()
//     : other?.avatar &&
//       (other.avatar.startsWith("http") || other.avatar.startsWith("/uploads"))
//     ? (
//         <img
//           src={other.avatar}
//           alt={other?.name}
//           className="h-full w-full object-cover"
//         />
//       )
//     : (
//         (other?.avatar || other?.name?.charAt(0)?.toUpperCase())
//       );

//   return (
//     <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-slate-950/80">

//       {/* HEADER */}
//       <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
//         <div className="flex items-center gap-3">
//           <div className="h-9 w-9 rounded-2xl bg-slate-800 flex items-center justify-center text-xs font-semibold border border-slate-700 overflow-hidden">
//             {avatarElement}
//           </div>
//           <div>
//             <p className="text-sm font-medium text-slate-50">{title}</p>
//             <p className="text-[11px] text-emerald-400">
//               {activeConversation.typingUser ? "typing..." : "online recently"}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* MESSAGES */}
//       <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
//         {messages.map((m) => (
//           <MessageBubble
//             key={m._id}
//             message={m}
//             isOwn={m.sender._id === user._id}
//             otherUserId={other?._id}
//             onDelete={handleDeleteMessage}
//           />
//         ))}
//         <div ref={bottomRef} />
//       </div>

//       {/* ATTACHMENT PREVIEW */}
//       {pendingAttachment && (
//         <div className="px-4 pb-1 text-[11px] text-slate-300 flex items-center gap-2">
//           {pendingAttachment.type === "image" ? (
//             <img
//               src={pendingAttachment.url}
//               alt="preview"
//               className="h-12 w-12 object-cover rounded-xl"
//             />
//           ) : (
//             <span>📎 Attachment ready</span>
//           )}
//           <button
//             className="text-red-400"
//             onClick={() => setPendingAttachment(null)}
//           >
//             remove
//           </button>
//         </div>
//       )}

//       {/* INPUT BOX */}
//       <div className="px-4 py-3 border-t border-slate-800">
//         <div className="relative">

//           {/* EMOJI PICKER */}
//           {showEmojiPicker && (
//             <div className="absolute bottom-12 left-0 w-64 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-xl z-20">
//               <div className="flex flex-wrap gap-1 text-lg">
//                 {EMOJIS.map((e) => (
//                   <button
//                     key={e}
//                     type="button"
//                     onClick={() => setMessage((prev) => prev + e)}
//                     className="hover:bg-slate-800 rounded-lg px-1"
//                   >
//                     {e}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="flex items-center gap-2 bg-slate-800/80 rounded-2xl px-3 py-2">
//             <button
//               className="p-1.5 rounded-xl hover:bg-slate-700/80 text-slate-300"
//               onClick={() => setShowEmojiPicker((p) => !p)}
//             >
//               <FaSmile className="text-sm" />
//             </button>

//             <button
//               className="p-1.5 rounded-xl hover:bg-slate-700/80 text-slate-300"
//               onClick={() => fileInputRef.current?.click()}
//             >
//               <FaPaperclip className="text-sm" />
//             </button>
//             <input
//               type="file"
//               ref={fileInputRef}
//               className="hidden"
//               onChange={handleFileChange}
//             />

//             <input
//               className="flex-1 bg-transparent text-xs text-slate-50 outline-none px-1"
//               placeholder="Type a message"
//               value={message}
//               onChange={(e) => handleTyping(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && !e.shiftKey) {
//                   e.preventDefault();
//                   handleSend();
//                 }
//               }}
//             />

//             <button
//               onClick={handleSend}
//               className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-800/40"
//             >
//               <FaPaperPlane className="text-xs" />
//             </button>
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default ChatWindow;

import React, { useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaPaperclip, FaSmile } from "react-icons/fa";
import { useSocket } from "../context/SocketContext";
import api from "../api/axios";
import MessageBubble from "./MessageBubble";

const EMOJIS = [
  "😀","😁","😂","🤣","😃","😄","😅","😊","😍","😘",
  "😎","🤩","😇","😉","🙃","😋","😜","🤪","🤗","🤭",
  "😢","😭","😡","🤬","😱","😴","🤔","🤨","😐","😶",
  "👍","👎","🙏","👏","🙌","🤝","👌","✌️","🤞","🫶",
];

const ChatWindow = ({ user, activeConversation, setActiveConversation }) => {
  const { socket } = useSocket();
  const [message, setMessage] = useState("");
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messages = activeConversation?.messages || [];

  // Load messages when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversation) return;
      try {
        const { data } = await api.get(`/api/chat/messages/${activeConversation._id}`);
        setActiveConversation((prev) =>
          prev && prev._id === activeConversation._id
            ? { ...prev, messages: data }
            : prev
        );
        socket?.emit("join-conversation", activeConversation._id);
      } catch (err) {
        console.error("loadMessages error", err);
      }
    };
    loadMessages();
  }, [activeConversation?._id, socket, setActiveConversation]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark seen
  useEffect(() => {
    if (!activeConversation) return;

    const markSeen = async () => {
      try {
        await api.put(`/api/chat/messages/seen/${activeConversation._id}`);
        socket?.emit("messages-seen", { conversationId: activeConversation._id });
      } catch (err) {
        console.error("Seen error", err);
      }
    };
    markSeen();
  }, [activeConversation?._id, socket]);

  // SEND MESSAGE
  const handleSend = () => {
    if (!message.trim() && !pendingAttachment) return;
    if (!socket || !activeConversation) return;

    socket.emit("send-message", {
      conversationId: activeConversation._id,
      content: message.trim(),
      attachmentUrl: pendingAttachment?.url || null,
      attachmentType: pendingAttachment?.type || null,
    });

    setMessage("");
    setPendingAttachment(null);
    setShowEmojiPicker(false);
  };

  // DELETE MESSAGE
  const handleDeleteMessage = (id) => {
    if (!socket || !activeConversation) return;
    socket.emit("delete-message", { messageId: id });
  };

  // TYPING
  const handleTyping = (value) => {
    setMessage(value);
    if (!socket || !activeConversation) return;

    socket.emit("typing", { conversationId: activeConversation._id, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { conversationId: activeConversation._id, isTyping: false });
    }, 1500);
  };

  // FILE UPLOAD
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post("/api/chat/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      let type = data.mimeType.startsWith("image/") ? "image" : "file";
      setPendingAttachment({ url: data.url, type });
    } catch (err) {
      console.error("upload error", err);
    }
  };

  // RETURN EMPTY WHEN NO CHAT SELECTED
  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900/80">
        <p className="text-slate-400 text-sm">Select a conversation to start chatting</p>
      </div>
    );
  }

  // DETECT OTHER USER (DP FIX)
  const isGroup = activeConversation.isGroup;
  let other = null;

  if (!isGroup && Array.isArray(activeConversation.participants)) {
    other = activeConversation.participants.find(
      (p) => String(p._id) !== String(user._id)
    );
    if (!other) other = activeConversation.participants[0];
  }

  const title = isGroup ? activeConversation.name : other?.name;

  const avatarElement = isGroup
    ? title?.charAt(0)?.toUpperCase()
    : other?.avatar &&
      (other.avatar.startsWith("http") || other.avatar.startsWith("/uploads"))
    ? (
        <img
          src={other.avatar}
          alt="avatar"
          className="h-full w-full object-cover"
        />
      )
    : (other?.avatar || other?.name?.charAt(0)?.toUpperCase());

  return (
    <div className="flex-1 flex flex-col bg-slate-900/80">

      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="h-10 w-10 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-white font-semibold">
          {avatarElement}
        </div>
        <div>
          <p className="text-sm text-white font-semibold">{title}</p>
          <p className="text-xs text-emerald-400">
            {activeConversation.typingUser ? "typing..." : "online"}
          </p>
        </div>
      </div>

      {/* MESSAGE LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.map((m) => (
          <MessageBubble
            key={m._id}
            message={m}
            isOwn={m.sender._id === user._id}
            otherUserId={other?._id}
            onDelete={handleDeleteMessage}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ATTACHMENT PREVIEW */}
      {pendingAttachment && (
        <div className="px-4 pb-1 text-[11px] text-slate-300 flex items-center gap-2">
          {pendingAttachment.type === "image" ? (
            <img
              src={pendingAttachment.url}
              alt="preview"
              className="h-12 w-12 object-cover rounded-xl"
            />
          ) : (
            <span>📎 Attachment ready</span>
          )}
          <button
            className="text-red-400"
            onClick={() => setPendingAttachment(null)}
          >
            remove
          </button>
        </div>
      )}

      {/* INPUT AREA */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/70">
        <div className="relative">

          {/* EMOJI PICKER */}
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 w-64 max-h-56 overflow-y-auto bg-slate-850 border border-slate-700 rounded-2xl p-2 shadow-xl z-20">
              <div className="flex flex-wrap gap-1 text-lg">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setMessage((prev) => prev + e)}
                    className="hover:bg-slate-800 rounded-lg px-1"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-800/80 rounded-2xl px-3 py-2">

            {/* EMOJI BTN */}
            <button
              className="p-1.5 rounded-xl hover:bg-slate-700/80 text-slate-300"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              <FaSmile className="text-sm" />
            </button>

            {/* ATTACHMENT */}
            <button
              className="p-1.5 rounded-xl hover:bg-slate-700/80 text-slate-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaPaperclip className="text-sm" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            {/* INPUT */}
            <input
              className="flex-1 bg-transparent text-xs text-slate-50 outline-none px-1"
              placeholder="Type a message"
              value={message}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            {/* SEND */}
            <button
              onClick={handleSend}
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-lg shadow-emerald-800/40"
            >
              <FaPaperPlane className="text-xs" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatWindow;

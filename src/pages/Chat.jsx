// import React, { useEffect, useState, useCallback } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useSocket } from "../context/SocketContext";
// import api from "../api/axios";
// import Sidebar from "../components/Sidebar";
// import ChatWindow from "../components/ChatWindow";

// const Chat = () => {
//   const { user } = useAuth();
//   const { socket, onlineUsers } = useSocket();
//   const [contacts, setContacts] = useState([]);
//   const [conversations, setConversations] = useState([]);
//   const [activeConversation, setActiveConversation] = useState(null);

//   // 🔁 Contacts + conversations fetch
//   const loadData = useCallback(async () => {
//     try {
//       const [contactsRes, convosRes] = await Promise.all([
//         api.get("/api/chat/contacts"),
//         api.get("/api/chat/conversations"),
//       ]);
//       setContacts(contactsRes.data);
//       setConversations(convosRes.data);

//       // agar koi active convo select nahi hai to by default first wale ko select kar sakte hain
//       if (!activeConversation && convosRes.data.length > 0) {
//         setActiveConversation(convosRes.data[0]);
//       }
//     } catch (err) {
//       console.error("loadData error:", err.message);
//     }
//   }, [activeConversation]);

//   useEffect(() => {
//     if (user) {
//       loadData();
//     }
//   }, [user, loadData]);

//   // 🔌 SOCKET LISTENERS
//   useEffect(() => {
//     if (!socket) return;

//     const handleNewMessage = (message) => {
//       const convId =
//         typeof message.conversation === "string"
//           ? message.conversation
//           : message.conversation?._id;

//       // 🔍 check – kya yeh convo list me hai?
//       setConversations((prev) => {
//         const exists = prev.some((c) => c._id === convId);

//         // agar nahi hai (mostly receiver side) → fresh data fetch
//         if (!exists) {
//           // async call allowed – side-effect
//           loadData();
//           return prev;
//         }

//         // agar hai → uska lastMessage update karo
//         return prev.map((c) =>
//           c._id === convId
//             ? { ...c, lastMessage: message, updatedAt: message.createdAt }
//             : c
//         );
//       });

//       // agar current active chat wahi hai to messages push karo
//       setActiveConversation((prev) => {
//         if (!prev || prev._id !== convId) return prev;
//         const msgs = [...(prev.messages || []), message];
//         return { ...prev, messages: msgs };
//       });
//     };

//     const handleTyping = ({ conversationId, userId, isTyping }) => {
//       setActiveConversation((prev) => {
//         if (!prev || prev._id !== conversationId) return prev;
//         if (userId === user._id) return prev;
//         return { ...prev, typingUser: isTyping ? userId : null };
//       });
//     };

//     const handleMessageDeleted = ({ messageId, conversationId }) => {
//       setActiveConversation((prev) => {
//         if (!prev || prev._id !== conversationId) return prev;
//         return {
//           ...prev,
//           messages: (prev.messages || []).filter((m) => m._id !== messageId),
//         };
//       });

//       setConversations((prev) =>
//         prev.map((c) => {
//           if (c._id !== conversationId) return c;
//           if (c.lastMessage && c.lastMessage._id === messageId) {
//             return { ...c, lastMessage: null };
//           }
//           return c;
//         })
//       );
//     };

//     socket.on("new-message", handleNewMessage);
//     socket.on("typing", handleTyping);
//     socket.on("message-deleted", handleMessageDeleted);

//     return () => {
//       socket.off("new-message", handleNewMessage);
//       socket.off("typing", handleTyping);
//       socket.off("message-deleted", handleMessageDeleted);
//     };
//   }, [socket, user?._id, loadData]);

//   return (
//     <div className="min-h-screen bg-slate-950 flex items-center justify-center px-2 py-3">
//       <div className="flex w-full max-w-6xl h-[90vh] rounded-3xl bg-slate-900/80 border border-slate-800 shadow-[0_0_120px_-40px_rgba(16,185,129,0.7)] overflow-hidden">
//         <Sidebar
//           user={user}
//           contacts={contacts}
//           conversations={conversations}
//           setConversations={setConversations}
//           activeConversation={activeConversation}
//           setActiveConversation={setActiveConversation}
//           onlineUsers={onlineUsers}
//         />
//         <ChatWindow
//           user={user}
//           activeConversation={activeConversation}
//           setActiveConversation={setActiveConversation}
//         />
//       </div>
//     </div>
//   );
// };

// export default Chat;

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Chat = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  // Fetch contacts + conversations
  const loadData = useCallback(async () => {
    try {
      const [contactsRes, convosRes] = await Promise.all([
        api.get("/api/chat/contacts"),
        api.get("/api/chat/conversations"),
      ]);

      setContacts(contactsRes.data);
      setConversations(convosRes.data);

      if (!activeConversation && convosRes.data.length > 0) {
        setActiveConversation(convosRes.data[0]);
      }
    } catch (err) {
      console.error("loadData error:", err.message);
    }
  }, [activeConversation]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // SOCKET LISTENERS
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      const convId =
        typeof message.conversation === "string"
          ? message.conversation
          : message.conversation?._id;

      setConversations((prev) => {
        const exists = prev.some((c) => c._id === convId);
        if (!exists) {
          loadData();
          return prev;
        }

        return prev.map((c) =>
          c._id === convId
            ? { ...c, lastMessage: message, updatedAt: message.createdAt }
            : c
        );
      });

      setActiveConversation((prev) => {
        if (!prev || prev._id !== convId) return prev;
        const msgs = [...(prev.messages || []), message];
        return { ...prev, messages: msgs };
      });
    };

    const handleTyping = ({ conversationId, userId, isTyping }) => {
      setActiveConversation((prev) => {
        if (!prev || prev._id !== conversationId) return prev;
        if (userId === user._id) return prev;
        return { ...prev, typingUser: isTyping ? userId : null };
      });
    };

    const handleDelete = ({ messageId, conversationId }) => {
      setActiveConversation((prev) => {
        if (!prev || prev._id !== conversationId) return prev;
        return {
          ...prev,
          messages: prev.messages.filter((m) => m._id !== messageId),
        };
      });
    };

    socket.on("new-message", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("message-deleted", handleDelete);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("message-deleted", handleDelete);
    };
  }, [socket, user?._id, loadData]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-2 py-3">

      {/* OUTER WRAPPER */}
      <div className="flex flex-col sm:flex-row w-full max-w-6xl h-[90vh] 
                      rounded-3xl bg-slate-900/80 border border-slate-800 
                      shadow-[0_0_120px_-40px_rgba(16,185,129,0.7)] overflow-hidden">

        {/* SIDEBAR ONLY IF (desktop) OR (mobile AND no active chat) */}
        {(!activeConversation || window.innerWidth >= 640) && (
          <Sidebar
            user={user}
            contacts={contacts}
            conversations={conversations}
            setConversations={setConversations}
            activeConversation={activeConversation}
            setActiveConversation={setActiveConversation}
            onlineUsers={onlineUsers}
          />
        )}

        {/* MOBILE BACK BUTTON */}
        {activeConversation && window.innerWidth < 640 && (
          <div
            className="sm:hidden p-2 text-xs bg-slate-800 text-slate-300 cursor-pointer"
            onClick={() => setActiveConversation(null)}
          >
            ← Back
          </div>
        )}

        {/* CHAT WINDOW */}
        <ChatWindow
          user={user}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
        />
      </div>
    </div>
  );
};

export default Chat;

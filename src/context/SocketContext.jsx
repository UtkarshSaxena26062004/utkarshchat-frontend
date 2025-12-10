import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // user logout / not logged in
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setOnlineUsers([]);
      return;
    }

    const token = localStorage.getItem("token"); // 👈 AuthContext ke saath SAME key
    if (!token) {
      console.warn("No token found for socket auth");
      return;
    }

    const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const s = io(backendURL, {
      auth: { token }, // 👈 authMiddlewareSocket: socket.handshake.auth.token
    });

    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);
    });

    s.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    s.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

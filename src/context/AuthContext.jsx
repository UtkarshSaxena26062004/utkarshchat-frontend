import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // Save user to storage whenever updated
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Login
  const login = (data) => {
    setUser(data.user);
    localStorage.setItem("token", data.token);
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // UPDATE AVATAR
const updateAvatar = (newAvatar) => {
  setUser((prev) => {
    if (!prev) return prev;
    const updated = { ...prev, avatar: newAvatar };
    localStorage.setItem("user", JSON.stringify(updated));
    return updated;
  });
};

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

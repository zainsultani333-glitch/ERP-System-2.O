import React, { createContext, useContext, useState, useEffect } from "react";

import api from "../Api/AxiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });


  // ✅ Verify token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;

      try {
        const res = await api.get("/token/check", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // ❌ If token invalid or expired
        if (!res.data.success) {
          throw new Error("Invalid token");
        }
      } catch (error) {
        console.warn("Token expired or invalid — logging out");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken("");
      window.location.href = "/login";
      }
    };

    verifyToken();
  }, []);

  // ✅ Login and store user/token
  const login = (userData, tokenValue) => {
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setToken(tokenValue); // ✅ fixed variable name
  };

  // ✅ Logout clears everything
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

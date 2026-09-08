import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse stored auth session", e);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, id, name, role, phone } = response.data;

    const userData = { id, name, email, role, phone };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(token);
    setUser(userData);
    return userData;
  };

  const register = async (signUpData) => {
    const response = await api.post("/auth/register", signUpData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedProfile) => {
    const updated = { ...user, ...updatedProfile };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  const role = user ? user.role : null;
  const isAdmin = role === "ROLE_ADMIN";
  const isUser = role === "ROLE_USER";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAdmin,
        isUser,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

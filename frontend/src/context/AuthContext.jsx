import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";
import { ROLES } from "../config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (!token || !role) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("username", res.data.username);
    setUser({
      username: res.data.username,
      role: res.data.role,
    });
    return res.data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isSuperAdmin, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

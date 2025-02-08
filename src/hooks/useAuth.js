import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const url = import.meta.env.VITE_BASE_URL;
  const [storedUser, setStoredUser] = useState(() => {
    return JSON.parse(sessionStorage.getItem("user")) || null;
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
      setStoredUser(user);
    }
  }, [user]);

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    localStorage.removeItem("privateChats");
    sessionStorage.removeItem("user");
    logout({ returnTo: url });
  };

  return {
    user: storedUser || user,
    isAuthenticated: isAuthenticated || !!storedUser,
    isLoading,
    handleLogout,
  };
};
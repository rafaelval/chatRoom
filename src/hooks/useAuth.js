import { useAuth0 } from "@auth0/auth0-react";

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const url = import.meta.env.VITE_BASE_URL;

  const handleLogout = () => {
    localStorage.removeItem("privateChats"); // Borrar chats al cerrar sesión
    logout({ returnTo: url });
  };

  return { user, isAuthenticated, isLoading, handleLogout };
};

import { useEffect, useRef } from "react";
import socketIO from "socket.io-client";

const socketUrl = import.meta.env.VITE_API_URL;

export const useSocket = (user, setMessages, setUsers, addMessageToPrivateChat, openTabs, setActiveTab) => {
  const socket = useRef(null);

  useEffect(() => {
    if (user) {
      socket.current = socketIO.connect(socketUrl);
      socket.current.emit("registerUser", { name: user.name });

      socket.current.on("updateUsers", (usersList) => setUsers(usersList));
      socket.current.on("messageResponse", (data) => setMessages((prev) => [...prev, data]));
      socket.current.on("privateMessageResponse", ({ from, message }) => {
        addMessageToPrivateChat(from, from, message); // Agregar mensaje al chat privado
      });

      socket.current.on("openPrivateChat", (sender) => {
        if (!openTabs.includes(sender)) {
          setActiveTab(sender); // Cambiar a la pestaña del remitente
        }
      });

      return () => {
        socket.current.disconnect();
      };
    }
  }, [user, openTabs]);

  const sendMessage = (type, recipient, message) => {
    if (type === "general" && message.trim()) {
      socket.current.emit("message", { name: user.name, text: message });
    } else if (type === "private" && message.trim()) {
      socket.current.emit("privateMessage", { to: recipient, message, from: user.name });
    }
  };

  return { sendMessage };
};
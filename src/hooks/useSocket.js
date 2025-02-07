import { useEffect, useRef } from "react";
import socketIO from "socket.io-client";

const socketUrl = import.meta.env.VITE_API_URL;

export const useSocket = (
  user,
  setMessages,
  setUsers,
  addMessageToPrivateChat,
  openTabs,
  setActiveTab
) => {
  const socket = useRef(null);

  useEffect(() => {
    if (user) {
      socket.current = socketIO.connect(socketUrl);
      socket.current.emit("registerUser", { name: user.name });

      // Escuchar eventos del servidor
      socket.current.on("updateUsers", (usersList) => setUsers(usersList));
      socket.current.on("messageResponse", (data) =>
        setMessages((prev) => [...prev, data])
      );
      socket.current.on("privateMessageResponse", ({ from, message }) => {
        addMessageToPrivateChat(from, from, message); // Agregar mensaje al chat privado
      });
      socket.current.on("fileResponse", (data) => {
        setMessages((prev) => [...prev, data]); // Agregar archivo recibido al chat
      });
      socket.current.on(
        "privateFileResponse",
        ({ from, file, fileName, to }) => {
          console.log("Archivo recibido en el frontend:", {
            from,
            fileName,
            to,
          }); // Depuración

          // Agregar el archivo a la conversación con el destinatario
          addMessageToPrivateChat(to, from, { file, fileName });
        }
      );

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

  // Función para enviar mensajes de texto
  const sendMessage = (type, recipient, message) => {
    if (type === "general" && message.trim()) {
      socket.current.emit("message", { name: user.name, text: message });
    } else if (type === "private" && message.trim()) {
      socket.current.emit("privateMessage", {
        to: recipient,
        message,
        from: user.name,
      });
    }
  };

  // Función para enviar archivos
  const sendFile = (type, recipient, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const fileData = reader.result;
      console.log("Archivo leído:"); // Depuración
      if (type === "general") {
        socket.current.emit("fileUpload", {
          name: user.name,
          file: fileData,
          fileName: file.name,
        });
      } else if (type === "private") {
        socket.current.emit("privateFileUpload", {
          to: recipient,
          file: fileData,
          fileName: file.name,
          from: user.name,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return { sendMessage, sendFile };
};

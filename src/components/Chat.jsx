import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState, useRef } from "react";
import socketIO from "socket.io-client";

const socketUrl = import.meta.env.VITE_API_URL;
const url = import.meta.env.VITE_BASE_URL;
const socket = socketIO.connect(socketUrl);

export const Chat = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [privateChats, setPrivateChats] = useState(() => {
    return JSON.parse(localStorage.getItem("privateChats")) || {};
  });
  const [activeTab, setActiveTab] = useState("general");
  const [openTabs, setOpenTabs] = useState([]); // Nuevo estado para manejar pestañas abiertas
  const messagesEndRef = useRef(null);

  // Guardar en localStorage cada vez que privateChats cambie
  useEffect(() => {
    localStorage.setItem("privateChats", JSON.stringify(privateChats));
  }, [privateChats]);

  useEffect(() => {
    if (isAuthenticated && user) {
      socket.emit("registerUser", { name: user.name });

      socket.on("updateUsers", (usersList) => setUsers(usersList));
      socket.on("messageResponse", (data) => setMessages((prev) => [...prev, data]));
      socket.on("privateMessageResponse", ({ from, message }) => {
        setPrivateChats((prevChats) => {
          const updatedChats = {
            ...prevChats,
            [from]: [...(prevChats[from] || []), { sender: from, message }],
          };
          return updatedChats;
        });

        // Abrir automáticamente la pestaña si no está abierta
        if (!openTabs.includes(from)) {
          setOpenTabs((prevTabs) => [...prevTabs, from]);
        }
      });

      // Escuchar evento para abrir pestaña de chat
      socket.on("openPrivateChat", (sender) => {
        if (!openTabs.includes(sender)) {
          setOpenTabs((prevTabs) => [...prevTabs, sender]);
        }
        setActiveTab(sender); // Cambiar a la pestaña del remitente
      });

      return () => {
        socket.off("messageResponse");
        socket.off("privateMessageResponse");
        socket.off("updateUsers");
        socket.off("openPrivateChat");
      };
    }
  }, [isAuthenticated, user, openTabs]);

  const sendPrivateMessage = (recipient, privateMessage) => {
    if (!privateMessage.trim()) return;
    
    socket.emit("privateMessage", { to: recipient, message: privateMessage, from: user.name });
    setPrivateChats((prevChats) => {
      const updatedChats = {
        ...prevChats,
        [recipient]: [...(prevChats[recipient] || []), { sender: user.name, message: privateMessage }],
      };
      return updatedChats;
    });

    // Notificar al receptor para que abra la pestaña de chat
    socket.emit("openPrivateChat", { recipient, sender: user.name });

    setMessage("");
  };

  const openPrivateChat = (recipient) => {
    setPrivateChats((prevChats) => ({
      ...prevChats,
      [recipient]: prevChats[recipient] || [], // Asegurar que se cree el chat aunque esté vacío
    }));
    setOpenTabs((prevTabs) => [...new Set([...prevTabs, recipient])]); // Añadir la pestaña a las abiertas
    setActiveTab(recipient);
  };

  const closePrivateChat = (recipient) => {
    setOpenTabs((prevTabs) => prevTabs.filter(tab => tab !== recipient)); // Cerrar la pestaña

    // Si la pestaña activa es la que se cierra, volver a "general"
    if (activeTab === recipient) {
      setActiveTab("general");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("privateChats"); // Borrar chats al cerrar sesión
    logout({ returnTo: url });
  };

  if (isLoading) return <p>Cargando...</p>;

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Barra de navegación */}
      <div className="bg-slate-800 p-4 flex justify-between items-center">
        <h1 className="text-white text-2xl">Chat General</h1>
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        )}
      </div>

      <div className="flex flex-1">
        {/* Contenedor principal del chat */}
        <div className="flex-1 bg-gray-50 p-4 overflow-hidden flex flex-col">
          {/* Pestañas de Chats */}
          <div className="flex border-b space-x-2">
            <button
              className={`px-4 py-2 ${
                activeTab === "general" ? "bg-gray-200 font-bold" : "bg-white"
              } border-t border-l border-r rounded-t`}
              onClick={() => setActiveTab("general")}
            >
              Chat General
            </button>

            {openTabs.map((recipient) => (
              <div key={recipient} className="flex items-center">
                <button
                  className={`px-4 py-2 ${
                    activeTab === recipient ? "bg-gray-200 font-bold" : "bg-white"
                  } border-t border-l border-r rounded-t flex items-center`}
                  onClick={() => setActiveTab(recipient)}
                >
                  {recipient}
                  <span
                    className="ml-2 text-red-500 cursor-pointer hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar cambio de pestaña al hacer clic en la "X"
                      closePrivateChat(recipient);
                    }}
                  >
                    ✖
                  </span>
                </button>
              </div>
            ))}
          </div>

          {/* Contenido de las pestañas */}
          <div className="flex-1 overflow-y-auto p-2">
            {activeTab === "general" && (
              <>
                {messages.map((msg, index) => (
                  <div key={index} className="bg-gray-200 p-2 rounded-lg mb-2 max-w-[60%]">
                    <strong>{msg.name}: </strong>
                    {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}

            {activeTab !== "general" && privateChats[activeTab] && (
              <>
                {privateChats[activeTab].map((msg, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg mb-2 ${
                      msg.sender === user.name ? "bg-blue-200 text-right" : "bg-gray-200"
                    }`}
                  >
                    <strong>{msg.sender}: </strong>
                    {msg.message}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Entrada de Mensaje */}
          <div className="p-4 bg-gray-100 flex items-center gap-4">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && activeTab !== "general") {
                  sendPrivateMessage(activeTab, message);
                }
              }}
            />
            <button
              onClick={() => {
                if (activeTab !== "general") {
                  sendPrivateMessage(activeTab, message);
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Enviar
            </button>
          </div>
        </div>

        {/* Lista de Usuarios Conectados */}
        <div className="w-1/4 bg-gray-100 p-4 border-l border-gray-300">
          <h2 className="text-lg font-bold mb-2">Usuarios Conectados</h2>
          <ul>
            {users
              .filter((userName) => userName !== user.name)
              .map((userName, index) => (
                <li
                  key={index}
                  className="p-2 bg-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-300"
                  onClick={() => openPrivateChat(userName)}
                >
                  {userName}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
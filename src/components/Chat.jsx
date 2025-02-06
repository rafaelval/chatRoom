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
  const [privateChats, setPrivateChats] = useState({});
  const [activeTab, setActiveTab] = useState("general"); // Manejo de pestañas
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      socket.emit("registerUser", { name: user.name });

      socket.on("updateUsers", (usersList) => setUsers(usersList));
      socket.on("messageResponse", (data) => setMessages((prev) => [...prev, data]));
      socket.on("privateMessageResponse", ({ from, message }) => {
        setPrivateChats((prevChats) => ({
          ...prevChats,
          [from]: [...(prevChats[from] || []), { sender: from, message }],
        }));
      });

      return () => {
        socket.off("messageResponse");
        socket.off("privateMessageResponse");
        socket.off("updateUsers");
      };
    }
  }, [isAuthenticated, user]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== "" && user) {
      socket.emit("message", { text: message, name: user.name });
      setMessage("");
    }
  };

  const sendPrivateMessage = (recipient, privateMessage) => {
    socket.emit("privateMessage", { to: recipient, message: privateMessage, from: user.name });
    setPrivateChats((prevChats) => ({
      ...prevChats,
      [recipient]: [...(prevChats[recipient] || []), { sender: user.name, message: privateMessage }],
    }));
  };

  const openPrivateChat = (recipient) => {
    if (!privateChats[recipient]) {
      setPrivateChats((prevChats) => ({ ...prevChats, [recipient]: [] }));
    }
    setActiveTab(recipient); // Activar la pestaña del chat seleccionado
  };

  const closeChat = (recipient) => {
    setPrivateChats((prevChats) => {
      const updatedChats = { ...prevChats };
      delete updatedChats[recipient];
      return updatedChats;
    });

    setActiveTab("general"); // Volver al chat general si se cierra una pestaña
  };

  if (isLoading) return <p>Cargando...</p>;

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Barra de navegación */}
      <div className="bg-slate-800 p-4 flex justify-between items-center">
        <h1 className="text-white text-2xl">Chat General</h1>
        {isAuthenticated && (
          <button
            onClick={() => logout({ returnTo: url })}
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
          <div className="flex border-b">
            {/* Pestaña del Chat General */}
            <button
              className={`px-4 py-2 ${
                activeTab === "general" ? "bg-gray-200 font-bold" : "bg-white"
              } border-t border-l border-r rounded-t`}
              onClick={() => setActiveTab("general")}
            >
              Chat General
            </button>

            {/* Pestañas de Chats Privados */}
            {Object.keys(privateChats).map((recipient) => (
              <div key={recipient} className="flex items-center">
                <button
                  className={`px-4 py-2 ${
                    activeTab === recipient ? "bg-gray-200 font-bold" : "bg-white"
                  } border-t border-l border-r rounded-t`}
                  onClick={() => setActiveTab(recipient)}
                >
                  {recipient}
                </button>
                <button
                  className="ml-1 text-red-500"
                  onClick={() => closeChat(recipient)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Contenido de las pestañas */}
          <div className="flex-1 overflow-y-auto p-2">
            {/* Mensajes del Chat General */}
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

            {/* Mensajes de Chats Privados */}
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
                if (e.key === "Enter") {
                  if (activeTab === "general") {
                    sendMessage(e);
                  } else {
                    sendPrivateMessage(activeTab, message);
                    setMessage("");
                  }
                }
              }}
            />
            <button
              onClick={(e) => {
                if (activeTab === "general") {
                  sendMessage(e);
                } else {
                  sendPrivateMessage(activeTab, message);
                  setMessage("");
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

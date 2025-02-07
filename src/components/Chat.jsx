import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePrivateChats } from "../hooks/usePrivateChats";
import { useSocket } from "../hooks/useSocket";
import {
  handleSendMessage,
  handleClosePrivateChat,
  handleOpenPrivateChat,
} from "../utils/chatFunctions";

export const Chat = () => {
  const { user, isAuthenticated, isLoading, handleLogout } = useAuth();
  const {
    privateChats,
    openTabs,
    addMessageToPrivateChat,
    openPrivateChat,
    closePrivateChat,
  } = usePrivateChats();

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const messagesEndRef = useRef(null);

  const { sendMessage, sendFile } = useSocket(
    user,
    setMessages,
    setUsers,
    addMessageToPrivateChat,
    openTabs,
    setActiveTab
  );

  // Scroll al final del contenedor de mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, privateChats]);

  // Manejar la carga de archivos
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      sendFile(
        activeTab === "general" ? "general" : "private",
        activeTab,
        file
      );
    }
  };

  // Función para renderizar archivos
  const renderFile = (file, fileName) => {
    if (file.startsWith("data:image")) {
      // Es una imagen, mostrar vista previa
      return (
        <img
          src={file}
          alt={fileName}
          className="max-w-full h-auto rounded-lg"
        />
      );
    } else {
      // Es otro tipo de archivo, mostrar enlace de descarga
      return (
        <a href={file} download={fileName} className="text-blue-500 underline">
          Descargar {fileName}
        </a>
      );
    }
  };

  if (isLoading && !user) return <p>Cargando...</p>;

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

      <div className="flex flex-1 overflow-hidden">
        {/* Contenedor principal del chat */}
        <div className="flex-1 bg-gray-50 p-4 flex flex-col overflow-hidden">
          {/* Pestañas de Chats */}
          <div className="flex flex-wrap border-b space-x-2">
            <button
              className={`px-4 py-2 ${
                activeTab === "general" ? "bg-gray-200 font-bold" : "bg-white"
              } border-t border-l border-r rounded-t`}
              onClick={() => setActiveTab("general")}
            >
              Chat General
            </button>

            {openTabs.map((recipient) => (
              <div key={recipient} className="flex items-center mb-2 ">
                <button
                  className={`px-4 py-2 ${
                    activeTab === recipient
                      ? "bg-gray-200 font-bold"
                      : "bg-white"
                  } border-t border-l border-r rounded-t flex items-center`}
                  onClick={() => setActiveTab(recipient)}
                >
                  {recipient}
                  <span
                    className="ml-2 text-red-500 cursor-pointer hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClosePrivateChat(
                        recipient,
                        closePrivateChat,
                        activeTab,
                        setActiveTab
                      );
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
                  <div
                    key={index}
                    className="bg-gray-200 p-2 rounded-lg mb-2 max-w-[60%]"
                  >
                    <strong>{msg.name}: </strong>
                    {msg.file ? renderFile(msg.file, msg.fileName) : msg.text}
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
                      msg.sender === user.name
                        ? "bg-blue-200 text-right"
                        : "bg-gray-200"
                    }`}
                  >
                    <strong>{msg.sender}: </strong>
                    {msg.file ? (
                      <img
                        src={msg.file}
                        alt={msg.fileName}
                        className="max-w-full h-auto rounded-lg"
                      />
                    ) : (
                      msg.message
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Entrada de Mensaje */}
          <div className="p-4 bg-gray-100">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && message.trim()) {
                    // Solo enviar si el mensaje no está vacío
                    handleSendMessage(
                      activeTab,
                      message,
                      sendMessage,
                      addMessageToPrivateChat,
                      user,
                      setMessage
                    );
                  }
                }}
              />
              {/* Botón para cargar archivos */}
              <label className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                📎
              </label>
              <button
                onClick={() =>
                  handleSendMessage(
                    activeTab,
                    message,
                    sendMessage,
                    addMessageToPrivateChat,
                    user,
                    setMessage
                  )
                }
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Usuarios Conectados */}
        <div className="w-1/4 bg-gray-100 p-4 border-l border-gray-300 overflow-y-auto">
          <h2 className="text-lg font-bold mb-2">Usuarios Conectados</h2>
          <ul>
            {users
              .filter((userName) => userName !== user.name)
              .map((userName, index) => (
                <li
                  key={index}
                  className="p-2 bg-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-300"
                  onClick={() =>
                    handleOpenPrivateChat(
                      userName,
                      openPrivateChat,
                      setActiveTab
                    )
                  }
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

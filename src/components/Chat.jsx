import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState, useRef } from "react";
import socketIO from "socket.io-client";

const socketUrl = import.meta.env.VITE_API_URL;
const url = import.meta.env.VITE_BASE_URL;
const socket = socketIO.connect(socketUrl);

export const Chat = () => {
  const { user, logout } = useAuth0();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null); // campo para scroll automatico

  const handleLogout = () => {
    logout({
      returnTo: url,
    });
  };

  useEffect(() => {
    socket.on("messageResponse", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("messageResponse");
    };
  }, []);

  // hacer scroll automatico al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // funcion para enviar mensaje
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      socket.emit("message", { text: message, name: user.name });
      setMessage("");
    }
  };

  // Detectar tecla Enter en el input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage(e);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Barra de navegación  */}
      <div className="bg-slate-800 p-4 flex justify-between items-center">
        <h1 className="text-white text-2xl">Chat General</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto flex flex-col items-start">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="bg-gray-200 p-2 rounded-lg mb-2 max-w-[60%]"
          >
            <strong>{msg.name}: </strong>
            {msg.text}
          </div>
        ))}
        {/* Elemento oculto para hacer scroll automático */}
        <div ref={messagesEndRef} />
      </div>

      {/* Entrada de texto */}
      <div className="p-4 bg-gray-100 flex items-center gap-4">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
        >
          Enviar
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
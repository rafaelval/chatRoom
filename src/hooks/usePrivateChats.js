import { useState, useEffect } from "react";

export const usePrivateChats = () => {
  const [privateChats, setPrivateChats] = useState(() => {
    return JSON.parse(localStorage.getItem("privateChats")) || {};
  });
  const [openTabs, setOpenTabs] = useState([]);

  useEffect(() => {
    // Guardar en localStorage cada vez que privateChats cambie
    localStorage.setItem("privateChats", JSON.stringify(privateChats));
  }, [privateChats]);

  const addMessageToPrivateChat = (recipient, sender, message) => {
    setPrivateChats((prevChats) => {
      const updatedChats = {
        ...prevChats,
        [recipient]: [...(prevChats[recipient] || []), { sender, message }],
      };
      return updatedChats;
    });

    // Abrir automáticamente la pestaña si no está abierta
    if (!openTabs.includes(recipient)) {
      setOpenTabs((prevTabs) => [...prevTabs, recipient]);
    }
  };

  const openPrivateChat = (recipient) => {
    setPrivateChats((prevChats) => ({
      ...prevChats,
      [recipient]: prevChats[recipient] || [], // Asegurar que se cree el chat aunque esté vacío
    }));
    setOpenTabs((prevTabs) => [...new Set([...prevTabs, recipient])]);
  };

  const closePrivateChat = (recipient, activeTab) => {
    setOpenTabs((prevTabs) => prevTabs.filter((tab) => tab !== recipient));
    if (activeTab === recipient) {
      return "general"; // Si la pestaña activa es la que se cierra, volver a "general"
    }
  };

  return { privateChats, openTabs, addMessageToPrivateChat, openPrivateChat, closePrivateChat };
};

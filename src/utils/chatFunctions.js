export const handleSendMessage = (
      activeTab,
      message,
      sendMessage,
      addMessageToPrivateChat,
      user,
      setMessage
    ) => {
      if (activeTab === "general") {
        sendMessage("general", null, message); // Enviar mensaje al chat general
      } else {
        sendMessage("private", activeTab, message); // Enviar mensaje privado
        // Agregar el mensaje al estado del remitente
        addMessageToPrivateChat(activeTab, user.name, message);
      }
      setMessage(""); // Limpiar el campo de entrada
    };
    
    export const handleClosePrivateChat = (recipient, closePrivateChat, activeTab, setActiveTab) => {
      const newActiveTab = closePrivateChat(recipient, activeTab);
      if (newActiveTab) {
        setActiveTab(newActiveTab); // Cambiar a "general" si se cierra la pestaña activa
      }
    };
    
    export const handleOpenPrivateChat = (recipient, openPrivateChat, setActiveTab) => {
      openPrivateChat(recipient); // Abrir la pestaña de chat privado
      setActiveTab(recipient); // Activar la pestaña de chat privado
    };
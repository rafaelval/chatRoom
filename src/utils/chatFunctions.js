export const handleSendMessage = (
  activeTab,
  message,
  sendMessage,
  addMessageToPrivateChat,
  user,
  setMessage
) => {
  if (message.trim()) {
    // Solo enviar si el mensaje no está vacío
    if (activeTab === "general") {
      sendMessage("general", null, message);
    } else {
      sendMessage("private", activeTab, message);
      addMessageToPrivateChat(activeTab, user.name, message);
    }
    setMessage(""); // Limpiar el input después de enviar
  }
};

export const handleClosePrivateChat = (
  recipient,
  closePrivateChat,
  activeTab,
  setActiveTab
) => {
  const newActiveTab = closePrivateChat(recipient, activeTab);
  if (newActiveTab) {
    setActiveTab(newActiveTab); // Cambiar a "general" si se cierra la pestaña activa
  }
};

export const handleOpenPrivateChat = (
  recipient,
  openPrivateChat,
  setActiveTab
) => {
  openPrivateChat(recipient); // Abrir la pestaña de chat privado
  setActiveTab(recipient); // Activar la pestaña de chat privado
};

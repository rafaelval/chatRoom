import { Route, Routes } from "react-router-dom";
import "./App.css";
import { Chat } from "./components/Chat";
import Login from "./components/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}

export default App;

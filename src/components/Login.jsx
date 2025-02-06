import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Login = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-100 m-0 p-0">
      <button
        onClick={loginWithRedirect}
        className="bg-blue-500 text-white py-4 px-8 text-lg rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Iniciar Sesión
      </button>
    </div>
  );
};

export default Login;

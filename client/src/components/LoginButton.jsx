import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      onClick={() => loginWithRedirect()}
      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
                 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 
                 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
    >
      Login
    </button>
  );
};

export default LoginButton;
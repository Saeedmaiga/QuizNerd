import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = ({ theme }) => {
  const { logout } = useAuth0();

  return (
    <button 
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      className={`
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white' 
          : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white'
        } 
        px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border border-white/20 backdrop-blur-sm text-sm
      `}
      title="Log out"
    >
      <span className="flex items-center gap-1">
        <span className="text-sm">🚪</span>
        <span>Logout</span>
      </span>
    </button>
  );
};

export default LogoutButton;
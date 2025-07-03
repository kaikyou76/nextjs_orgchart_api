// src/app/components/Footer.tsx
import React from "react";

interface FooterProps {
  onLogout: () => void;
}

const Footer: React.FC<FooterProps> = ({ onLogout }) => {
  return (
    <div className="mt-6">
      <button
        className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
        onClick={onLogout}
      >
        ログアウト
      </button>
    </div>
  );
};

export default Footer;

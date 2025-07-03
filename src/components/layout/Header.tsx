import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold leading-tight text-gray-900">
          My App
        </h1>
      </div>
    </header>
  );
};

export default Header;

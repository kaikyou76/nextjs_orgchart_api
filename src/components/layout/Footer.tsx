import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 p-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} My App. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

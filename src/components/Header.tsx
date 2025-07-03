// src/app/components/Header.tsx
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800">
        バッチジョブ管理コンソール
      </h1>
      <p className="text-gray-600 mt-2">システムバッチ処理の実行管理画面</p>
    </header>
  );
};

export default Header;

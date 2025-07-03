// src/app/user/page.tsx
"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function UserPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  // 認証チェック
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // デバッグログ
  useEffect(() => {
    console.log("Current user object:", user);
  }, [user]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Header />
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          一般ユーザー管理画面
        </h1>
        <p className="text-gray-600 mt-2">ユーザー認証済み：{user?.email}</p>
      </header>

      <Card title="アカウント情報">
        <div className="space-y-4">
          <p>
            <strong>メールアドレス：</strong>
            {user?.email || "未登録"}
          </p>
          <p>
            <strong>名前：</strong>
            {user?.name || "未設定"}
          </p>
          <p>
            <strong>ロール：</strong>
            {user?.role || "なし"}
          </p>
        </div>

        {/* 管理者権限がある場合のみ表示 */}
        {user?.role === "admin" && (
          <div className="mt-6">
            <Button onClick={() => router.push("/batch")} fullWidth>
              バッチ処理画面へ
            </Button>
          </div>
        )}

        {!user && (
          <p className="mt-4 text-yellow-600">
            現在、有効なユーザー情報がありません。
          </p>
        )}
      </Card>
      <Footer onLogout={logout} />
    </div>
  );
}

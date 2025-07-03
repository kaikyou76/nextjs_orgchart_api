// src/components/AuthProvider.tsx
"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation"; // ✅ Next.js 13+ App Router用ルーターインポート

// 🔹 ユーザー情報の型定義
interface AuthUser {
  email: string;
  role: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthUser & { token: string }) => void;
  logout: () => void;
};

// 🔹 JWT解析用ヘルパー
const parseJwt = (token: string): AuthUser & { exp: number } => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    return {
      email: payload.sub ?? payload.email ?? "", // sub（subject）を優先し、emailもフォールバック
      role: payload.role ?? "",
      name: payload.name ?? "",
      exp: payload.exp ?? 0,
    };
  } catch (e) {
    console.error("JWTのパースに失敗しました", e);
    return { email: "", role: "", name: "", exp: 0 };
  }
};

// 🔹 初期値
const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

// 🔹 AuthContext の作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter(); // ✅ Next.js 13+ App Router用ルーター取得
  const [state, setState] = useState<AuthState>(initialAuthState);

  // 🔐 ログイン処理
  const login = (data: AuthUser & { token: string }) => {
    localStorage.setItem("auth_token", data.token);
    const decoded = parseJwt(data.token);

    const user = {
      email: decoded.email || data.email || "",
      role: decoded.role || data.role || "",
      name: decoded.name || data.name || "",
    };

    setState({
      user,
      token: data.token,
      isAuthenticated: true,
      isLoading: false,
    });

    router.push("/user");
  };

  // 🔐 ログアウト処理
  const logout = () => {
    localStorage.removeItem("auth_token");
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  // 📦 初期ロード時にトークンを復元
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");

    if (storedToken) {
      const decoded = parseJwt(storedToken);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp < currentTime) {
        localStorage.removeItem("auth_token");
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } else {
        setState({
          user: {
            email: decoded.email || "",
            role: decoded.role || "",
            name: decoded.name || "",
          },
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } else {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }

    // ✅ RSCリクエストの監視を追加（URLSearchParamsを使用）
    const handleRSCRequest = () => {
      const search = window.location.search;
      const params = new URLSearchParams(search);
      if (params.has("_rsc")) {
        console.log("RSC request detected:", params.get("_rsc"));
      }
    };

    handleRSCRequest();
    window.addEventListener("hashchange", handleRSCRequest);

    return () => {
      window.removeEventListener("hashchange", handleRSCRequest);
    };
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

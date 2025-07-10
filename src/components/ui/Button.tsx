// src/components/ui/Button.tsx
"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "info";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
  variant?: ButtonVariant;
  iconLeft?: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-green-600 text-white hover:bg-green-700",
  info: "bg-indigo-600 text-white hover:bg-indigo-700",
};

export default function Button({
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  isLoading = false,
  variant = "primary",
  iconLeft,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center
        ${variantStyles[variant]}
        ${fullWidth ? "w-full" : "w-auto"}
        ${disabled || isLoading ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
            ></circle>
          </svg>
          実行中...
        </>
      ) : (
        <>
          {iconLeft && <span className="mr-2">{iconLeft}</span>}
          {children}
        </>
      )}
    </button>
  );
}

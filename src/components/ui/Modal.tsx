import React from "react";
import { Dialog } from "@headlessui/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  type?: "success" | "error" | "info";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  type = "info",
}) => {
  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-200 text-green-700"
      : type === "error"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-blue-50 border-blue-200 text-blue-700";

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6 shadow-xl">
          <Dialog.Title
            className={`font-bold mb-2 ${
              type === "success"
                ? "text-green-700"
                : type === "error"
                ? "text-red-700"
                : "text-blue-700"
            }`}
          >
            {title ||
              (type === "success"
                ? "成功"
                : type === "error"
                ? "エラー"
                : "情報")}
          </Dialog.Title>
          <div className="mt-2 text-sm text-gray-600">{children}</div>
          <div className="mt-4">
            <button
              onClick={onClose}
              className={`inline-flex justify-center px-4 py-2 text-sm font-medium ${
                type === "success"
                  ? "bg-green-100 text-green-900 hover:bg-green-200"
                  : type === "error"
                  ? "bg-red-100 text-red-900 hover:bg-red-200"
                  : "bg-blue-100 text-blue-900 hover:bg-blue-200"
              } rounded-md`}
            >
              閉じる
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default Modal;

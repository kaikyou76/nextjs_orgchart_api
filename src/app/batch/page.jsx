"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function BatchJobPage() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const [status, setStatus] = useState("idle"); // 'idle', 'running', 'success', 'error'
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [jobId, setJobId] = useState(null); // jobId 管理
  const [logs, setLogs] = useState([]);
  const [timeline, setTimeline] = useState([]);

  // 管理者権限チェック
  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      router.push("/login");
    }
  }, [token, user, router]);

  // バッチジョブ実行
  const runBatchJob = async () => {
    if (!token || !user || user.role !== "admin") {
      setMessage("管理者権限が必要です");
      setModalOpen(true);
      return;
    }

    setStatus("running");
    setMessage("バッチジョブを実行中...");
    setModalOpen(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/batch/run-human-resource-job`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let apiResponse;
      try {
        apiResponse = await response.json(); // ApiResponse<JobStatusDTO> 形式想定
      } catch (e) {
        throw new Error("サーバーからの応答形式が不正です");
      }

      // jobId 取得失敗時
      if (
        !apiResponse ||
        apiResponse.result !== "SUCCESS" ||
        !apiResponse.data?.jobId
      ) {
        setStatus("error");
        setMessage(apiResponse.message || "ジョブの実行に失敗しました");
        setModalOpen(true);
        return;
      }

      const currentJobId = apiResponse.data.jobId;

      setJobId(currentJobId);
      setStatus("running");
      setMessage("ジョブ実行中...");

      pollJobStatus(currentJobId);
      fetchJobLogs(currentJobId);
    } catch (error) {
      setStatus("error");
      const errorMessage =
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました";
      setMessage(`ネットワークエラー: ${errorMessage}`);
      console.error("Error occurred:", error);
    } finally {
      setModalOpen(true);
    }
  };

  // ジョブステータスポーリング関数
  const pollJobStatus = async (jobId, attempt = 0, maxAttempts = 30) => {
    if (!jobId) {
      setStatus("error");
      setMessage("ジョブIDが無効です");
      setModalOpen(true);
      return;
    }

    if (attempt >= maxAttempts) {
      setStatus("error");
      setMessage("タイムアウト：ジョブの状態が取得できませんでした");
      setModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/batch/status/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const statusData = await res.json();

      if (!statusData || statusData.result === "ERROR") {
        setStatus("error");
        setMessage(
          statusData.message || "ステータス取得中にエラーが発生しました"
        );
        setModalOpen(true);
        return;
      }

      const jobStatus = statusData.data.status;

      switch (jobStatus) {
        case "STARTED":
          setTimeout(() => pollJobStatus(jobId, attempt + 1), 2000);
          break;
        case "COMPLETED":
          setStatus("success");
          setMessage(statusData.data.message || "ジョブが正常に完了しました");
          setModalOpen(true);
          updateTimeline("completed");
          break;
        case "FAILED":
          setStatus("error");
          setMessage(statusData.data.message || "ジョブが異常終了しました");
          setModalOpen(true);
          updateTimeline("failed", statusData.data.message);
          break;
        default:
          setStatus("error");
          setMessage("不明なステータス：" + jobStatus);
          setModalOpen(true);
      }
    } catch (err) {
      setStatus("error");
      setMessage("ステータス取得中にエラーが発生しました");
      setModalOpen(true);
      console.error("ジョブステータス取得失敗", err);
    }
  };

  // ジョブログ取得
  const fetchJobLogs = async (jobId) => {
    if (!jobId) {
      console.warn("ログ取得失敗：jobId が null");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/batch/logs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const logs = await res.json();
        setLogs(logs);
      } else {
        console.warn("ログ取得に失敗");
      }
    } catch (err) {
      console.error("ログ取得エラー", err);
    }
  };

  // タイムライン更新
  const updateTimeline = (status, message = "") => {
    const step = {
      timestamp: new Date().toISOString(),
      status,
      message,
    };
    setTimeline((prev) => [...prev, step]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Header />
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          バッチジョブ管理コンソール
        </h1>
        <p className="text-gray-600 mt-2">システムバッチ処理の実行管理画面</p>
      </header>

      <Card title="人事データ同期ジョブ">
        <div className="space-y-4">
          <p>HRシステムから最新の人事データを取得し、組織図を更新します。</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>最終実行: 2023-10-15 14:30</li>
            <li>ステータス: 正常終了</li>
            <li>推定時間: 約3分</li>
          </ul>
        </div>

        <div className="mt-6">
          <Button
            onClick={runBatchJob}
            disabled={status === "running" || !token}
            isLoading={status === "running"}
            fullWidth
          >
            ジョブを実行
          </Button>
        </div>
      </Card>

      {/* リトライボタン */}
      {(status === "error" || status === "success") && (
        <Card title="操作" className="mt-6">
          <Button onClick={runBatchJob} variant="secondary" fullWidth>
            再実行
          </Button>
        </Card>
      )}

      {/* タイムライン表示 */}
      <Card title="進捗履歴" className="mt-6">
        <ul className="space-y-2">
          {timeline.map((item, index) => (
            <li key={index} className="text-sm">
              <span className="font-semibold">{item.status}</span>:{" "}
              {new Date(item.timestamp).toLocaleString()} - {item.message}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="セキュリティ情報" className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              token ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {token ? "認証済み" : "未認証"}
          </span>
          <span className="text-gray-500 text-xs">JWT Bearerトークン方式</span>
        </div>
        <p className="text-sm text-gray-600">
          このアプリケーションはステートレス認証を使用しています。
        </p>
      </Card>

      <Footer onLogout={logout} />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          status === "success"
            ? "実行成功"
            : status === "error"
            ? "エラー発生"
            : "情報"
        }
        type={status}
      >
        {message}
      </Modal>
    </div>
  );
}

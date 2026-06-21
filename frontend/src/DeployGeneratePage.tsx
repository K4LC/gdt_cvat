import { useEffect, useRef, useState } from "react";
import axios from "axios";

type Phase = "idle" | "queued" | "processing" | "done" | "error";

function DeployGeneratePage() {
  const [modelName, setModelName] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [ptFile, setPtFile] = useState<File | null>(null);

  const [generateId, setGenerateId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [filename, setFilename] = useState<string>("");
  const pollRef = useRef<number | null>(null);

  const validateFile = (file: File | null, ext: string) => {
    if (!file) {
      alert("ファイルを選択してください");
      return false;
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(`.${ext}`)) {
      alert(`${ext}ファイルを選択してください`);
      return false;
    }

    return true;
  };

  // generateId が決まったらステータスを2秒ごとにポーリングする
  useEffect(() => {
    if (!generateId) return;

    const poll = async () => {
      try {
        const res = await axios.get(`/api/status/${generateId}`);
        const status = res.data.status as Phase | "unknown";

        if (status === "done") {
          setPhase("done");
          setFilename(res.data.filename || "");
          stopPolling();
        } else if (status === "error") {
          setPhase("error");
          setErrorMsg(res.data.error || "生成中にエラーが発生しました");
          stopPolling();
        } else if (status === "processing") {
          setPhase("processing");
        } else if (status === "queued") {
          setPhase("queued");
        }
      } catch (err) {
        console.log("ステータス取得失敗", err);
      }
    };

    poll();
    pollRef.current = window.setInterval(poll, 2000);
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateId]);

  const stopPolling = () => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const handleGenerate = async () => {
    if (modelName == "" || author == "" || !svgFile || !ptFile) {
      alert("すべて埋めてください");
      return;
    }
    if (!validateFile(svgFile, "svg")) return;
    if (!validateFile(ptFile, "pt")) return;

    const formData = new FormData();
    formData.append("modelName", modelName);
    formData.append("author", author);
    formData.append("svg", svgFile);
    formData.append("pt", ptFile);

    setPhase("queued");
    setErrorMsg("");
    setFilename("");
    setGenerateId(null);

    try {
      const res = await axios.post("/api/generate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("backendに送信成功", res.data);
      setGenerateId(res.data.generate_id);
    } catch (err) {
      console.log("backendに送信失敗", err);
      setPhase("error");
      setErrorMsg("backendへの送信に失敗しました");
    }
  };

  const statusLabel: Record<Phase, string> = {
    idle: "",
    queued: "順番待ち中…",
    processing: "生成中…（モデル変換・テンプレート生成）",
    done: "生成完了",
    error: "エラー",
  };

  const busy = phase === "queued" || phase === "processing";

  return (
    <div>
      <div>
        <label>モデル名</label>
        <input
          type="text"
          placeholder="model"
          onChange={(e) => setModelName(e.target.value)}
        />
      </div>
      <div>
        <label>作成者名</label>
        <input
          type="text"
          placeholder="Ishikubo"
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>

      <div>
        <label>svgファイル</label>
        <input
          type="file"
          accept=".svg"
          onChange={(e) => setSvgFile(e.target.files?.[0] || null)}
        />
      </div>
      <div>
        <label>モデルファイル</label>
        <input
          type="file"
          accept=".pt"
          onChange={(e) => setPtFile(e.target.files?.[0] || null)}
        />
      </div>

      <button onClick={handleGenerate} disabled={busy}>
        {busy ? "生成中…" : "Generate"}
      </button>

      {phase !== "idle" && (
        <div style={{ marginTop: "1rem" }}>
          <p>ステータス: {statusLabel[phase]}</p>

          {phase === "error" && <p style={{ color: "red" }}>{errorMsg}</p>}

          {phase === "done" && generateId && (
            <a href={`/api/download/${generateId}`} download>
              <button>{filename || "result.zip"} をダウンロード</button>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default DeployGeneratePage;

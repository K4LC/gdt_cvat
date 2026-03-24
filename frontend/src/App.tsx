import React, { useState } from "react";

const App: React.FC = () => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/svg+xml") {
      alert("SVGファイルを選択してください");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setSvgContent(text);
    };

    reader.readAsText(file);
  };

  return (
    <div style={{ padding: "20px"}}>
      <h1>SVGアップローダー</h1>

      <input
        type="file"
        accept=".svg"
        onChange={handleFileChange}
      />

      {fileName && <p>ファイル名: {fileName}</p>}

      <div
        style={{
          marginTop: "20px",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        {svgContent ? (
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <p>SVGをアップロードするとここに表示されます</p>
        )}
      </div>
    </div>
  );
};

export default App

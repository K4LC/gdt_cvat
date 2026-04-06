import { useState} from "react";
import axios from "axios";

function DeployGeneratePage() {
  const [modelName, setModelName] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [ptFile, setPtFile] = useState<File | null>(null);

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

    try {
      const res = await axios.post(
        "/api/generate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("backendに送信成功", res.data);
    } catch (err) {
      console.log("backendに送信失敗", err)
    }
  };

  return (
    <div>
      <div>
      <label>モデル名</label>
      <input type="text" placeholder="model" onChange={(e) => setModelName(e.target.value)}/>
      </div>
      <div>
      <label>作成者名</label>
      <input type="text" placeholder="Ishikubo" onChange={(e) => setAuthor(e.target.value)} />
      </div>
      
      <div>
      <label>svgファイル</label>
      <input type="file" accept=".svg" onChange={(e) => setSvgFile(e.target.files?.[0] || null)}/>
      </div>
      <div>
      <label>モデルファイル</label>
      <input type="file" accept=".pt" onChange={(e) => setPtFile(e.target.files?.[0] || null)}/>
      </div>

      <button onClick={handleGenerate}>Generate</button>
    </div>
  );
}

export default DeployGeneratePage;

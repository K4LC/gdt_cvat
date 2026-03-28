import { useState } from "react";
import TextInput from "./TextInput.tsx"
import FolderInput from './FileInput.tsx';

function DeployGeneratePage() {
  const [modelName, setModelName] = useState("");
  const [author, setAuthor] = useState("");
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [onnxFile, setOnnxFile] = useState<File | null>(null);

  const handleSend = async () => {
    if (modelName == "" || author == "" || !svgFile || !onnxFile) {
      alert("すべて入力してください");
      return;
    }

    const formData = new FormData();
    
    formData.append("modelName", modelName);
    formData.append("author", author);
    formData.append("svgFile", svgFile);
    formData.append("onnxFile", onnxFile);

    const apiPort = import.meta.env.VITE_API_PORT;
    await fetch(`http://localhost:${apiPort}/generate`, {
      method: "POST",
      body: formData,
    });
  };

  return (
    <>
    <div className='main'>
      <TextInput label='モデル名' placeholder='model' value={modelName} onChange={setModelName} />
      <TextInput label='作成者名' placeholder='Ishikubo' value={author} onChange={setAuthor} />
      <FolderInput label='svgファイル' accept={["svg"]} onChange={setSvgFile}/>
      <FolderInput label='モデル' accept={["onnx"]} onChange={setOnnxFile}/>
      <button onClick={handleSend}>Generate</button>
    </div>
    </>
  )
}

export default DeployGeneratePage;

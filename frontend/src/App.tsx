import './App.css'
import TextInput from "./TextInput.tsx"
import FolderInput from './FolderInput.tsx';

function App() {

  return (
    <>
      <div className='header'></div>
      <div className='body'>
        <div className='sidebar'>
          <p>デプロイ</p>
          <p>学習</p>
        </div>
        <div className='main'>
          <TextInput label='モデル名' placeholder='model.onnx'/>
          <TextInput label='作成者名' placeholder='Ishikubo'/>
          <FolderInput label='svgファイル' extensions={["svg"]} />
          <FolderInput label='モデル' extensions={["onnx"]} />
          <button onClick={() => console.log("button")}>Generate</button>
        </div>
      </div>
      
    </>
  )
}

export default App;

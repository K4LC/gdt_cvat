import TextInput from "./TextInput.tsx"
import FolderInput from './FolderInput.tsx';

function DeployGeneratePage() {

  return (
    <>
    <div className='main'>
      <TextInput label='モデル名' placeholder='model.onnx'/>
      <TextInput label='作成者名' placeholder='Ishikubo'/>
      <FolderInput label='svgファイル' extensions={["svg"]} />
      <FolderInput label='モデル' extensions={["onnx"]} />
      <button onClick={() => console.log("button")}>Generate</button>
    </div>
    </>
  )
}

export default DeployGeneratePage;

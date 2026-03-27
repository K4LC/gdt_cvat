import './App.css'
import TextInput from "./TextInput.tsx"

function App() {

  return (
    <>
      <h1>GDT CVAT</h1>
      <TextInput label='モデル名' placeholder='model.onnx'/>
      <TextInput label='作成者名' placeholder='Ishikubo'/>
    </>
  )
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import './App.css'
import DeployGeneratePage from "./DeployGeneratePage.tsx";
import TrainPage from "./TrainPage.tsx";

function App() {

  return (
    <BrowserRouter>
      <div className='header'>GDT CVAT</div>
      <div className='body'>
        <div className='sidebar'>
          <p>デプロイジェネレート</p>
          <p>YOLO学習</p>
        </div>
        <div className="main">
          <Routes>
            <Route path="/" element={<Navigate to="/deploy" />} />
            <Route path="/deploy" element={<DeployGeneratePage />} />
            <Route path="/train" element={<TrainPage />} />
          </Routes>
        </div>
      </div>
      
    </BrowserRouter>
  )
}

export default App;

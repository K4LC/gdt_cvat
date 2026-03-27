import './App.css'
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom"
import DeployGeneratePage from "./DeployGeneratePage.tsx";
import TrainPage from "./TrainPage.tsx";

function App() {

  return (
    <BrowserRouter>
      <div className='header'>GDT CVAT</div>
      <div className='body'>
        <div className='sidebar'>
          <p>
            <Link to="/deploy">デプロイフォルダ作成</Link>
          </p>
          <p>
            <Link to="/train">YOLO学習</Link>
          </p>
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

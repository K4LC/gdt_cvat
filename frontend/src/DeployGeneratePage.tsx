function DeployGeneratePage() {
  
  return (
    <div>
      <div>
      <label>モデル名</label>
      <input type="text" placeholder="model" />
      </div>
      <div>
      <label>作成者名</label>
      <input type="text" placeholder="Ishikubo" />
      </div>
      
      <div>
      <label>svgファイル</label>
      <input type="file" />
      </div>
      <div>
      <label>モデルファイル</label>
      <input type="file" />
      </div>
    </div>
  );
}

export default DeployGeneratePage;

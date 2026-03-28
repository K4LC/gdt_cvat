from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 👇 これをルーティングより前に書く
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.0.11:8060"],  # ← これ重要
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate")
async def generate(
    modelName: str = Form(...),
    author: str = Form(...),
    svgFiles: UploadFile = File(None),
    onnxFiles: UploadFile = File(None),
):
    return {"status": "ok"}
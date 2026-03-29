from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate")
async def generate(
    modelName: str = Form(...),
    author: str = Form(...),
    svg: UploadFile = Form(...),
    onnx: UploadFile = Form(...)
):
    print("modelName:", modelName)
    print("author:", author)

    print("svg FileName:", svg.filename)
    print("onnx FileName:", onnx.filename)

    return {"message": "ok"}
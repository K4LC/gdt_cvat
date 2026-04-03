from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os
import redis
import json
from dotenv import load_dotenv

load_dotenv(".env")

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
    pt: UploadFile = Form(...)
):
    print("modelName:", modelName)
    print("author:", author)

    print("svg FileName:", svg.filename)
    print("pt FileName:", pt.filename)

    task_id = str(uuid.uuid4())
    print("create task_id")
    BASE_DIR = "/shared_gen"

    task_dir = os.path.join(BASE_DIR, task_id)
    os.makedirs(task_dir, exist_ok=True)

    svg_path = os.path.join(task_dir, svg.filename)
    pt_path = os.path.join(task_dir, pt.filename)

    with open(svg_path, "wb") as f:
        f.write(await svg.read())
    print("SVG writing complete")
    
    with open(pt_path, "wb") as f:
        f.write(await pt.read())
    print("Pt writing complete")

    r = redis.Redis(host="queue_db", port=6379, db=0)

    task_data = {
        "task_id": task_id,
        "modelName": modelName,
        "author": author,
        "svg_path": svg_path,
        "pt_path": pt_path
    }

    r.rpush("task_queue", json.dumps(task_data))
    print("Pushed to queue")

    return {"message": "ok"}
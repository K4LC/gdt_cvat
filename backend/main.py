from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
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

r = redis.Redis(host="queue_db", port=6379, db=0)


def get_task(task_id: str):
    """Redisからタスクの進捗状況を取り出してdictで返す"""
    raw = r.hgetall(f"task:{task_id}")
    return {k.decode(): v.decode() for k, v in raw.items()}

@app.post("/api/generate")
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

    task_dir = os.path.join(BASE_DIR, f"generate_{task_id}")
    os.makedirs(task_dir, exist_ok=True)

    svg_path = os.path.join(task_dir, svg.filename)
    pt_path = os.path.join(task_dir, pt.filename)

    with open(svg_path, "wb") as f:
        f.write(await svg.read())
    print("SVG writing complete")
    
    with open(pt_path, "wb") as f:
        f.write(await pt.read())
    print("Pt writing complete")

    generate_data = {
        "task_id": task_id,
        "modelName": modelName.lower(),
        "author": author.lower(),
        "svg_path": svg_path,
        "pt_path": pt_path
    }

    # 初期ステータスを登録してからキューに投入する
    r.hset(f"task:{task_id}", mapping={"status": "queued"})
    r.rpush("generate_queue", json.dumps(generate_data))
    print("Pushed to queue")

    return {"generate_id": task_id}


@app.get("/api/status/{task_id}")
def status(task_id: str):
    task = get_task(task_id)
    if not task:
        return JSONResponse({"status": "unknown"}, status_code=404)
    return task


@app.get("/api/download/{task_id}")
def download(task_id: str):
    task = get_task(task_id)
    if not task:
        return JSONResponse({"detail": "task not found"}, status_code=404)
    if task.get("status") != "done":
        return JSONResponse(
            {"detail": "not ready", "status": task.get("status")}, status_code=409
        )

    zip_path = task.get("zip_path")
    if not zip_path or not os.path.exists(zip_path):
        return JSONResponse({"detail": "result file missing"}, status_code=410)

    filename = task.get("filename", "result.zip")
    return FileResponse(zip_path, media_type="application/zip", filename=filename)
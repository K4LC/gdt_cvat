import redis
import os
import shutil
import json
import datetime
import time
from zoneinfo import ZoneInfo
from jinja2 import Template
from ultralytics import YOLO

print("container start")

r = redis.Redis(host="queue_db", port=6379, db=0)

def generate_from_template(template_path, output_path, params):
    with open(template_path, encoding="utf-8") as f:
        template = Template(f.read())
    
    output = template.render(**params)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(output)

def process_task(task_data):
    print("start:", task_data["task_id"])

    time.sleep(2)

    print("end:", task_data["task_id"])

while True:
    print("waiting...")
    _, data = r.blpop("generate_queue")

    generate_data = json.loads(data)
    print(generate_data)

    task_id = generate_data["task_id"]
    modelName = generate_data["modelName"]
    author = generate_data["author"]
    svg_path = generate_data["svg_path"]
    svg_filename = os.path.basename(svg_path)
    pt_path = generate_data["pt_path"]
    pt_filename = os.path.basename(pt_path)

    # タイムスタンプ作成
    timestamp = datetime.datetime.now(datetime.timezone.utc)
    timestamp = timestamp.astimezone(ZoneInfo("Asia/Tokyo"))
    timestamp = timestamp.strftime("%Y%m%d%H%M")

    # 元フォルダのパス
    BASE_DIR = "/shared_gen"
    BASE_PATH = os.path.join(BASE_DIR, f"generate_{task_id}")
    
    # 保存先フォルダ作成
    nuclio_path = f"nuclio_{timestamp}_{task_id}"
    nuclio_dir = os.path.join(BASE_DIR, nuclio_path)
    os.makedirs(nuclio_dir, exist_ok=True)

    # .ptから.onnxにエクスポート
    model = YOLO(pt_path)
    model.export(format="onnx", opset=16)
    src_onnx = pt_path.replace(".pt", ".onnx")
    dst_onnx = f"{nuclio_dir}/{pt_filename.replace('.pt', '.onnx')}"
    shutil.copy(src_onnx, dst_onnx)

    # svgデータ処理

    # Jinja2でテンプレートからファイル作成

    # backendからの共有用フォルダ削除
    shutil.rmtree(BASE_PATH)

    # backendに終了通知
import redis
import os
import json
import datetime
import time
from jinja2 import Template
from ultralytics import YOLO

print("container start")

r = redis.Redis(host="queue_db", port=6379, db=0)

def convert_onnx(pt_path, onnx_path):
    model = YOLO(pt_path)
    model.export(format="onnx")

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

    process_task(generate_data)
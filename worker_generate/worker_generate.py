import redis
import os
import shutil
import json
import datetime
import re
import xml.etree.ElementTree as ET
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

def parse_line(line_root):
    x1 = line_root.attrib["x1"]
    y1 = line_root.attrib["y1"]
    x2 = line_root.attrib["x2"]
    y2 = line_root.attrib["y2"]
    data_type = line_root.attrib["data-type"]
    data_node_from = line_root.attrib["data-node-from"]
    data_node_to = line_root.attrib["data-node-to"]

    return f'<line x1=\\"{x1}\\" y1=\\"{y1}\\" x2=\\"{x2}\\" y2=\\"{y2}\\" data-type=\\"{data_type}\\" data-node-from=\\"{data_node_from}\\" data-node-to=\\"{data_node_to}\\"></line>'

def parse_circle(circle_root, data_label_name):
    r = circle_root.attrib["r"]
    cx = circle_root.attrib["cx"]
    cy = circle_root.attrib["cy"]
    data_type = circle_root.attrib["data-type"]
    data_element_id = circle_root.attrib["data-element-id"]
    data_node_id = circle_root.attrib["data-node-id"]
    
    return f'<circle r=\\"{r}\\" cx=\\"{cx}\\" cy=\\"{cy}\\" data-type=\\"{data_type}\\" data-element-id=\\"{data_element_id}\\" data-node-id=\\"{data_node_id}\\" data-label-name=\\"{data_label_name}\\"></circle>'


def parse_svg(svg_path):
    with open(svg_path, "r") as f:
        svg_text = f.read()

    root = ET.fromstring(svg_text)

    lines = root.findall(".//line")
    circles = root.findall(".//circle")
    desc = root.find("desc")
    labelNameData = json.loads(desc.text)
    labels = [v["name"] for v in labelNameData.values()]
    colors = [c.attrib["fill"] for c in circles]

    output_svg = ""
    for line in lines:
        output_svg += (parse_line(line) + "\\n")

    for circle, label in zip(circles, labels):
        output_svg += (parse_circle(circle, label) + "\\n")

    output_svg = output_svg[:-2]

    output_sublabel = ""
    for i, (label, color) in enumerate(zip(labels, colors)):
        output_sublabel += '{ "id": _id, "name": "_name", "color": "_color", "type": "points" },'.replace("_id", str(i)).replace("_name", label).replace("_color", color)

    output_sublabel = output_sublabel[:-1]

    return output_svg, output_sublabel

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
    svgInfo, svgLabelNames = parse_svg(svg_path)
    print(svgInfo, svgLabelNames)

    # Jinja2でテンプレートからファイル作成
    function_dict = {
        "modelName": modelName,
        "author": author,
        "timestamp": timestamp,
        "svgInfo": svgInfo,
        "svgLabelNames": svgLabelNames,
        }
    main_dict = {
        "modelName": modelName,
        "author": author,
        "timestamp": timestamp,
        }
    model_handler_dict = {
        "model_onnx": f"{pt_filename.replace('.pt', '.onnx')}",
        }

    generate_from_template(os.path.join("templates", "function-gpu.yaml.tpl"), os.path.join(nuclio_dir, "function-gpu.yaml"), function_dict)
    generate_from_template(os.path.join("templates", "function.yaml.tpl"), os.path.join(nuclio_dir, "function.yaml"), function_dict)
    generate_from_template(os.path.join("templates", "main.py.tpl"), os.path.join(nuclio_dir, "main.py"), main_dict)
    generate_from_template(os.path.join("templates", "model_handler.py.tpl"), os.path.join(nuclio_dir, "model_handler.py"), model_handler_dict)

    # backendからの共有用フォルダ削除
    shutil.rmtree(BASE_PATH)

    # backendに終了通知
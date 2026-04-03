import base64
import io
import json
import yaml
from PIL import Image
from model_handler import ModelHandler

def init_context(context):
    context.logger.info("Init context... 0%")

    with open("/opt/nuclio/function.yaml", "rb") as function_file:
        functionconfig = yaml.safe_load(function_file)
    
    labels_spec = functionconfig["metadata"]["annotation"]["spec"]
    labels = json.loads(labels_spec)

    model = ModelHandler(labels)
    context.user_data.model = model

    context.logger.info("Init context... 100%")

def handler(context, event):
    context.logger.info("Run {{modelName}}-{{author}}-{{timestamp}}")
    data = event.body
    buf = io.BytesIO(base64.b64decode(data["image"]))
    threshold = float(data.get("threshold", 0.5))
    image = Image.open(buf).convert("RGB")

    results = context.user_data.model.infer(image, threshold)

    return context.Response(
        body=json.dumps(results),
        headers={}, 
        content_type="application/json",
        status_code=200
    )
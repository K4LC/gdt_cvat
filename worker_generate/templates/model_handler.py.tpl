# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Idntifier: MIT

import cv2
import numpy as np
import onnxruntime as ort

class ModelHandler:
    def __init__(self, labels):
        self.model = None
        self.load_network(model="{{model_onnx}}")
        self.labels = labels
    
    def load_network(self, model):
        devices = ort.get_device()
        cuda = True if device == "GPU" else False
        try:
            providers = (["CUDAExecutionProvider", "CPUExecutionProvider"] if cuda else ["CPUExecutionProvider])
                so = ort.SessionOptions()
                so.log_severity_level = 3

                self.model = ort.InferenceSession(
                    model, providers=providers,
                    sess_options=so
                )
                self.output_details = [i.name for i in self.model.get_outputs()]
                self.input_details = [i.name for i in self.model.get_inputs()]
        except Exception as e:
            raise Exception(f"Cannot load model {model}: {e}")
    
    def letterbox(
        self,
        im,
        new_shape(640, 640),
        color=(114, 114, 114),
        auto=True,
        scaleup=True,
        stride=32
    ):
        shape = im.shape[:2]
        if isinstance(new_shape, int):
            new_shape = (new_shape, new_shape)
        
        r = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
        if not scaleup:
            r = min(r, 1.0)
        
        new_unpad = int(round(shape[1] * r)), int(round(shape[0] * r))
        dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]

        if auto:
            dw, dh = np.mod(dw, stride), np.mod(dh, stride)
        
        dw /= 2
        dh /= 2

        if shape[::-1] != new_unpad:
            im = cv2.resize(im, new_unpad, interpolation=cv2.INTER_LINEAR)
        top, botom = int(round(dh - 0.1)), int(round(dh + 0.1))
        left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
        im = cv2.copyMakeBorder(
            im, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color
        )
        return im, r, (dw, dh)
    
    def _infer(self, inputs: np.ndarray):
        try:
            img = cv2.cvtColor(inputs, cv2.COLOR_BGR2RGB)
            image = img.copy()
            image, ratio, dwdh = self.letterbox(image, auto=False)

            image = image.transpose((2, 0, 1))
            image = np.expand_dims(image, 0)
            image = np.ascontiguousarray(image)

            im = image.astype(np.float32) / 255.0

            inp = {self.input_details[0]: im}
            detections = self.model.run(self.output_details, inp)[0] 
            detections = detections[0]

            results = []

            for det in detections:
                bbox = det[:4]
                obj_conf = det[4]
                cls_id = int(det[5])
                kpts = det[6:].reshape(-1, 3)

                if obj_conf < 0.25:
                    continue

                bbox -= np.array(dwdh * 2)
                bbox /= ratio

                kpts[:, :2] -= np.array(dwdh)
                kpts[:, :2] /= ratio

                results.append(
                    {
                        "bbox": bbox,
                        "bbox_score": float(obj_conf),
                        "class_id": cls_id,
                        "keypoints": kpts[:, :2],
                        "keypoint_scores": kpts[:, 2],
                    }
                )

            return results

        except Exception as e:
            print(e)

    def infer(self, image, threshold):
        image = np.array(image)
        image = image[:, :, ::-1].copy()

        detections = self._infer(image)
        results = []

        for pred_instance in detections:
            keypoints = pred_instance["keypoints"]
            keypoint_scores = pred_instance["keypoint_scores"]

            for label in self.labels:
                skeleton = {
                    "confidence": str(pred_instance["bbox_score"]),
                    "label": label["name"],
                    "type": "skeleton",
                    "elements": [
                        {
                            "label": element["name"],
                            "type": "points",
                            "outside": 0
                            if keypoint_scores[element["id"]] >= threshold
                            else 1,
                            "points": [
                                float(keypoints[element["id"]][0]),
                                float(keypoints[element["id"]][1]),
                            ],
                            "confidence": str(
                                keypoint_scores[element["id"]]
                            ),
                        }
                        for element in label["sublabels"]
                    ],
                }

                if not all(e["outside"] for e in skeleton["elements"]):
                    results.append(skeleton)

        return results
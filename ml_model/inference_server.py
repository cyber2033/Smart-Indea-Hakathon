"""
===============================================================================
SIH 2026: AI Crop Disease Inference Microservice
Pretrained EfficientNetB0 Inference Server (Flask)
Port: 5001 (configurable via PORT environment variable)
===============================================================================
"""

import os
import sys
import json
import io
import argparse
import numpy as np
from PIL import Image

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Global model state
MODEL = None
TFLITE_INTERPRETER = None
MODEL_TYPE = None  # 'h5' or 'tflite'
MODEL_PATH = None
PORT = int(os.getenv("PORT", "5001"))
INPUT_SHAPE = (224, 224, 3)
CLASS_NAMES = []
TFLITE_INPUT_DETAILS = None
TFLITE_OUTPUT_DETAILS = None

def find_model_file():
    """
    Search candidate paths for trained model files (.h5 or .tflite).
    Priority:
    1. Environment variable MODEL_PATH
    2. ml_model/models/crop_disease_model.h5
    3. ml_model/models/crop_disease_model.tflite
    4. ml_model/models/model.tflite
    5. ml_model/scripts/crop_disease_model.h5
    """
    env_path = os.getenv("MODEL_PATH")
    if env_path and os.path.exists(env_path):
        return env_path

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__)))
    candidates = [
        os.path.join(base_dir, "models", "crop_disease_model.h5"),
        os.path.join(base_dir, "models", "crop_disease_model.tflite"),
        os.path.join(base_dir, "models", "model.tflite"),
        os.path.join(base_dir, "scripts", "crop_disease_model.h5"),
        os.path.join(base_dir, "scripts", "crop_disease_model.tflite"),
    ]

    for c in candidates:
        if os.path.exists(c):
            return c
    return None

def load_class_names():
    """
    Loads class names list from classes.json or fallback class_labels.json.
    Supports list, dict, or nested structure.
    """
    global CLASS_NAMES
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__)))
    candidates = [
        os.getenv("CLASSES_PATH"),
        os.path.join(base_dir, "models", "classes.json"),
        os.path.join(base_dir, "scripts", "models", "classes.json"),
        os.path.join(base_dir, "data", "classes.json"),
        os.path.join(base_dir, "data", "class_labels.json"),
    ]

    loaded_classes = None
    for path in candidates:
        if path and os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                if isinstance(data, list):
                    if len(data) > 0 and isinstance(data[0], str):
                        loaded_classes = data
                    elif len(data) > 0 and isinstance(data[0], dict) and "key" in data[0]:
                        # sorted by index if available
                        sorted_items = sorted(data, key=lambda x: x.get("index", 0))
                        loaded_classes = [item["key"] for item in sorted_items]
                elif isinstance(data, dict):
                    if "classes" in data and isinstance(data["classes"], list):
                        raw_list = data["classes"]
                        if len(raw_list) > 0 and isinstance(raw_list[0], dict) and "key" in raw_list[0]:
                            sorted_items = sorted(raw_list, key=lambda x: x.get("index", 0))
                            loaded_classes = [item["key"] for item in sorted_items]
                        elif len(raw_list) > 0 and isinstance(raw_list[0], str):
                            loaded_classes = raw_list
                    else:
                        # Could be {"0": "Tomato___Early_blight", ...} or {"Tomato___Early_blight": 0, ...}
                        try:
                            # Test if keys are integers or str(int)
                            idx_map = {int(k): v for k, v in data.items() if str(k).isdigit()}
                            if len(idx_map) > 0:
                                loaded_classes = [idx_map[i] for i in sorted(idx_map.keys())]
                            else:
                                # Inverted mapping: name -> index
                                inv_map = {int(v): k for k, v in data.items()}
                                loaded_classes = [inv_map[i] for i in sorted(inv_map.keys())]
                        except Exception:
                            loaded_classes = list(data.keys())

                if loaded_classes:
                    print(f"[✓] Loaded {len(loaded_classes)} class names from: {path}")
                    break
            except Exception as e:
                print(f"[!] Warning reading classes file {path}: {e}")

    if not loaded_classes:
        # Default 15 PlantVillage class names fallback
        loaded_classes = [
            "Pepper__bell___Bacterial_spot",
            "Pepper__bell___healthy",
            "Potato___Early_blight",
            "Potato___Late_blight",
            "Potato___healthy",
            "Tomato_Bacterial_spot",
            "Tomato_Early_blight",
            "Tomato_Late_blight",
            "Tomato_Leaf_Mold",
            "Tomato_Septoria_leaf_spot",
            "Tomato_Spider_mites_Two_spotted_spider_mite",
            "Tomato__Target_Spot",
            "Tomato__Tomato_YellowLeaf__Curl_Virus",
            "Tomato__Tomato_mosaic_virus",
            "Tomato_healthy"
        ]
        print(f"[!] Using default fallback class list ({len(loaded_classes)} classes)")

    CLASS_NAMES = loaded_classes
    return CLASS_NAMES

def init_model():
    """
    Initializes and loads the neural network model into memory.
    Supports Keras .h5 and TensorFlow Lite .tflite formats.
    """
    global MODEL, TFLITE_INTERPRETER, MODEL_TYPE, MODEL_PATH
    global TFLITE_INPUT_DETAILS, TFLITE_OUTPUT_DETAILS

    load_class_names()
    path = find_model_file()
    if not path:
        print("[!] NOTICE: No model weights file found (.h5 or .tflite).")
        print("    Place 'crop_disease_model.h5' or 'crop_disease_model.tflite' in 'ml_model/models/'.")
        print("    Inference requests will return 503 until a model is placed.")
        return False

    MODEL_PATH = path
    print(f"[*] Loading model from: {path} ...")

    if path.endswith(".tflite"):
        try:
            import tensorflow as tf
            interpreter = tf.lite.Interpreter(model_path=path)
            interpreter.allocate_tensors()
            TFLITE_INPUT_DETAILS = interpreter.get_input_details()
            TFLITE_OUTPUT_DETAILS = interpreter.get_output_details()
            TFLITE_INTERPRETER = interpreter
            MODEL_TYPE = "tflite"
            print(f"[✓] TensorFlow Lite model loaded successfully from {path}")
            return True
        except Exception as e:
            print(f"[!] Failed to load TFLite model: {e}")
            return False
    else:
        try:
            import tensorflow as tf
            # Suppress excessive TF logs
            os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
            model = tf.keras.models.load_model(path, compile=False)
            MODEL = model
            MODEL_TYPE = "h5"
            print(f"[✓] Keras model (.h5) loaded successfully from {path}")
            print(f"    Input shape: {model.input_shape} | Output shape: {model.output_shape}")
            return True
        except Exception as e:
            print(f"[!] Failed to load Keras model: {e}")
            return False

def preprocess_image(image_bytes):
    """
    Preprocesses uploaded image bytes exactly according to the training pipeline:
    1. Read via PIL and convert to RGB (stripping alpha channel / grayscale)
    2. Resize to 224x224 using Bilinear interpolation
    3. Convert to float32 NumPy array normalized to [0.0, 1.0]
    4. Expand dimensions to (1, 224, 224, 3)
    """
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != "RGB":
        image = image.convert("RGB")

    image = image.resize((224, 224), Image.Resampling.BILINEAR)
    img_array = np.array(image, dtype=np.float32) / 255.0
    img_tensor = np.expand_dims(img_array, axis=0)
    return img_tensor

@app.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint reporting microservice status, loaded model type, and classes.
    """
    model_loaded = (MODEL is not None) or (TFLITE_INTERPRETER is not None)
    return jsonify({
        "status": "healthy" if model_loaded else "waiting_for_model",
        "service": "SIH 2026 Crop Disease Inference Microservice",
        "model_loaded": model_loaded,
        "model_type": MODEL_TYPE,
        "model_path": MODEL_PATH,
        "classes_count": len(CLASS_NAMES),
        "port": PORT
    }), 200

@app.route("/classes", methods=["GET"])
def get_classes():
    """
    Returns the list of classes supported by the loaded model.
    """
    return jsonify({
        "success": True,
        "count": len(CLASS_NAMES),
        "classes": CLASS_NAMES
    }), 200

@app.route("/predict", methods=["POST"])
def predict():
    """
    Receives an image file via multipart/form-data (under 'image' or 'file'),
    preprocesses it, runs real neural network inference, and returns predicted class and confidence.
    """
    model_loaded = (MODEL is not None) or (TFLITE_INTERPRETER is not None)
    if not model_loaded:
        # Attempt one re-init in case user just dropped a model file
        if not init_model():
            return jsonify({
                "success": False,
                "error": "Model service unavailable",
                "message": "Trained crop disease model not loaded. Please ensure 'crop_disease_model.h5' or 'crop_disease_model.tflite' exists in 'ml_model/models/'."
            }), 503

    # Check uploaded file
    file = None
    if "image" in request.files:
        file = request.files["image"]
    elif "file" in request.files:
        file = request.files["file"]
    elif len(request.files) > 0:
        file = next(iter(request.files.values()))

    if not file or file.filename == "":
        return jsonify({
            "success": False,
            "error": "No image uploaded",
            "message": "Please upload a leaf image file in the multipart/form-data body under key 'image' or 'file'."
        }), 400

    try:
        image_bytes = file.read()
        input_tensor = preprocess_image(image_bytes)

        # Run inference
        if MODEL_TYPE == "tflite" and TFLITE_INTERPRETER is not None:
            # Check expected input dtype
            input_dtype = TFLITE_INPUT_DETAILS[0]["dtype"]
            if input_dtype == np.uint8 or input_dtype == np.int8:
                # Quantized input
                scale, zero_point = TFLITE_INPUT_DETAILS[0]["quantization"]
                quantized_input = (input_tensor / scale + zero_point).astype(input_dtype)
                TFLITE_INTERPRETER.set_tensor(TFLITE_INPUT_DETAILS[0]["index"], quantized_input)
            else:
                TFLITE_INTERPRETER.set_tensor(TFLITE_INPUT_DETAILS[0]["index"], input_tensor)

            TFLITE_INTERPRETER.invoke()
            raw_output = TFLITE_INTERPRETER.get_tensor(TFLITE_OUTPUT_DETAILS[0]["index"])[0]
            
            output_dtype = TFLITE_OUTPUT_DETAILS[0]["dtype"]
            if output_dtype == np.uint8 or output_dtype == np.int8:
                scale, zero_point = TFLITE_OUTPUT_DETAILS[0]["quantization"]
                probabilities = (raw_output.astype(np.float32) - zero_point) * scale
            else:
                probabilities = raw_output.astype(np.float32)
        else:
            # Native Keras model .h5
            preds = MODEL.predict(input_tensor, verbose=0)
            probabilities = preds[0]

        # Apply softmax if outputs are raw logits (sum not close to 1.0)
        prob_sum = float(np.sum(probabilities))
        if abs(prob_sum - 1.0) > 0.05:
            exp_preds = np.exp(probabilities - np.max(probabilities))
            probabilities = exp_preds / np.sum(exp_preds)

        class_index = int(np.argmax(probabilities))
        raw_confidence = float(probabilities[class_index])
        confidence_percent = round(raw_confidence * 100.0, 2)

        if class_index < len(CLASS_NAMES):
            class_name = CLASS_NAMES[class_index]
        else:
            class_name = f"Class_{class_index}"

        # Top 3 predictions for diagnosis transparency
        top_indices = np.argsort(probabilities)[::-1][:min(3, len(probabilities))]
        all_predictions = []
        for idx in top_indices:
            name = CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else f"Class_{idx}"
            all_predictions.append({
                "class_index": int(idx),
                "class_name": name,
                "confidence": round(float(probabilities[idx]) * 100.0, 2)
            })

        return jsonify({
            "success": True,
            "class_index": class_index,
            "class_name": class_name,
            "confidence": confidence_percent,
            "model_type": MODEL_TYPE,
            "top_predictions": all_predictions
        }), 200

    except Exception as e:
        print(f"[!] Error during model inference: {e}")
        return jsonify({
            "success": False,
            "error": "Inference processing error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SIH Crop Disease AI Inference Microservice")
    parser.add_argument("--port", type=int, default=int(os.getenv("PORT", "5001")), help="Service port (default: 5001)")
    parser.add_argument("--host", default="0.0.0.0", help="Binding host (default: 0.0.0.0)")
    args = parser.parse_args()

    PORT = args.port

    print("=" * 70)
    print("🌾 SIH 2026: Crop Disease AI Inference Microservice")
    print(f"🚀 Starting on http://localhost:{PORT}")
    print("=" * 70)

    init_model()

    app.run(host=args.host, port=PORT, debug=False, threaded=True)

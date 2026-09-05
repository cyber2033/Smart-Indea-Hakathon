"""
TensorFlow Lite Exporter & Quantizer
Converts trained Keras (.h5) models to lightweight .tflite for offline browser/mobile execution.
"""
import os
import argparse
import tensorflow as tf

def convert_to_tflite(keras_model_path, output_tflite_path="models/model.tflite", quantize=True):
    print(f"[*] Loading Keras model from: {keras_model_path}")
    model = tf.keras.models.load_model(keras_model_path)
    
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    if quantize:
        print("[*] Applying dynamic range float16 quantization for edge performance...")
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_types = [tf.float16]
        
    tflite_model = converter.convert()
    
    os.makedirs(os.path.dirname(output_tflite_path), exist_ok=True)
    with open(output_tflite_path, "wb") as f:
        f.write(tflite_model)
        
    size_mb = os.path.getsize(output_tflite_path) / (1024 * 1024)
    print(f"[✓] TFLite model generated: {output_tflite_path} ({size_mb:.2f} MB)")
    print("[✓] Model is ready for offline in-browser execution via TensorFlow Lite / WebGL!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="models/crop_disease_model.h5", help="Path to trained .h5 model")
    parser.add_argument("--output", default="models/model.tflite", help="Path to output .tflite")
    parser.add_argument("--no-quant", action="store_true", help="Disable quantization")
    args = parser.parse_args()
    
    convert_to_tflite(args.model, args.output, quantize=not args.no_quant)

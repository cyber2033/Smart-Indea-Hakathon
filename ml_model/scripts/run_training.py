"""
CLI Runner for Crop Disease Model Training
Loads PlantVillage 15 classes, executes Two-Phase Training, and exports models.
"""

import os
import sys
import shutil
import argparse

# Ensure standard output supports UTF-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from train_efficientnet_b0 import train_crop_disease_pipeline
from preprocess import load_datasets

def main():
    parser = argparse.ArgumentParser(description="Train EfficientNetB0 on PlantVillage (15 Classes)")
    parser.add_argument("--data-dir", default="dataset/plantvillage", help="Path to PlantVillage dataset folder")
    parser.add_argument("--classes", type=int, default=15, help="Number of disease classes (default 15)")
    parser.add_argument("--output-dir", default="models", help="Directory to save .h5 and .tflite models")
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)
    os.makedirs("../../frontend/public/models", exist_ok=True)

    print("=" * 75)
    print("[*] SMART KRISHI AI: MODEL TRAINING PIPELINE")
    print(f"[+] Dataset Path: {args.data_dir}")
    print(f"[+] Classes: {args.classes}")
    print(f"[+] Output Path: {args.output_dir}")
    print("=" * 75)

    dataset_path = args.data_dir
    if not os.path.exists(dataset_path):
        candidates = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "PlantVillage", "PlantVillage")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "PlantVillage")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset", "plantvillage")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset")),
            "PlantVillage/PlantVillage",
            "PlantVillage",
            "dataset/plantvillage",
            "dataset"
        ]
        for candidate in candidates:
            if os.path.exists(candidate):
                dataset_path = candidate
                print(f"[+] Auto-detected dataset directory at: {dataset_path}")
                break

    if not os.path.exists(dataset_path):
        print(f"[-] Notice: Dataset directory '{args.data_dir}' not found locally.")
        print("    If training on Google Colab, open 'ml_model/notebooks/SIH_Crop_Disease_EfficientNetB0.ipynb'")
        print("    If running locally, place your 15 class folders in 'dataset/plantvillage' or pass --data-dir <path>")
        return

    # Load 70% Train / 15% Val / 15% Test
    train_data, val_data, test_data, class_names = load_datasets(dataset_path)

    # Execute Phase 1 (10 epochs) + Phase 2 (15 epochs) + Evaluation + Exports
    model, h1, h2 = train_crop_disease_pipeline(
        train_data=train_data,
        val_data=val_data,
        test_data=test_data,
        num_classes=args.classes
    )

    # Move exported models to target directory
    if os.path.exists("crop_disease_model.h5"):
        shutil.move("crop_disease_model.h5", os.path.join(args.output_dir, "crop_disease_model.h5"))
    if os.path.exists("crop_disease_model.tflite"):
        tflite_dest = os.path.join(args.output_dir, "crop_disease_model.tflite")
        shutil.copy("crop_disease_model.tflite", tflite_dest)
        # Also copy to frontend public models for offline in-browser execution
        web_dest = "../../frontend/public/models/model.tflite"
        shutil.copy("crop_disease_model.tflite", web_dest)
        print(f"[+] Model synced to frontend web app: {web_dest}")

    print("\n" + "=" * 75)
    print("[+] TRAINING AND DEPLOYMENT COMPLETE!")
    print(f"[+] Native Keras Model: {os.path.join(args.output_dir, 'crop_disease_model.h5')}")
    print(f"[+] Quantized TFLite:   {os.path.join(args.output_dir, 'crop_disease_model.tflite')}")
    print("=" * 75)

if __name__ == "__main__":
    main()

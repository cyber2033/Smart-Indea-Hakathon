"""
Kaggle / PlantVillage Dataset Downloader
Smart India Hackathon 2026 - SIH26131 Crop Disease Detection
"""
import os
import sys
import argparse
from pathlib import Path

def setup_kaggle_credentials():
    kaggle_json = Path.home() / ".kaggle" / "kaggle.json"
    if not kaggle_json.exists():
        print("[-] Notice: Kaggle credentials not found at ~/.kaggle/kaggle.json")
        print("    To download directly via Kaggle API:")
        print("    1. Go to kaggle.com -> Account -> 'Create New API Token'")
        print("    2. Place kaggle.json in ~/.kaggle/ (or set KAGGLE_USERNAME / KAGGLE_KEY)")
        return False
    return True

def download_dataset(output_dir="dataset", dataset_name="emmarex/plantdisease"):
    target_path = Path(output_dir)
    target_path.mkdir(parents=True, exist_ok=True)
    
    print(f"[*] Preparing to download '{dataset_name}' to '{target_path.resolve()}'...")
    
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()
        print("[+] Kaggle API authenticated successfully.")
        api.dataset_download_files(dataset_name, path=str(target_path), unzip=True)
        print(f"[✓] Dataset downloaded and unzipped into {target_path}")
    except Exception as e:
        print(f"[-] Automated Kaggle download encountered an issue: {e}")
        print("\nManual Alternative:")
        print("1. Download PlantVillage dataset directly from:")
        print("   https://www.kaggle.com/datasets/emmarex/plantdisease or https://github.com/spMohanty/PlantVillage-Dataset")
        print(f"2. Unzip into: {target_path.resolve()}/train and {target_path.resolve()}/val")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download PlantVillage crop disease dataset")
    parser.add_argument("--output", default="dataset", help="Output directory path")
    parser.add_argument("--dataset", default="emmarex/plantdisease", help="Kaggle dataset handle")
    args = parser.parse_args()
    
    setup_kaggle_credentials()
    download_dataset(args.output, args.dataset)

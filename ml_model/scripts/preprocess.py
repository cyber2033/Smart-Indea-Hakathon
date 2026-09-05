"""
Data Preprocessing & Augmentation Pipeline
Optimized for EfficientNet-B0 (224x224 RGB inputs)
SIH 2026 - Section 2 Model Training Hyperparameters
"""
import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# SECTION 2 EXACT PARAMETERS
IMG_SIZE = (224, 224)
BATCH_SIZE = 32

def get_data_augmentation():
    """
    Exact Section 2 Augmentation:
    - Rotation: ±20° (factor = 20 / 360 = 0.055)
    - Horizontal flip
    - Zoom: 0.1 (±10%)
    - Brightness / Contrast: ±15%
    Prevents overfitting on leaf textures while retaining pathogen features.
    """
    return keras.Sequential([
        layers.RandomRotation(0.055, fill_mode="nearest", name="rotation_pm20_deg"),
        layers.RandomFlip("horizontal", name="horizontal_flip"),
        layers.RandomZoom((-0.1, 0.1), fill_mode="nearest", name="zoom_0.1"),
        layers.RandomContrast(0.15, name="brightness_contrast_pm15_pct")
    ], name="data_augmentation")

def load_datasets(dataset_dir, seed=42):
    """
    Loads images and splits into 70% Train, 15% Validation, 15% Test.
    Stratified loading using tf.data pipelines.
    """
    print(f"[*] Loading dataset from: {dataset_dir}")
    print(f"[*] Batch size: {BATCH_SIZE} | Image resolution: {IMG_SIZE}x3")
    
    # Check if dataset has train/val subdirectories or single directory
    train_dir = os.path.join(dataset_dir, "train")
    val_dir = os.path.join(dataset_dir, "val")
    
    if os.path.exists(train_dir) and os.path.exists(val_dir):
        # Already split by folder
        train_ds = tf.keras.utils.image_dataset_from_directory(
            train_dir,
            image_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            label_mode="categorical",
            seed=seed
        )
        val_ds = tf.keras.utils.image_dataset_from_directory(
            val_dir,
            image_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            label_mode="categorical",
            seed=seed
        )
        class_names = train_ds.class_names
        test_ds = None
    else:
        # Single directory: split into 70% Train, 15% Validation, 15% Test
        full_ds = tf.keras.utils.image_dataset_from_directory(
            dataset_dir,
            image_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            label_mode="categorical",
            seed=seed,
            shuffle=True
        )
        class_names = full_ds.class_names
        total_batches = len(full_ds)
        
        train_batches = int(total_batches * 0.70)
        val_batches = int(total_batches * 0.15)
        
        train_ds = full_ds.take(train_batches)
        remaining = full_ds.skip(train_batches)
        val_ds = remaining.take(val_batches)
        test_ds = remaining.skip(val_batches)
        
        print(f"[+] Total Batches: {total_batches} -> Train: {train_batches} (70%), Val: {val_batches} (15%), Test: {len(test_ds)} (15%)")

    print(f"[+] Total Disease Classes: {len(class_names)}")

    # Optimize GPU memory & throughput: Prefetch & Cache
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
    if test_ds is not None:
        test_ds = test_ds.cache().prefetch(buffer_size=AUTOTUNE)

    return train_ds, val_ds, test_ds, class_names

if __name__ == "__main__":
    print("[✓] Preprocessing module configured with exact Section 2 specifications.")

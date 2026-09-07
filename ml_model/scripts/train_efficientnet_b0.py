"""
================================================================================
SIH 2026: Crop Disease Detection (PlantVillage 15 Classes)
Architecture: Pretrained EfficientNetB0 + Custom Dense Classification Head
Training Strategy: Two-Phase Transfer Learning & Fine-Tuning -> TFLite Export
================================================================================
"""

import os
import sys
import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau

# Ensure standard output supports UTF-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def build_crop_disease_model(num_classes=15, input_shape=(224, 224, 3)):
    """
    Constructs the EfficientNetB0 model with the exact specified custom head:
      - EfficientNetB0 Base (pretrained on ImageNet, include_top=False, input_shape=(224,224,3))
      - Base model frozen initially (trainable=False)
      - GlobalAveragePooling2D()
      - Dense(128, activation='relu')
      - Dropout(0.3)
      - Dense(num_classes, activation='softmax')
    """
    # 1. Base Model (EfficientNetB0)
    base_model = EfficientNetB0(
        include_top=False,
        weights='imagenet',
        input_shape=input_shape
    )
    
    # Freeze base model initially for Feature Extraction (Phase 1)
    base_model.trainable = False
    
    # 2. Custom Classification Head
    inputs = tf.keras.Input(shape=input_shape, name="input_leaf_image")
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D(name="global_avg_pooling")(x)
    x = layers.Dense(128, activation='relu', name="dense_128_relu")(x)
    x = layers.Dropout(0.3, name="dropout_0.3")(x)
    outputs = layers.Dense(num_classes, activation='softmax', name="disease_output")(x)
    
    model = Model(inputs=inputs, outputs=outputs, name="CropDisease_EfficientNetB0")
    return model, base_model


def train_pipeline(train_data, val_data, test_data=None, num_classes=15):
    """
    Executes the complete Two-Phase Training Pipeline, evaluation, and dual export.
    """
    # -------------------------------------------------------------------------
    # STEP 1: Build Model Architecture
    # -------------------------------------------------------------------------
    print("=" * 70)
    print("[*] STEP 1: Building EfficientNetB0 with Custom Classification Head")
    print("=" * 70)
    model, base_model = build_crop_disease_model(num_classes=num_classes)
    model.summary()

    # -------------------------------------------------------------------------
    # STEP 2: Phase 1 -- Feature Extraction (Epochs 1-10)
    # -------------------------------------------------------------------------
    # - Base model frozen
    # - Optimizer: Adam, learning_rate = 0.0001 (1e-4)
    # - Loss: categorical_crossentropy
    # - Metrics: accuracy
    # - Epochs: 10
    # -------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("[*] PHASE 1: Feature Extraction (Epochs 1-10) | Base FROZEN | LR = 0.0001")
    print("=" * 70)
    
    phase1_optimizer = Adam(learning_rate=0.0001)
    model.compile(
        optimizer=phase1_optimizer,
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Callbacks for robust training
    callbacks_p1 = [
        EarlyStopping(monitor='val_loss', patience=4, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, min_lr=1e-6, verbose=1),
        ModelCheckpoint('best_checkpoint.h5', monitor='val_accuracy', save_best_only=True, verbose=1)
    ]
    
    history_phase1 = model.fit(
        train_data,
        validation_data=val_data,
        epochs=10,
        callbacks=callbacks_p1
    )
    
    p1_val_acc = history_phase1.history['val_accuracy'][-1] * 100
    print(f"[+] Phase 1 Completed! Validation Accuracy: {p1_val_acc:.2f}%")

    # -------------------------------------------------------------------------
    # STEP 3: Phase 2 -- Fine-Tuning (15 More Epochs, Total 25)
    # -------------------------------------------------------------------------
    # - Unfreeze last 30% of EfficientNetB0 layers (keep first 70% frozen)
    # - Re-compile with lower learning rate: 0.00001 (1e-5)
    # - Continue training for 15 more epochs
    # -------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("[*] PHASE 2: Fine-Tuning (15 More Epochs) | Unfreeze Last 30% | LR = 0.00001")
    print("=" * 70)
    
    base_model.trainable = True
    total_base_layers = len(base_model.layers)
    unfreeze_count = int(total_base_layers * 0.30)
    freeze_until = total_base_layers - unfreeze_count
    
    for layer in base_model.layers[:freeze_until]:
        layer.trainable = False
    for layer in base_model.layers[freeze_until:]:
        layer.trainable = True
        
    print(f"[+] Total Base Layers: {total_base_layers}")
    print(f"[+] Frozen Layers (First 70%): {freeze_until}")
    print(f"[+] Trainable Layers (Last 30%): {unfreeze_count}")

    phase2_optimizer = Adam(learning_rate=0.00001)
    model.compile(
        optimizer=phase2_optimizer,
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    callbacks_p2 = [
        EarlyStopping(monitor='val_loss', patience=4, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, min_lr=1e-7, verbose=1),
        ModelCheckpoint('crop_disease_model.h5', monitor='val_accuracy', save_best_only=True, verbose=1)
    ]
    
    initial_epoch = history_phase1.epoch[-1] + 1
    total_epochs = initial_epoch + 15
    
    history_phase2 = model.fit(
        train_data,
        validation_data=val_data,
        epochs=total_epochs,
        initial_epoch=initial_epoch,
        callbacks=callbacks_p2
    )
    
    final_val_acc = history_phase2.history['val_accuracy'][-1] * 100
    print(f"\n[+] Phase 2 Fine-Tuning Completed! Final Val Accuracy: {final_val_acc:.2f}%")

    # -------------------------------------------------------------------------
    # STEP 4: Evaluation on Test Data
    # -------------------------------------------------------------------------
    if test_data is not None:
        print("\n" + "=" * 70)
        print("[*] STEP 4: Evaluating on Held-Out Test Data")
        print("=" * 70)
        test_loss, test_accuracy = model.evaluate(test_data)
        print(f"\n[+] >>> Final Test Accuracy: {test_accuracy * 100:.2f}% <<<")
        print(f"[+] Final Test Loss: {test_loss:.4f}")

    # -------------------------------------------------------------------------
    # STEP 5: Save Trained Keras Model (.h5)
    # -------------------------------------------------------------------------
    h5_filename = 'crop_disease_model.h5'
    model.save(h5_filename)
    h5_size_mb = os.path.getsize(h5_filename) / (1024 * 1024)
    print(f"\n[+] Keras model saved successfully: '{h5_filename}' ({h5_size_mb:.2f} MB)")

    # -------------------------------------------------------------------------
    # STEP 6: Convert to TensorFlow Lite (.tflite) for Offline Edge Inference
    # -------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("[*] STEP 6: Converting Model to TensorFlow Lite (.tflite)")
    print("=" * 70)
    
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    # Apply dynamic range optimization for edge / mobile deployment
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()
    
    tflite_filename = 'crop_disease_model.tflite'
    with open(tflite_filename, 'wb') as f:
        f.write(tflite_model)
        
    tflite_size_mb = os.path.getsize(tflite_filename) / (1024 * 1024)
    print(f"[+] TFLite model exported successfully: '{tflite_filename}' ({tflite_size_mb:.2f} MB)")
    print("[+] Ready for offline mobile inference (zero-latency, WiFi-off field deployment)!")

    return model, history_phase1, history_phase2

# Alias for compatibility with runner scripts
train_crop_disease_pipeline = train_pipeline


# =============================================================================
# Standalone Execution Example (Run when executed directly)
# =============================================================================
if __name__ == "__main__":
    print("[*] Pipeline module loaded.")
    print("    To run training, call: train_pipeline(train_data, val_data, test_data, num_classes=15)")

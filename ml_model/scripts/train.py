"""
EfficientNetB0 Transfer Learning Training Pipeline
SIH 2026 - Section 2 Model Training Hyperparameters

Phase 1 (Epochs 1-10):
  - Base model (EfficientNet-B0) FROZEN
  - Train custom classification head
  - Learning rate: 0.0001 (Adam)

Phase 2 (Epochs 11-25):
  - Unfreeze last 30% of EfficientNet-B0 layers
  - Lower learning rate: 0.00001 (1e-5)
  - Target: Validation Accuracy >= 85%
"""
import os
import json
import argparse
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import EfficientNetB0
from preprocess import load_datasets, get_data_augmentation, IMG_SIZE, BATCH_SIZE

def build_model(num_classes):
    """
    Constructs model using pre-trained EfficientNetB0 base + custom classification head.
    """
    inputs = layers.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3), name="input_leaf_image")
    
    # Apply Section 2 Data Augmentation (Rotation +-20 deg, Flip, Zoom 0.1, Contrast +-15%)
    augmented = get_data_augmentation()(inputs)
    
    # Pre-trained ImageNet base
    base_model = EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_tensor=augmented
    )
    base_model.trainable = False  # FROZEN in Phase 1
    
    # Custom Classification Head
    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(base_model.output)
    x = layers.BatchNormalization(name="batch_norm")(x)
    x = layers.Dropout(0.3, name="top_dropout")(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="disease_prediction")(x)
    
    model = keras.Model(inputs, outputs, name="SIH2026_EfficientNetB0_CropDoctor")
    return model, base_model

def train(dataset_path, phase1_epochs=10, total_epochs=25, output_model_path="models/crop_disease_model.h5"):
    os.makedirs("models", exist_ok=True)
    os.makedirs("reports", exist_ok=True)
    
    # Load 70% Train / 15% Val / 15% Test datasets
    train_ds, val_ds, test_ds, class_names = load_datasets(dataset_path)
    num_classes = len(class_names)
    
    # Save class mapping
    with open("models/classes.json", "w") as f:
        json.dump(class_names, f, indent=2)
    print(f"[+] Saved {num_classes} disease classes to models/classes.json")
    
    model, base_model = build_model(num_classes)
    
    # Callbacks: Early stopping on validation loss & checkpointing
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=4,
            restore_best_weights=True,
            verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-7,
            verbose=1
        ),
        keras.callbacks.ModelCheckpoint(
            filepath=output_model_path,
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1
        )
    ]
    
    # =========================================================================
    # PHASE 1 (Epochs 1-10): Base FROZEN, Custom Head Only, LR = 0.0001 (1e-4)
    # =========================================================================
    print("\n" + "="*70)
    print(f"🚀 PHASE 1 (Epochs 1 to {phase1_epochs}): Base Frozen, LR = 0.0001 (Adam)")
    print("="*70)
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.0001),
        loss="categorical_crossentropy",
        metrics=["accuracy", keras.metrics.Precision(name="precision"), keras.metrics.Recall(name="recall")]
    )
    
    history_phase1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=phase1_epochs,
        callbacks=callbacks
    )
    
    p1_val_acc = history_phase1.history['val_accuracy'][-1] * 100
    print(f"[✓] Phase 1 Complete! Val Accuracy: {p1_val_acc:.2f}%")
    
    # =========================================================================
    # PHASE 2 (Epochs 11-25): Unfreeze Last 30% of Layers, LR = 0.00001 (1e-5)
    # =========================================================================
    print("\n" + "="*70)
    print(f"🚀 PHASE 2 (Epochs {phase1_epochs+1} to {total_epochs}): Unfreezing Last 30% Layers, LR = 0.00001")
    print("="*70)
    
    base_model.trainable = True
    total_base_layers = len(base_model.layers)
    num_unfreeze = int(total_base_layers * 0.30)
    freeze_until = total_base_layers - num_unfreeze
    
    for layer in base_model.layers[:freeze_until]:
        layer.trainable = False
    for layer in base_model.layers[freeze_until:]:
        layer.trainable = True
        
    print(f"[+] Total Base Layers: {total_base_layers} | Frozen: {freeze_until} | Trainable (Last 30%): {num_unfreeze}")
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.00001), # 1e-5 fine-tuning LR
        loss="categorical_crossentropy",
        metrics=["accuracy", keras.metrics.Precision(name="precision"), keras.metrics.Recall(name="recall")]
    )
    
    history_phase2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=total_epochs,
        initial_epoch=history_phase1.epoch[-1] + 1,
        callbacks=callbacks
    )
    
    final_val_acc = history_phase2.history['val_accuracy'][-1] * 100
    print(f"\n[✓] Phase 2 Fine-Tuning Complete! Final Val Accuracy: {final_val_acc:.2f}%")
    
    # Verify Benchmark (Target: >= 85%)
    if final_val_acc >= 85.0:
        print(f"🎉 SUCCESS: Target accuracy achieved ({final_val_acc:.2f}% >= 85.0% Benchmark)!")
    else:
        print(f"⚠️ Target Notice: Val accuracy reached {final_val_acc:.2f}%. Check augmentation or data quality.")
        
    # Evaluate on held-out Test set (15% split)
    if test_ds is not None:
        print("\n[*] Evaluating model on held-out 15% Test Set...")
        test_results = model.evaluate(test_ds)
        print(f"[+] Test Set Accuracy: {test_results[1]*100:.2f}% | Loss: {test_results[0]:.4f}")

    # Save final model
    model.save(output_model_path)
    print(f"[✓] Final model saved: {output_model_path}")
    
    # Save training metrics plot
    plot_training_history(history_phase1, history_phase2)

def plot_training_history(h1, h2):
    acc = h1.history['accuracy'] + h2.history['accuracy']
    val_acc = h1.history['val_accuracy'] + h2.history['val_accuracy']
    loss = h1.history['loss'] + h2.history['loss']
    val_loss = h1.history['val_loss'] + h2.history['val_loss']

    plt.figure(figsize=(14, 5))
    
    plt.subplot(1, 2, 1)
    plt.plot(acc, label='Training Accuracy', color='#2D6A4F', linewidth=2)
    plt.plot(val_acc, label='Validation Accuracy', color='#E76F51', linewidth=2)
    plt.axhline(y=0.85, color='gray', linestyle='--', label='85% Target Benchmark')
    plt.axvline(x=len(h1.history['accuracy'])-1, color='blue', linestyle=':', label='Phase 2 (Fine-Tuning)')
    plt.title('EfficientNetB0 Accuracy Curves')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend(loc='lower right')
    plt.grid(True, alpha=0.3)

    plt.subplot(1, 2, 2)
    plt.plot(loss, label='Training Loss', color='#2D6A4F', linewidth=2)
    plt.plot(val_loss, label='Validation Loss', color='#E76F51', linewidth=2)
    plt.axvline(x=len(h1.history['loss'])-1, color='blue', linestyle=':', label='Phase 2 (Fine-Tuning)')
    plt.title('Loss Convergence Curves')
    plt.xlabel('Epoch')
    plt.ylabel('Categorical Crossentropy Loss')
    plt.legend(loc='upper right')
    plt.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig("reports/training_metrics.png", dpi=300)
    print("[✓] Accuracy and loss curves saved to reports/training_metrics.png")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="dataset", help="Path to dataset directory")
    parser.add_argument("--phase1-epochs", type=int, default=10, help="Epochs for Phase 1 (Base Frozen)")
    parser.add_argument("--total-epochs", type=int, default=25, help="Total epochs (Phase 1 + Phase 2)")
    parser.add_argument("--output", default="models/crop_disease_model.h5", help="Path to save .h5 model")
    args = parser.parse_args()
    
    train(args.data, args.phase1_epochs, args.total_epochs, args.output)

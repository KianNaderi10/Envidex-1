import os
import shutil
import json
from io import BytesIO

import numpy as np
import pandas as pd
import requests
import tensorflow as tf
from PIL import Image
from sklearn.model_selection import train_test_split
from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0
from tqdm import tqdm


# ===== CONFIG =====
CSV_PATH = "AnimalAiImageRec\TestSet.csv"
OUTPUT_DIR = "animal_dataset"
SPLIT_DIR = "animal_split"

TRAIN_DIR = os.path.join(SPLIT_DIR, "train")
VAL_DIR = os.path.join(SPLIT_DIR, "val")

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 5


# ===== HELPERS =====
def safe_name(x):
	return str(x).strip().lower().replace(" ", "_").replace("/", "_")


# ===== DOWNLOAD IMAGES =====
def download_images(df, output_dir):
	os.makedirs(output_dir, exist_ok=True)
	saved_rows = []

	for i, row in tqdm(df.iterrows(), total=len(df), desc="Downloading images"):
		url = row["image_url"]
		label = safe_name(row["scientific_name"])

		class_dir = os.path.join(output_dir, label)
		os.makedirs(class_dir, exist_ok=True)

		try:
			response = requests.get(url, timeout=15)
			response.raise_for_status()

			img = Image.open(BytesIO(response.content)).convert("RGB")

			filename = f"{label}_{i}.jpg"
			save_path = os.path.join(class_dir, filename)
			img.save(save_path, "JPEG")

			saved_rows.append({"filepath": save_path, "label": label})

		except Exception as e:
			print(f"Skipping {url} because of error: {e}")

	return pd.DataFrame(saved_rows)


# ===== SPLIT DATA =====
def split_dataset(saved_df, train_dir, val_dir):
	os.makedirs(train_dir, exist_ok=True)
	os.makedirs(val_dir, exist_ok=True)

	for label in saved_df["label"].unique():
		label_df = saved_df[saved_df["label"] == label]

		if len(label_df) < 2:
			print(f"Skipping class {label}: not enough images")
			continue

		train_files, val_files = train_test_split(
			label_df["filepath"].tolist(),
			test_size=0.2,
			random_state=42
		)

		os.makedirs(os.path.join(train_dir, label), exist_ok=True)
		os.makedirs(os.path.join(val_dir, label), exist_ok=True)

		for f in train_files:
			shutil.copy(f, os.path.join(train_dir, label, os.path.basename(f)))

		for f in val_files:
			shutil.copy(f, os.path.join(val_dir, label, os.path.basename(f)))


# ===== LOAD DATA =====
def load_datasets(train_dir, val_dir):
	train_ds = tf.keras.utils.image_dataset_from_directory(
		train_dir,
		image_size=IMG_SIZE,
		batch_size=BATCH_SIZE,
		shuffle=True
	)

	val_ds = tf.keras.utils.image_dataset_from_directory(
		val_dir,
		image_size=IMG_SIZE,
		batch_size=BATCH_SIZE,
		shuffle=False
	)

	class_names = train_ds.class_names
	num_classes = len(class_names)

	autotune = tf.data.AUTOTUNE
	train_ds = train_ds.prefetch(autotune)
	val_ds = val_ds.prefetch(autotune)

	print("Classes:", class_names)
	return train_ds, val_ds, class_names, num_classes


# ===== BUILD MODEL =====
def build_model(num_classes):
	data_augmentation = tf.keras.Sequential([
		layers.RandomFlip("horizontal"),
		layers.RandomRotation(0.1),
		layers.RandomZoom(0.1),
	])

	base_model = EfficientNetB0(
		include_top=False,
		weights="imagenet",
		input_shape=(224, 224, 3)
	)
	base_model.trainable = False

	inputs = layers.Input(shape=(224, 224, 3))
	x = data_augmentation(inputs)
	x = base_model(x, training=False)
	x = layers.GlobalAveragePooling2D()(x)
	x = layers.Dropout(0.2)(x)
	outputs = layers.Dense(num_classes, activation="softmax")(x)

	model = models.Model(inputs, outputs)

	model.compile(
		optimizer="adam",
		loss="sparse_categorical_crossentropy",
		metrics=["accuracy"]
	)

	return model


# ===== MAIN =====
def main():
	# Load CSV
	df = pd.read_csv(CSV_PATH)
	df = df.dropna(subset=["image_url", "scientific_name"])

	print("Loaded CSV")

	# Download images
	saved_df = download_images(df, OUTPUT_DIR)

	if saved_df.empty:
		raise ValueError("No images downloaded.")

	# Split dataset
	split_dataset(saved_df, TRAIN_DIR, VAL_DIR)

	# Load datasets
	train_ds, val_ds, class_names, num_classes = load_datasets(TRAIN_DIR, VAL_DIR)

	# Build model
	model = build_model(num_classes)

	# Train
	model.fit(
		train_ds,
		validation_data=val_ds,
		epochs=EPOCHS
	)

	# Save model
	model.save("animal_species_model.keras")

	# 🔥 SAVE CLASS NAMES (THIS IS STEP 1)
	with open("class_names.json", "w") as f:
		json.dump(class_names, f)

	print("Model and class names saved!")


if __name__ == "__main__":
	main()
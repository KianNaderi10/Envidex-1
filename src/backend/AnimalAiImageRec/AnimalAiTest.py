import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.utils import load_img, img_to_array

# ===== CONFIG =====
MODEL_PATH = "animal_species_model.keras"
CLASS_NAMES_PATH = "class_names.json"
IMAGE_PATH = "AnimalAiImageRec\TestImages\ync_34833886.jpg"   # change this

IMG_SIZE = (224, 224)

# ===== LOAD MODEL =====
model = tf.keras.models.load_model(MODEL_PATH)

# ===== LOAD CLASS NAMES =====
with open(CLASS_NAMES_PATH, "r") as f:
	class_names = json.load(f)

# ===== OPTIONAL: scientific names =====
SCIENTIFIC_NAMES = {
	"panthera_leo": "Panthera leo",
	"panthera_tigris": "Panthera tigris",
	"canis_lupus": "Canis lupus",
	"ochotona_princeps": "Ochotona princeps"
}

# ===== PREDICTION FUNCTION =====
def predict_image(image_path):
	img = load_img(image_path, target_size=IMG_SIZE)
	arr = img_to_array(img)
	arr = np.expand_dims(arr, axis=0)

	preds = model.predict(arr, verbose=0)
	pred_index = np.argmax(preds[0])
	confidence = preds[0][pred_index]

	label = class_names[pred_index]
	scientific_name = SCIENTIFIC_NAMES.get(label, label)

	print("\n--- Prediction ---")
	print("Common name:", label)
	print("Scientific name:", scientific_name)
	print("Confidence:", round(float(confidence) * 100, 2), "%")

# ===== RUN =====
if __name__ == "__main__":
	predict_image(IMAGE_PATH)
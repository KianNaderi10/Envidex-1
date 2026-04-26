import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.utils import load_img, img_to_array

# ===== CONFIG =====
MODEL_PATH = "animal_species_model.keras"
CLASS_NAMES_PATH = "class_names.json"
IMAGE_PATH = "src/backend/AnimalAiImageRec/TestImages/ync_34833886.jpg"

OUTPUT_FOLDER = "src/backend/Predictions"
OUTPUT_JSON = os.path.join(OUTPUT_FOLDER, "prediction.json")

IMG_SIZE = (224, 224)

# ===== CREATE FOLDER =====
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# ===== LOAD MODEL =====
model = tf.keras.models.load_model(MODEL_PATH)

# ===== LOAD CLASS NAMES =====
with open(CLASS_NAMES_PATH, "r") as f:
    class_names = json.load(f)

# ===== OPTIONAL: scientific names =====
SCIENTIFIC_NAMES = {
    "ochotona_princeps": "Ochotona princeps",
    "panthera_leo": "Panthera leo",
    "panthera_tigris": "Panthera tigris"
}

# ===== PREDICT + SAVE =====
def predict_and_save(image_path):
    img = load_img(image_path, target_size=IMG_SIZE)
    arr = img_to_array(img)
    arr = np.expand_dims(arr, axis=0)

    preds = model.predict(arr, verbose=0)
    pred_index = np.argmax(preds[0])
    confidence = float(preds[0][pred_index])

    label = class_names[pred_index]
    scientific_name = SCIENTIFIC_NAMES.get(label, label)

    result = {
        "scientific_name": scientific_name,
        "confidence": round(confidence * 100, 2)
    }

    print("\n--- Prediction ---")
    print(result)

    # Save to Predictions folder
    with open(OUTPUT_JSON, "w") as f:
        json.dump(result, f, indent=4)

    print(f"\nSaved to {OUTPUT_JSON}")

    return result


# ===== RUN =====
if __name__ == "__main__":
    predict_and_save(IMAGE_PATH)
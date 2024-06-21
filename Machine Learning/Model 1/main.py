from flask import Flask, request, jsonify
import cv2
import numpy as np
import tensorflow as tf
import os

app = Flask(__name__)

# Fungsi untuk mengonversi warna dari HEX ke RGB
def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

# Fungsi untuk mengonversi warna dari RGB ke HEX
def rgb_to_hex(rgb):
    return '#%02x%02x%02x' % tuple(rgb)

# Fungsi untuk ekstraksi warna kulit rata-rata
def extract_average_face_color(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Gambar tidak ditemukan atau format tidak didukung.")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    if len(faces) == 0:
        raise ValueError("Tidak ada wajah yang terdeteksi dalam gambar.")

    x, y, w, h = faces[0]
    face_region = image[y:y+h, x:x+w]
    face_tensor = tf.convert_to_tensor(face_region, dtype=tf.float32)
    mean_color = tf.reduce_mean(face_tensor, axis=[0, 1])
    mean_color = mean_color.numpy().astype(int)
    hex_color = "#{:02x}{:02x}{:02x}".format(mean_color[2], mean_color[1], mean_color[0])

    return hex_color

# Muat model yang sudah disimpan
model = tf.keras.models.load_model('pallete_generator.h5', compile=False)

# Prediksi palet warna berdasarkan warna kulit
def predict_palette(image_path):
    skin_tone_hex = extract_average_face_color(image_path)
    skin_tone_rgb = np.array([hex_to_rgb(skin_tone_hex)])

    predicted_palette = model.predict(skin_tone_rgb)
    predicted_palette = predicted_palette.reshape(-1, 3).astype(int)
    predicted_palette_hex = [rgb_to_hex(color) for color in predicted_palette]

    return skin_tone_hex, predicted_palette_hex

@app.route('/predict_palette', methods=['POST'])
def predict_palette_api():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        file_path = os.path.join('uploads', file.filename)
        file.save(file_path)

        try:
            skin_tone_hex, predicted_palette = predict_palette(file_path)
            response = {
                'extracted_skin_tone': skin_tone_hex,
                'predicted_palette': predicted_palette
            }
            return jsonify(response)
        except Exception as e:
            return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9999)

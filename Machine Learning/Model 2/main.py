from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from rembg import remove
from PIL import Image
from colorthief import ColorThief
import io

app = Flask(__name__)


model = tf.keras.models.load_model('color_matcher.h5', compile=False)

def remove_background(input_image):
    output_image = remove(input_image)
    return output_image

def get_dominant_color(image):
    color_thief = ColorThief(image)
    dominant_color = color_thief.get_color(quality=1)
    hex_color = '#{:02x}{:02x}{:02x}'.format(dominant_color[0], dominant_color[1], dominant_color[2])
    return hex_color, dominant_color

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return np.array([int(hex_color[i:i+2], 16) for i in (0, 2, 4)])

def predict_matching_color(top_color_hex, palette_hex_list, model):
    top_color_rgb = hex_to_rgb(top_color_hex) / 255.0
    palette_rgb_list = np.array([hex_to_rgb(color) for color in palette_hex_list]) / 255.0

    # Expand dimensions to match model input requirements
    top_color_input = np.expand_dims(top_color_rgb, axis=0)
    palette_input = np.expand_dims(palette_rgb_list, axis=0)

    # Make prediction
    predicted_color = model.predict([top_color_input, palette_input])

    # Convert prediction from normalized to hex format
    predicted_color_rgb = np.clip(predicted_color[0] * 255, 0, 255).astype(int)
    predicted_color_hex = '#{:02x}{:02x}{:02x}'.format(*predicted_color_rgb)

    return predicted_color_hex

@app.route('/color_matcher', methods=['POST'])
def predict():
    try:
        # Get the image file from the form data
        if 'image' not in request.files:
            return jsonify({'error': 'Image file is missing'}), 400
        image_file = request.files['image']

        # Get the color list from the form data
        color_list_str = request.form.get('color_list')
        if not color_list_str:
            return jsonify({'error': 'Color list is missing'}), 400

        try:
            # Parse the color list from JSON string to Python list
            color_list = eval(color_list_str)
        except Exception as e:
            return jsonify({'error': 'Invalid color list format'}), 400

        # Load image
        input_image = Image.open(image_file)

        # Remove background
        output_image = remove_background(input_image)
        
        # Save the image to a bytes buffer
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        # Get the dominant color and its hex representation
        hex_color, dominant_color = get_dominant_color(img_byte_arr)
        print(f"Warna dominan: {hex_color}")

        # Predict the matching color
        predicted_color_hex = predict_matching_color(hex_color, color_list, model)
        print(f"Predicted matching color: {predicted_color_hex}")

        return jsonify({
            'dominant_color': hex_color,
            'predicted_color': predicted_color_hex
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9090)

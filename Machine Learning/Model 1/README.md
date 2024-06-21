URL: /predict_palette

Method: POST

Header:
Content-Type: multipart/form-data

Body:
file (wajib): File gambar yang berisi wajah. Format yang didukung termasuk JPEG, PNG, dll.

Sukses (200 OK):
{
  "extracted_skin_tone": "#aabbcc",
  "predicted_palette": ["#123456", "#654321", "#abcdef", "#fedcba", "#0f0f0f"]
}


Kesalahan (400 Bad Request):
{
  "error": "No file part"
}

No File Sended
{
  "error": "No selected file"
}


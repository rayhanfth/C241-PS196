# HueTiful
C241-PS196 Capstone Project

## Database
- Name
  - testdb
- Table
  - users
    - id
    - name
    - email
    - password
    - is_verified
    - verification_token
    ```
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE.
      verification_token VARCHAR(255)
    );
    ```

  - activities
    - id
    - email_users
    - extracted_skin_tone
    - predicted_palette JSON
    ```
    CREATE TABLE activities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email_users VARCHAR(255) NOT NULL,
      extracted_skin_tone VARCHAR(7) NOT NULL,
      predicted_palette JSON NOT NULL,
      FOREIGN KEY (email_users) REFERENCES users(email)
    );
    ```
    > Don't forget to add FOREIGN KEY for email_users

## Endpoint
Base URL: http://35.219.99.255:5000

### Register
- URL
  - /api/auth/register
- Method
  - POST
- Request Body
  - name as string
  - email as string, must be unique
  - password as string
- Response
  ```
  {
    "status": "success",
    "message": "Anda berhasil register"
  }
  ```
  > You will receive an Email Verification on your Inbox or Spam
  
### Email Verification
- URL
  - /api/auth/verify-email/'Token'
  > Replace 'Token' with your Email Verification token
- Method
  - POST
- Response
  ```
  {
    "status": "success",
    "message": "Email verified successfully"
  }
  ```
  > If you Click the Link from the email this step will be done automaticly

### Login
- URL
  - /api/auth/login
- Method
  - POST
- Request Body
  - email as string
  - password as string
- Response
  ```
  {
    "status": "success",
    "message": "Anda berhasil login",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzE3MDg1MTU2LCJleHAiOjE3MTcwODg3NTZ9.K_Mp6nAaWhkaJ2DacRJTqf8YwZO2ljc2ciKHjd1G_bM"
  }
  ```
> Before you Login please make sure to Verify your Email

### Reset Password
- Request Reset Password
  - URL
    - /api/reset-password/request-reset-password
  - Method
    - POST
  - Request Body
    - email as string
  - Response
    ```
    {
      "status": "success",
      "message": "Reset password email sent"
    }
    ```
    > Reset Password Request Email will be sent to your Inbox or Spam

- Verify Reset Token
  - URL
    - /api/reset-password/verify-reset-token/'Token'
    > Replace 'Token' with your your Reset Password Token on your Email
  - Method
    - GET
  - Response
    ```
    {
      "status": "success",
      "message": "Password reset successfully. A new password has been sent to your email."
    }
    ```
    > If you Click the Link from the email this step will be done automaticly

### Authorization
- URL
  - /api/protected
- Method
  - GET
- Headers
  - Key: Authorization
  - Value: Bearer 'Token'
  > Replace 'Token' with your login token
- Response
  ```
  {
    "msg": "You have access to this route",
    "userId": 3
  }
  ```

### History
- Add Activities
  - URL
    - /api/save-activity
  - Method
    - POST
  - Headers
    - Key: Authorization
    - Value: Bearer 'Token'
    > Replace 'Token' with your login token
  - Body
    - extracted_skin_tone as string
    - predicted_palette as string
    > Body is the same as the Machine Learning Response on Predict Pallette
  - Response
    ```
    {
      "msg": "Activity saved successfully"
    }
    ```

- Get Activities
  - URL
    - /api/activities
  - Method
    - GET
  - Headers
    - Key: Authorization
    - Value: Bearer 'Token'
    > Replace 'Token' with your login token
  - Response
    ```
    [
      {
          "id": 1,
          "email_users": "c299d4ky0837@bangkit.academy",
          "extracted_skin_tone": "#7f543c",
          "predicted_palette": "[\"#448347\",\"#7c8756\",\"#943e8e\",\"#6e63ac\",\"#555b83\"]"
      },
      {
          "id": 2,
          "email_users": "c299d4ky0837@bangkit.academy",
          "extracted_skin_tone": "#ffffff",
          "predicted_palette": "[\"#448347\",\"#7c8756\",\"#943e8e\",\"#6e63ac\",\"#555b83\"]"
      },
      {
          "id": 3,
          "email_users": "c299d4ky0837@bangkit.academy",
          "extracted_skin_tone": "#ffffff",
          "predicted_palette": "[\"#448347\",\"#7c8756\",\"#943e8e\",\"#6e63ac\",\"#555b83\"]"
      }
    ]
    ```
## Model 1
### Predict Pallette
- URL
  - https://capstone-uwrmimd5cq-et.a.run.app/predict_palette
- Method:
  - POST
- Header
  - Content-Type: multipart/form-data
- Body
  - file (wajib): File gambar yang berisi wajah. Format yang didukung termasuk JPEG, PNG, dll.
- Status : Sukses (200 OK):
- Response
  ```
  {
    "extracted_skin_tone": "#aabbcc",
    "predicted_palette": ["#123456",
     "#654321",
     "#abcdef",
     "#fedcba",
     "#0f0f0f"]
  }
  ```
- Status : Kesalahan (400 Bad Request):
- Response
  ```
  {
    "error": "No file part"
  }
  ```
- Status : No File Sended 
- Response
  ```
  {
    "error": "No selected file"
  }
  ```
## Model 2
### macthing color pallete
- URL
  - https://capstone-model-2-uwrmimd5cq-et.a.run.app/color_matcher
- Description:
  - This endpoint accepts an image file and a list of colors. It processes the image to remove its background, determines the dominant color, and predicts a matching color from the provided palette.
- Method:
  - POST
- Request
  - Content-Type: multipart/form-data
- Parameter
  - image (file): The image file to be processed. This is a required parameter.
color_list (string): A JSON string representing a list of colors in hexadecimal format. This is a required parameter
- Status : Sukses (200 OK):
- Response:
  - Content-Type: application/json
- Response : Succesfull
  - Status Code: 200 OK

  ```
  {
    "dominant_color": "#hex_color",
    "predicted_color": "#predicted_color_hex"
  }
  ```
- Response : Error
  - Status : 400 Bad Request
  
Missing Image File:
```
{
  "error": "Image file is missing"
}
```

Missing Color List:
```
{
  "error": "Color list is missing"
}
```

Invalid Color List Format:
```
{
  "error": "Invalid color list format"
}
```

- Status Code: 500 Internal Server Error
```
{
  "error": "Error message"
}
```

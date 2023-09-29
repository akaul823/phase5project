# Flower Image Classifier App: classify
## Overview

The Flower Image Classifier App allows users to identify different species of flowers by either selecting an image from their device's gallery or by capturing a new photo. The app leverages a machine learning model trained using PyTorch and optimized for mobile deployment via TensorFlow Lite.

## Technologies Used

- **PyTorch**: For building and training the image classification model.
- **TensorFlow**: For converting the PyTorch model to TensorFlow Lite format.
- **Flask**: For creating the backend service to handle image uploads and inference.
- **React Native & Expo**: For building the cross-platform mobile app.
- **ngrok**: To expose the local Flask server to the internet, making it accessible from the React Native app.

## Getting Started

### Requirements

- Python 3.8+
- Node.js and npm
- Expo CLI
- Flask
- PyTorch and TensorFlow
- ngrok

### Installation

1. **Backend Setup**:
   - DO THIS BACKEND FIRST
   - LINK TO BACKEND REPOSITORY: https://github.com/akaul823/hostedModel/tree/main

3. **FRONTEND**:
   For the frontend, we will copy and paste that URL from above to line 112 at the fetch request. Now we can start the app.
    ```bash
    npm install
    npx expo start --tunnel
    ```
    After this, a barcode and set of options will show up. You can use your phone's camera to scan the barcode, and the app will load on your phone through Expo Go.

### Usage
Scan the QR code with the Expo Go app on your mobile device.

### Demo
-Placeholder

## System Architecture

1. **Model Architecture**: The image classification model was built using PyTorch's pre-trained image classifier model and fine-tuned for flower species identification.

2. **Conversion to TFLite**: After training, the model was converted into the TFLite format using TensorFlow's converter.

3. **Backend Server**: The Flask server accepts image uploads from the React Native app, runs inference using the TFLite model, and sends the predicted flower species back to the app.

4. **React Native App**: Built using React Native and Expo, the app provides an intuitive interface for the user to either capture a new photo or choose an existing one. Once the image is selected, it's sent to the Flask server for prediction. A number is returned, which is then mapped onto a list of labels. 

## Contributing

If you'd like to contribute, please fork the repository and make changes as you'd like. Pull requests are warmly welcomed.

## Acknowledgements

- Big thanks to PyTorch and TensorFlow teams for making model development and conversion seamless.
- React Native and Expo for an intuitive app development experience.
- Flask for being a lightweight and powerful backend tool.
- Flatiron School for guiding me through this project

---

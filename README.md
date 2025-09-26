# Leafy - Plant Recognition App

Leafy is a mobile application built with React Native that allows users to identify various plant species by simply taking a picture or selecting an image from their gallery. The app leverages a pre-trained machine learning model to recognize the plant and then provides detailed information about it from Wikipedia.

## Features

*   **Image-based Plant Recognition**: Identify plants using your phone's camera or by selecting an image from your gallery.
*   **Machine Learning Model**: Utilizes a pre-trained TensorFlow Lite model for accurate plant classification.
*   **Detailed Plant Information**: Fetches and displays comprehensive plant details from Wikipedia, including:
    *   Scientific Name
    *   Common Name
    *   Taxonomic classification (Order, Family, Genus)
    *   Description
*   **Cross-Platform**: Built with React Native and Expo, allowing it to run on both Android and iOS devices.

## Getting Started

### Prerequisites

*   Node.js and npm installed
*   Expo CLI: `npm install -g expo-cli`
*   An Android or iOS device/emulator

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/leafy.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd leafy
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Usage

1.  Start the Expo development server:
    ```bash
    npm start
    ```
2.  Scan the QR code with the Expo Go app on your Android or iOS device, or run on an emulator.

## Key Dependencies

*   **React & React Native**: Core framework for building the mobile app.
*   **Expo**: A framework and a platform for universal React applications.
*   **React Navigation**: For handling navigation between screens.
*   **TensorFlow.js & TFJS React Native**: For running the machine learning model on-device.
*   **Expo Camera**: To access the device's camera.
*   **Expo Image Picker**: To select images from the device's gallery.
*   **Expo File System**: To manage file system operations.

## License

This project is licensed under the 0BSD License.

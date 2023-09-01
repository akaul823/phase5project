import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image, Text, TouchableOpacity} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ImageViewer from './components/ImageViewer';
import Button from './components/Button';
import { useState, useRef, useEffect } from 'react';
import CircleButton from './components/CircleButton';
import IconButton from './components/IconButton';
import { Camera, CameraType } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import { InferenceSession } from "onnxruntime-react-native";

const PlaceholderImage = require('./assets/images/rose.jpg');
//new branch

export default function App() {
  //Set state for selected image and app options
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [startCamera,setStartCamera] = useState(false)
  const [type, setType] = useState(CameraType.back); //
  const [ isModelReady, setIsModelReady] = useState(false)

  const cameraRef = useRef(null);

  const loadModelAsync = async () => {
    const modelPath = "best_model_new.onnx"
    try {
      // load a model
      const model = await InferenceSession.create(modelPath);
      setIsModelReady(true);
    } catch (error) {
      console.error('Error loading onnx model!!:', error);
    }
  };




  // launch the image library and pick an image
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    //Ensure a picture is selected and set the current state to that picture
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAppOptions(true);
    } else {
      while(!setSelectedImage){
        alert('You did not select any image.');
      }
    }
  };
  //This resets options
  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = async () => {
    loadModelAsync()
    if (isModelReady) {
      try {
        // Prepare the input data for inference based on your model's requirements
        // 
        const input = selectedImage; // Prepare the input data based on the input nodes of your model
  
        // Run inference and get the results
        const result = await model.run(input, ['num_detection:0', 'detection_classes:0']);
  
        // Process the inference results (e.g., get the number of detections and classes)
        const numDetections = result['num_detection:0'];
        const detectionClasses = result['detection_classes:0'];
  
        // Use the inference results for your intended functionality (e.g., displaying stickers)
        alert(`Number of detections: ${numDetections}`);
      } catch (error) {
        console.error('Error during inference:', error);
      }
    } else {
      console.warn('Model is not yet ready for inference.');
    }
  };
  
  
  const onSaveImageAsync = async () => {
    // we will implement this later
  };

  //change
  const openCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      setStartCamera(true)
    } else {
      alert('Camera permission denied.');
    }
  };

  //change
  const takePictureAsync = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setSelectedImage(photo.uri); // Update the selected image with the URI of the captured photo
      setStartCamera(false); // Turn off the camera view after taking the picture
      setShowAppOptions(true);
    }
  };

  //change
  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  //camera view change
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
      {startCamera ? (
          <Camera style={styles.camera} type={type} ref={cameraRef}>
            <View style={styles.flipCam}>
              <TouchableOpacity onPress={toggleCameraType}>
                <Text style={styles.text}>Flip</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.takePic}>
              <TouchableOpacity onPress={takePictureAsync}>
              <Text style={styles.text}>Take Picture</Text>
            </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity onPress={()=>{
            setStartCamera(false)
            }}>
                <Text style={styles.text}>X</Text>
              </TouchableOpacity>
            </View>

          </Camera>
        ) : <ImageViewer placeholderImageSource={PlaceholderImage} selectedImage={selectedImage} />
      }
      </View>
      {showAppOptions ? (
        <View style={styles.optionsContainer}>
        <View style={styles.optionsRow}>
          <IconButton icon="refresh" label="Reset" onPress={onReset} />
          <CircleButton onPress={onAddSticker} />
          <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
        </View>
      </View>
      ) : (
        <View style={styles.footerContainer}>
          <Button theme="primary" label="Choose a photo" onPress={()=>{
            setStartCamera(false)
            pickImageAsync()}} />
          <Button label="Use this photo" onPress={() => {
            setStartCamera(false)
            setShowAppOptions(true)}} />
          <Button label="Open Camera" onPress={openCamera} />
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 58,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 1 / 2,
    alignItems: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end', // Adjust this to position camera controls at the bottom
    backgroundColor: 'transparent',
  },
  takePic: {
    margin: 64,
    bottom: -40,
  },
  flipCam:{
    bottom: 290
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
 });

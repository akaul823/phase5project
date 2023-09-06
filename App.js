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
// import { InferenceSession } from "onnxruntime-react-native";

// const PlaceholderImage = {uri: './assets/images/rose.jpg'}
const PlaceholderImage = require('./assets/images/rose.jpg')
console.log(`Here's my placeholder:`)
console.log(PlaceholderImage)
//new branch

export default function App() {
  //Set state for selected image and app options
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [startCamera,setStartCamera] = useState(false)
  const [type, setType] = useState(CameraType.back); //
  const [ isModelReady, setIsModelReady] = useState(false)

  const cameraRef = useRef(null);
  const convertBase64ToBlob = (base64, contentType) => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
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

  const onSaveImageAsync = async () => {
    // we will implement this later
  };


  const openCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      setStartCamera(true)
    } else {
      alert('Camera permission denied.');
    }
  };
  
  const takePictureAsync = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setSelectedImage(photo.uri); // Update the selected image with the URI of the captured photo
      setStartCamera(false); // Turn off the camera view after taking the picture
      setShowAppOptions(true);
    }
  };

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  const onAddSticker = async () => {
    if (selectedImage) {
      const formData = new FormData();
      const blob = convertBase64ToBlob(selectedImage, 'image/jpeg');
      formData.append('image', blob, 'image.jpg');

      try {
        console.log(formData)
        console.log(selectedImage)
        console.log(blob)
        const response = await fetch('http://127.0.0.1:5555/classify', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Predicted Label:', data.predicted_label);
          console.log('Confidence Score:', data.confidence_score);
        } else {
          console.error('Classification failed.');
        }
      } catch (error) {
        console.error('Error classifying image:', error);
      }
    }
  };
  

  // const onAddSticker = async () => {

  //   if(selectedImage != null){
  //     const data = new FormData();
  //     data.append('image', {
  //       uri: selectedImage,
  //     });
  //     console.log(data)
  //     fetch('http://127.0.0.1:5555/classify', {
  //       method: 'POST',
  //       headers: {
  //         'Accept': 'application/json',
  //         'Content-Type': 'multipart/form-data',
  //       },
  //       body: data,
  //     })
  //     .then(response => response.json())
  //     .then(data => console.log(data))
  //     // if(response.ok){
  //     //   alert("You have classified")
  //     // }
  //   };
  //   }
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
        ) : <ImageViewer placeholderImage={PlaceholderImage} selectedImage={selectedImage} />
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
            setShowAppOptions(true)
           }} />
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

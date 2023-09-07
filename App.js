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
import { encode, decode } from 'base-64';
import * as FileSystem from 'expo-file-system';
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

  const imageToBase64 = async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  // const convertBase64ToBlob = (base64, contentType) => {
  //   const binary = decode(base64);
  //   const byteArray = new Uint8Array(binary.length);
  
  //   for (let i = 0; i < binary.length; i++) {
  //     byteArray[i] = binary.charCodeAt(i);
  //   }
  
  //   return new Blob([byteArray], { type: contentType });
  // };

  // launch the image library and pick an image
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    //Ensure a picture is selected and set the current state to that picture
    if (!result.canceled) {
      const localUri = result.assets[0].uri
      const base64Image = await imageToBase64(localUri)
      setSelectedImage(base64Image);
      setShowAppOptions(true);
    } else {
      while(!setSelectedImage){
        alert('You did not select any image.');
      }
    }
  };
  // Function to pick an image based on the platform



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

 
  //       if (response.ok) {
  //         const data = await response.json();
  //         console.log('Predicted Label:', data.predicted_label);
  //         console.log('Confidence Score:', data.confidence_score);
  //       } else {
  //         console.error('Classification failed.');
  //       }
  //     } catch (error) {
  //       console.error('Error classifying image:', error);
  //     }
  //   }
  // };
  
  const onAddSticker = async () => {

    if(selectedImage != null){
      const data = new FormData();
      data.append('image', {
        uri: selectedImage,
      });
      console.log(data)
      // FileSystem.uploadAsync()
      // wifi ip address. http://127.0.0.1:5555 was bad request too
      fetch('http://172.22.83.5:5555', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: data,
      })
      .then(response => response.json())
      .then(data => console.log(data))
      // if(response.ok){
      //   alert("You have classified")
      // }
    };
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

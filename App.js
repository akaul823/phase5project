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

// https://www.youtube.com/watch?v=pBEYprNAs4c Uploading using expo file system

// const imgDir = FileSystem.documentDirectory + 'images';
// const ensureDirExists = async()=>{
//   const dirInfo = await FileSystem.getInfoAsync(imgDir);
//   if (!dirInfo.exists){
//     await FileSystem.makeDirectoryAsync(imgDir, {intermediates: true})
//   }
// }

// const PlaceholderImage = {uri: './assets/images/rose.jpg'}
const PlaceholderImage = require('./assets/images/rose.jpg')
console.log(`Here's my placeholder:`)
console.log(PlaceholderImage)

export default function App() {
  //Set state for selected image and app options
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [startCamera,setStartCamera] = useState(false)
  const [type, setType] = useState(CameraType.back); //
  const [ isModelReady, setIsModelReady] = useState(false)
  const [imgObj, setImgObj] = useState(null);
  const [flowerInfo, setFlowerInfo]  = useState("")
  const cameraRef = useRef(null);

  // Converting an image to base 64 using Expo File System
  // const imageToBase64 = async (uri) => {
  //   try {
  //     const base64 = await FileSystem.readAsStringAsync(uri, {
  //       encoding: FileSystem.EncodingType.Base64,
  //     });
  //     // console.log(base64.slice(0, 10))
  //     // return `data:image/jpeg;base64,${base64}`;
  //     return base64
  //   } catch (error) {
  //     console.error('Error converting image to base64:', error);
  //     return null;
  //   }
  // };

  // Concerting base64 encoded image as BLOB
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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
      base64: true
    });

    //Ensure a picture is selected and set the current state to that picture
    if (!result.canceled) {

      const img = result.assets[0]
  

      // const base64Image = await imageToBase64(localUri)
      setSelectedImage(img.uri);
      setImgObj(img)
      console.log("Local URI: " + img.uri)
      console.log("File Name: " + result.assets[0].fileName)
      console.log("img: " + img)
      // setImgObj(img)
      setShowAppOptions(true);
    } 
    else {
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
      // photo.assets[0]?
      setImgObj(photo)
      setSelectedImage(photo.uri); // Update the selected image with the URI of the captured photo
      setStartCamera(false); // Turn off the camera view after taking the picture
      setShowAppOptions(true);
    }
  };

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  const onAddSticker = async () => {

    if(selectedImage != null){
      // const base64Img = imageToBase64(selectedImage)
      const imgData = new FormData();
      imgData.append('image', {
        uri: imgObj.uri,
        type: imgObj.type,
        name: imgObj.fileName
      });
      console.log(imgData)

      // I changed to port 8000. URL is dependnent on NGROK forwarding URL
      fetch('https://0b0e-71-190-177-64.ngrok-free.app/classify', {
        method: 'POST',
        // headers: {
        //   'Accept': 'application/json',
        //   'Content-Type': 'multipart/form-data',
        // },
        body: imgData,
      })
      .then(res=>res.json())
      .then(data=>{
        alert(`This is a ${data["flowerName"]}`)
        // setFlowerInfo(data["flowerName"])
        // console.log(flowerInfo)
      })
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
          {/* <Button label="Use this photo" onPress={() => {
            setStartCamera(false)
            setShowAppOptions(true)
           }} /> */}
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
    flex: 1/3,
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

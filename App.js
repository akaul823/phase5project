import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image, Text, TouchableOpacity} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ImageViewer from './components/ImageViewer';
import Button from './components/Button';
import { useState, useRef, useEffect } from 'react';
import CircleButton from './components/CircleButton';
import IconButton from './components/IconButton';
import { Camera, CameraType } from 'expo-camera';


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
    setSelectedImage(!selectedImage)
    setFlowerInfo("")
    // setFlowerInfo(!flowerInfo)
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
      console.log(photo)
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
      setIsModelReady(true)
      const imgData = new FormData();
      imgObj.type ? (imgData.append('image', {
        uri: imgObj.uri,
        type: imgObj.type,
        name: imgObj.fileName
      })) : (imgData.append('image', {
        uri: imgObj.uri,
        type: ".jpg",
        name: "image"
      }))

      // I changed to port 8000. URL is dependnent on NGROK forwarding URL
      fetch('https://cff7-69-114-91-11.ngrok-free.app/classify', {
        method: 'POST',
        // headers: {
        //   'Accept': 'application/json',
        //   'Content-Type': 'multipart/form-data',
        // },
        body: imgData,
      })
      .then(res=>res.json())
      .then(data=>{
        setIsModelReady(false)
        getName(data)

      })
    };
     }
     function getName(data){
      let name = data["flowerName"]
      setFlowerInfo(name)
      // alert(`This is a ${name}`)
     }


  //camera view change
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
      {startCamera ? (
          <Camera style={styles.camera} type={type} ref={cameraRef}>
            <View style={styles.flipCam}>
              <TouchableOpacity onPress={toggleCameraType}>
                <Text style={styles.flipCam}>Flip</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.takePic}>
              <TouchableOpacity onPress={takePictureAsync}>
              <Text style={styles.text}> Take Picture</Text>
            </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity onPress={()=>{
            setStartCamera(false)
            }}>
                <Text style={styles.closeButton}>X</Text>
              </TouchableOpacity>
            </View>

          </Camera>
        ) : <ImageViewer placeholderImage={PlaceholderImage} selectedImage={selectedImage} flowerInfo={flowerInfo} isModelReady={isModelReady} />
      }
      </View>
      {showAppOptions ? (
        <View style={styles.optionsContainer}>
        <View style={styles.optionsRow}>
          <IconButton icon="refresh" label="Reset" onPress={onReset} />
          <CircleButton onPress={(e)=>{
            onAddSticker(e)
            }} />
          <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
        </View>
      </View>
      ) : (
        <View style={styles.footerContainer}>

          <Button theme="primary" label="Choose a photo" onPress={()=>{
            setStartCamera(false)
            pickImageAsync()}} />
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20, // You can adjust the margin as needed
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
    bottom: -70,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    right: -5,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -39,
    right: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    
  },
 });


// import { StyleSheet, Image } from 'react-native';

// export default function ImageViewer({ placeholderImage, selectedImage, flowerInfo }) {
//     const imageSource = selectedImage  ? { uri: selectedImage } : placeholderImage;
//   return (
//     <Image source={imageSource} style={styles.image} />
//   );
// }

// const styles = StyleSheet.create({
//   image: {
//     width: 320,
//     height: 440,
//     borderRadius: 18,
//   },
// });
import React from 'react';
import { View, Image, Text } from 'react-native';

const ImageViewer = ({ placeholderImage, selectedImage, flowerInfo, isModelReady }) => {
  return (
    <View style={styles.imageContainer}>
      <Image
        source={selectedImage ? { uri: selectedImage } : placeholderImage}
        style={styles.image}
      />
      {isModelReady ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <Text style={styles.flowerInfo}>
          {flowerInfo && `Flower Name: ${flowerInfo.charAt(0).toUpperCase() + flowerInfo.slice(1)}`}
        </Text>
      )}
    </View>
  );
};

const styles = {
  imageContainer: {
    flex: 1,
    paddingTop: 58,
    alignItems: 'center',
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  flowerInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
};

export default ImageViewer;


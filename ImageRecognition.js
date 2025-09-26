import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

function CameraScreen() {
  const navigation = useNavigation();

  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  let camera;

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  async function takePicture() {
    if (camera) {
      const photoData = await camera.takePictureAsync();
      setPhoto(photoData.uri);
      console.log('Picture taken:', photoData.uri);
      navigation.navigate('ImageScreen', { photoUri: photoData.uri });
    }
  }

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('Permission status:', status);

    if (status !== 'granted') {
      alert('Sorry, we need permission to access your gallery');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    console.log('Image picker result:', result);

    if (!result.canceled) {
      const photoUri = result.assets[0].uri;
      console.log('Selected photo URI:', photoUri);
      setPhoto(photoUri);
      navigation.navigate('ImageScreen', { photoUri: photoUri });
    } else {
      console.log('Image selection was canceled or no assets were returned.');
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={(ref) => { camera = ref }}>

        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
          <Ionicons name="sync-outline" size={40} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.galleryButton} onPress={openGallery}>
          <Ionicons name="image-outline" size={40} color="white" />
        </TouchableOpacity>

        <View style={styles.captureButtonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}></TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

function ImageScreen({ route }) {
  const navigation = useNavigation();
  const { photoUri } = route.params;

  const handleIdentifyPress = () => {
    navigation.navigate('PlantDesc', { photoUri });
  };

  return (
    <View style={[styles.container, { backgroundColor: 'black' }]}>
      <Image
        source={{ uri: photoUri }}
        style={styles.backgroundImage}
        onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
      />
      <TouchableOpacity style={styles.identifyButton} onPress={handleIdentifyPress}>
        <Text style={styles.buttonText}>Identify!</Text>
      </TouchableOpacity>
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator
      initialRouteName="CameraScreen"
      screenOptions={{
        cardStyleInterpolator: () => ({
          cardStyle: { opacity: 1 },
          containerStyle: { opacity: 1 }
        })
      }}
    >
      <Stack.Screen
        name="CameraScreen"
        component={CameraScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: () => (
            <Image
              source={require('./assets/logo1.png')}
              style={styles.headerImage}
            />
          ),
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back-outline" size={25} color="black" />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
        })}
      />
      <Stack.Screen
        name="ImageScreen"
        component={ImageScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: () => (
            <Image
              source={require('./assets/logo1.png')}
              style={styles.headerImage}
            />
          ),
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back-outline" size={25} color="black" />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
        })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  backButton: {
    marginLeft: 15,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  galleryButton: {
    position: 'absolute',
    bottom: 80,
    left: '15%',
    alignItems: 'center',
  },
  flipButton: {
    position: 'absolute',
    bottom: 80,
    right: '15%',
    alignItems: 'center',
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 70,
    left: '50%',
    transform: [{ translateX: -35 }],
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: 'white',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  identifyButton: {
    backgroundColor: '#86AB88',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 35,
    position: 'absolute',
    bottom: 80,
    zIndex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});

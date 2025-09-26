import React from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 

const LandingPage = () => {
    const navigation = useNavigation();

    const handleImageClick = () => {
        navigation.navigate('ImageRecognition'); 
    };

  return (
    <View style={styles.container}>
      <Text style={styles.text1}>Unlock the world of plants with Leafy
      </Text>
      <Text style={styles.text2}>Discover fascinating details about any plant in seconds.</Text>
      <TouchableOpacity onPress={handleImageClick}>
        <Image
            source={require('./assets/camera.png')} 
            style={styles.logo}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text1: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Inter',
  },
  text2: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 14,
    marginBottom: 20,
    fontFamily: 'Inter',
  },
  logo: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LandingPage;



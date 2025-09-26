import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';

const SplashScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(1));  

  useEffect(() => {

    Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 2000,  
        useNativeDriver: true,
      }).start();

    const timer = setTimeout(() => {
      navigation.replace('LandingPage');
    }, 2000);

    return () => clearTimeout(timer); 
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('./assets/logo.png')}
        style={[styles.logo, { opacity: fadeAnim }]}  
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#86AB88',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  }
});

export default SplashScreen;


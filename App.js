import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './SplashScreen';
import LandingPage from './LandingPage';
import ImageRecognition from './ImageRecognition';
import PlantDesc from './PlantDesc';


Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="SplashScreen" 
        screenOptions={{
          headerShown: false,
          animation: 'fade',  
        }}
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen name="ImageRecognition" component={ImageRecognition} /> 
        <Stack.Screen name="PlantDesc" component={PlantDesc} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

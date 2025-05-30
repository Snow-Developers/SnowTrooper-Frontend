import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';
import { Button, Provider as PaperProvider } from 'react-native-paper';
import LogInScreen from './logInScreen';
import SignUpScreen from './signUpScreen';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View>
      <Image source={require('../assets/images/SnowTroopers_Logo.png')}
        style={{width: 150, height: 150}}/>
      <Button mode="contained" onPress={() => navigation.navigate('SignUp')}>
        Sign Up
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('Login')}>
        Log In
      </Button>
    </View>
  );
}

export default function App() {
  return (
    <PaperProvider >
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name = "Login" component={LogInScreen} />
        </Stack.Navigator>
    </PaperProvider>
  );
}

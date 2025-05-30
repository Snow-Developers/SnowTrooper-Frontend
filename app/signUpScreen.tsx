import { router } from 'expo-router';
import React from 'react';
import { TextInput, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function SignUpScreen() {
    const handleEmailSignUp = () => {
      router.push('/SignUpViews/emailPage');
    }

  return (
    <View>
      <Text>Sign up</Text>

      <Button icon="facebook" mode="outlined" onPress={() => console.log('Facebook')}>
        Sign up with Facebook
      </Button>

      <Button icon="apple" mode="outlined" onPress={() => console.log('Apple')}>
        Sign up with Apple
      </Button>

      <Button icon="google" mode="outlined" onPress={() => console.log('Google')}>
        Sign up with Google
      </Button>

      <Button icon="email" mode="outlined" onPress={handleEmailSignUp}>
        Sign up with Email
      </Button>

      <Text>Or</Text>

      <View style={{ flexDirection: 'row' }}>
        <TextInput placeholder="+886" style={{ flex: 1 }} />
        <TextInput placeholder="Mobile number" style={{ flex: 2 }} />
      </View>

      <TextInput placeholder="Password" secureTextEntry />

      <Button icon="arrow-right" mode="contained" onPress={() => console.log('Login')}>
        Login
      </Button>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text>Forgot password</Text>
        <Text>Help Center</Text>
      </View>
    </View>
  );
}

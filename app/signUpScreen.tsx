import { router } from 'expo-router';
import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';

export default function SignUpScreen() {


    const handleEmailSignUp = () => {
      router.push('/SignUpViews/emailPage');
    }

    const handleGoogleSignUp = () => {
        //Currently only work on web app

        // const auth = getAuth();
        // const provider = new GoogleAuthProvider();
        // signInWithPopup(auth, provider)
        //     .then((result) => {
        //         const credential = GoogleAuthProvider.credentialFromResult(result);
        //         const token = credential?.accessToken;
        //         // The signed-in user info.
        //         const user = result.user;
        //         console.log('User signed up successfully with Google:', user);
        //         console.log('Google Sign Up Details:', {
        //             uid: user.uid,
        //             email: user.email,
        //         });
                    

        //     }).catch((error) => {
        //         // Handle Errors here.
        //         const errorCode = error.code;
        //         const errorMessage = error.message;
        //         // The email of the user's account used.
        //         const email = error.customData.email;
        //         // The AuthCredential type that was used.
        //         const credential = GoogleAuthProvider.credentialFromError(error);
        // });
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

      <Button icon="google" mode="outlined" onPress={handleGoogleSignUp}>
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

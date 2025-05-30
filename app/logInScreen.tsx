import React from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';


export default function LogInScreen() {
     const handleEmailLogin = () => {
        
     }

    return (
        <View>
            <Button mode="contained" onPress={() => console.log('Pressed')}>
                Log in with Facebook
            </Button>
            <Button mode="contained" onPress={() => console.log('Pressed')}>
                Log in with Apple
            </Button>
            <Button mode="contained" onPress={() => console.log('Pressed')}>
                Log in with Google
            </Button>
            <Button mode="contained" onPress={handleEmailLogin}>
                Log in with Email
            </Button>

            <Text variant="bodyLarge" style={{ textAlign: 'center', marginVertical: 10 }}>
            Or
            </Text>
            <Button mode="contained" onPress={() => console.log('Pressed')}>
                Phone Number
            </Button>
            <Button mode="contained" onPress={() => console.log('Pressed')}>
                Password
            </Button>
            <Button mode="contained" onPress={() => console.log('Pressed')}>
                Login
            </Button>
        </View>
    );
}
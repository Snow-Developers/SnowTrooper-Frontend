import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import auth from '../../services/firebaseConfig';

export default function EmailLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('User logged in successfully:', {
                uid: user.uid,
                email: user.email,
            });
            alert('Login Successful');
        } catch (error: any) {
            console.error('Login failed:', error);
            alert('Login Failed: ' + error.message);
        }
    };

    return (
        <View>
            <Text variant="headlineMedium">Log In</Text>

            <Text variant="labelLarge">Email</Text>
            <TextInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <Text variant="labelLarge">Password</Text>
            <TextInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Button
                mode="contained"
                onPress={handleEmailLogin}
                style={{ marginTop: 20 }}
            >
                Log In
            </Button>
        </View>
    );
}

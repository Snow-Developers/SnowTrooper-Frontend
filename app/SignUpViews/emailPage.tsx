import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import auth from '../../services/firebaseConfig';


export default function EmailPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleEmailSignUp = async() => {
        

        if (password !== confirmPassword) {
            console.error('Passwords do not match');
            alert('Passwords do not match');
            return;
        }

        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user.uid;    // Get the user ID
                console.log('User signed up successfully, userUID: ', user);
                console.log('Sign Up Details:', {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    password,
                    confirmPassword
                });
                alert('Sign Up Successful');
            })
            .catch((error) => {
                console.error('Error signing up:', error);
                alert('Sign Up Failed: ' + error.message);
            });


    };

    


    return (
        <View>
            <Text variant="headlineMedium">Enter Information</Text>
            
            <Text variant="labelLarge">First Name</Text>
            <TextInput
                label="First Name"
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={text => setFirstName(text)}
            />

            <Text variant="labelLarge">Last Name</Text>
            <TextInput
                label="Last Name"
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={text => setLastName(text)}
            />

            <Text variant="labelLarge">Email</Text>
            <TextInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={text => setEmail(text)}
            />

            <Text variant="labelLarge">Phone Number</Text>
            <TextInput
                label="Phone Number"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChangeText={text => setPhoneNumber(text)}
            />

            <Text variant="labelLarge">Password</Text>
            <TextInput
                label="Password"
                placeholder="Enter a password"
                value={password}
                onChangeText={text => setPassword(text)}
                secureTextEntry
            />

            <Text variant="labelLarge">Confirm Password</Text>
            <TextInput
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={text => setConfirmPassword(text)}
                secureTextEntry
            />

            <Button
                mode="contained"
                onPress={handleEmailSignUp}
                style={{ marginTop: 20 }}
            > Sign Up </Button>
        </View>
    );
}
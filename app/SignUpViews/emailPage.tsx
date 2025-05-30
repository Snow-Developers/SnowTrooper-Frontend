import { useState } from 'react';
import { View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';


export default function EmailPage() {
    const [email, setEmail] = useState('');
    return (
        <View>
            <Text variant="headlineLarge">Enter Email</Text>
            <TextInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={text => setEmail(text)}
            />
        </View>
    );
}
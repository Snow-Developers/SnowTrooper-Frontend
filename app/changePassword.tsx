import { router } from 'expo-router';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function ChangePasswordScreen() {
  const user = getAuth().currentUser!;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const passwordValidation = () => {
    let isValid = true;

    if (!currentPassword || !newPassword) {
        isValid = false;
        Alert.alert('Error', 'Please fill out all fields.');
        console.log('Error', 'Please fill out all fields.');
    }

    if(newPassword !== confirmNewPassword){
        isValid = false;
        Alert.alert('New and confirm passwords do not match, please try again.');
        console.log('New and confirm passwords do not match, please try again.');
    }
    if(newPassword.length < 6){
        isValid = false;
        Alert.alert('Password must be a length of at least 6 characters.');
        console.log('Password must be a length of at least 6 characters.');
    }
    return isValid;
  };

  const handleChangePassword = () => {
    if(passwordValidation()){
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        reauthenticateWithCredential(user, credential).then(() =>{
            
            updatePassword(user, newPassword).then(() =>{
                setCurrentPassword('');
                setNewPassword('');
                Alert.alert('Password has sucessfully been changed!');
                console.log('Password has sucessfully been changed!');
                router.replace("/profileScreen");
            }).catch((error) =>{
                Alert.alert('Error updating password: ', error);
                console.log('Error updating password: ', error);
            });
        }).catch((error) => {
            Alert.alert('Error reauthenticating user: ', error);
            console.log('Error reauthenticating user: ', error);
        });
    }
}

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Change Password</Text>

      <TextInput
        label="Current Password"
        mode="outlined"
        autoCapitalize="none"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
        style={styles.input}
      />

      <TextInput
        label="New Password"
        mode="outlined"
        secureTextEntry
        autoCapitalize="none"
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
      />

      <TextInput
        label="Confirm New Password"
        mode="outlined"
        secureTextEntry
        autoCapitalize="none"
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleChangePassword}
        style={styles.button}
      >Change Password</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
import { router } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function ProfileScreen (){

    const handleLogOut = async() =>{
        signOut(getAuth()).then(() => {
            router.replace("/");
            console.log("Sucessfully logged out")
        });
    };
    
    return(
        <View>
            <Text>Profile Page</Text>
            <Button
                mode="outlined"
                onPress={handleLogOut}
                style = {{marginTop: 400}}
            > Log out </Button>
        </View>
    );
}
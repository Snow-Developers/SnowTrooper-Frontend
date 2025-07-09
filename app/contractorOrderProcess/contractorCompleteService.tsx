import { router } from "expo-router";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function completeService() {
  
  const handleSubmit = async () => {
      alert("Payment is being processed and on the way!");
      router.push('/contractorHomeScreen');
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Thanks for being a Snow Trooper! Payment is being processed and on the way!
      </Text>

      <View style={styles.topSpacer} />

      <Image
        source={require('../../assets/images/Join Snow Troopers Group Rates photos.png')}
        style={styles.image}
        />

      <View style={styles.bottomButtonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          contentStyle={styles.wideButtonContent}
          style={styles.uploadButton}
        >
          Back to Home
        </Button>
      </View>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  topSpacer: {
    height: 80,
  },
  uploadButton: {
    alignSelf: 'center',
    marginBottom: 20,
    width: '90%',
  },
  wideButtonContent: {
    height: 48,
  },
  image: {
    width: screenWidth - 40,
    height: screenWidth * 1.2,
    resizeMode: 'cover',
    borderRadius: 12,
    alignSelf: 'center',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
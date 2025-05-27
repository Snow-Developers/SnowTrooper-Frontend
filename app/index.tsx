import { Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Remember to use React Native Paper guys!</Text>
      <Button mode="contained" onPress={() => console.log("Pressed!")}>
        I added this btn to test out the library.
      </Button>
    </View>
  );
}

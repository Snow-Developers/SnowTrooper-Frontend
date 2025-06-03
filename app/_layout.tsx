import { Stack } from "expo-router";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#00c1de",
    accent: "#00c1de",
    background: "#ffffff",
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={customTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#fff" },
        }}
      />
    </PaperProvider>
  );
}

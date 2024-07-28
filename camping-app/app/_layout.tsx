import { Stack } from "expo-router";

export default function RootLayout() {

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{headerShown: false }} />
      <Stack.Screen name="auth/SignIn" options={{ title: 'Sign In' , headerShown:false}} />
      <Stack.Screen name="auth/SignUp" options={{ title: 'Sign Up' , headerShown: false}} />
      <Stack.Screen name="UserInterests/Interests" options={{title: "Interests", headerShown: false}} />

    </Stack>
  );
}


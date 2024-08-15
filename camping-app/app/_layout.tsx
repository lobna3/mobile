import React from 'react';
import { Stack } from "expo-router";
import { SocketProvider} from './useWebSocket';
export default function RootLayout() {

  return (
    <SocketProvider>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{headerShown: false }} />
      <Stack.Screen name="auth/SignIn" options={{ title: 'Sign In' , headerShown:false}} />
      <Stack.Screen name="auth/SignUp" options={{ title: 'Sign Up' , headerShown: false}} />
      <Stack.Screen name="UserInterests/Interests" options={{title: "Interests", headerShown: false}} />
      <Stack.Screen name="profile" options={{title: "Profile", headerShown: false}} />
      <Stack.Screen name="creatCamp/CreateCamPost" options={{title: "createCamp", headerShown: false}} />
      <Stack.Screen name="[postId]/index" options={{title: "Interests", headerShown: false}} />
      <Stack.Screen name="experience/experience" options={{title: "experience", headerShown: false}} />
      <Stack.Screen name="aboutUs/AboutUs" options={{title:"AboutUs" , headerShown: false}}/>
      <Stack.Screen name="emergenci/Burns" options={{title: "burns", headerShown: false}} />
      <Stack.Screen name="emergenci/Bites" options={{title: "bites", headerShown: false}} />
      <Stack.Screen name="emergenci/emergenci" options={{title: "emergenci", headerShown: false}} />
      <Stack.Screen name="search/SearchByName" options={{title: "search", headerShown: false}} />
      <Stack.Screen name="Tutoriels/Tutoriels" options={{title: "Tutoriels", headerShown: false}} />
      <Stack.Screen name="SearchedUserProfile/UserProfile" options={{title: "UserProfile", headerShown: false}} />
      <Stack.Screen name="createExp/CreateExp" options={{title: "create experience", headerShown: false}} />
      <Stack.Screen name="addTips/addTips" options={{title: "create experience", headerShown: false}} />
      
    </Stack>
    </SocketProvider>
  );
}
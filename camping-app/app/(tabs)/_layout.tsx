import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { NotificationProvider } from '../NotificationContext'; 

const TabLayout = () => {
  return (
    <NotificationProvider>
   <Tabs screenOptions={{headerShown:false, tabBarActiveTintColor: Colors.primaryColor}}>
    <Tabs.Screen name="home" 
      options={{
        tabBarLabel: "Home",
        tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color} />
      }}
    />
    <Tabs.Screen name="invitations"
      options={{
        tabBarLabel: "Invitations",
        tabBarIcon: ({color}) => <Ionicons name="people" size={24} color={color} />
      }}
    />
    <Tabs.Screen name="messages"
      options={{
        tabBarLabel: "Messages",
        tabBarIcon: ({color}) => <Entypo name="message" size={24} color={color} />
      }}
    />
    <Tabs.Screen name="notifications"
      options={{
        tabBarLabel: "Notifications",
        tabBarIcon: ({color}) => <Ionicons name="notifications" size={24} color={color} />
      }}
    />
    <Tabs.Screen name="shop"
      options={{
        tabBarLabel: "Shop",
        tabBarIcon: ({color}) => <FontAwesome5 name="shopping-bag" size={24} color={color} />
      }}
    />
    <Tabs.Screen name="tips&guides"
      options={{
        tabBarLabel: "Tips & Guides",
        tabBarIcon: ({color}) => <MaterialIcons name="tips-and-updates" size={24} color={color} />
      }}
    />
   </Tabs>
   </NotificationProvider>
  )
}

export default TabLayout

const styles = StyleSheet.create({})

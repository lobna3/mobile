import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, FlatList, ListRenderItem, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JWT from 'expo-jwt';
import axios from 'axios';
import { useSocket } from '../useWebSocket';

interface WebSocketMessage {
  userId: string; 
  message: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  imagesProfile: string[];
  joinCampingPosts: JoinCampingPost[];
  posts: Post[];
}

interface Post {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  equipment: string[];
  places: number;
  ageCategory: "ADULT" | "CHILD" | "TEEN";
  images: string[];
  organizerId: number;
  category: string;
  status: "InProgress" | "Completed" | "Cancelled";
  joinCampingPosts: JoinCampingPost[];
}

interface JoinCampingPost {
  userId: string; 
  postId: number;
  rating: number;
  reviews: string;
  favorite: "Yes" | "No";
  notification: string;
  status: "ACCEPTED" | "REJECTED" | "PENDING";
  user: User;
  post: Post;
}

const Notifications = () => {
  const { socket } = useSocket(); // Access the socket instance from context
  console.log('Socket:', socket);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  


  const renderItem: ListRenderItem<WebSocketMessage> = ({ item }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>
         {user?.name || 'Unknown'}: {messages}
      </Text>
    </View>
  );
  

  useEffect(() => {
    const fetchUserData = async (userId: string) => {
      try {
        const response = await axios.get(`http://192.168.10.20:5000/api/users/${userId}`);
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    const decodeToken = async () => {
      try {
        const tokenData = await AsyncStorage.getItem("token");
        if (tokenData) {
          const token = tokenData.startsWith('Bearer ') ? tokenData.replace('Bearer ', '') : tokenData;
          const key = 'mySuperSecretPrivateKey';
          
          try {
            const decodedToken = JWT.decode(token, key);
            if (decodedToken && decodedToken.id) {
              fetchUserData(decodedToken.id);
            } else {
              setError("Failed to decode token or token does not contain ID");
            }
          } catch (decodeError) {
            setError("Failed to decode token");
          }
        } else {
          setError("Token not found");
        }
      } catch (storageError) {
        setError("Failed to fetch token");
      }
    };

    decodeToken();
  }, []);

  useEffect(() => {
    if (socket && user) {
      const userId = user.id;
      socket.emit('register', userId);
      socket.emit('joinRoom', userId);

      const handleNotification = (message: WebSocketMessage) => {
        console.log('Received notification:', message);
        setMessages(prevMessages => [...prevMessages, message]); // Ensure message.message contains the actual message
       
      };

      socket.on('notification', handleNotification);

      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [socket, user]);
  console.log('Messages',messages)
  if (loading) {
    return <Text style={styles.message}>Loading...</Text>;
  }

  if (error) {
    return <Text style={styles.message}>{error}</Text>;
  }

  const profileImageUrl = user?.imagesProfile?.[0] || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRuRip5LBOHjlx6SIMhLsGHLxpw_wUUXG8Z0sz9YUBaP9PstT_BmRY1CGaFBqqDeFAX9w&usqp=CAU';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {messages.length > 0 && (
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
        
      )}
    
      {user?.joinCampingPosts?.map((notification, index) => (
        <View key={index} style={styles.notification}>
          <Image style={styles.profile} source={{ uri: profileImageUrl }} />
          <View style={styles.info}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.message}>{notification.notification}</Text>
            
          </View>
        </View>
      ))}
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00595E',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#F0F8FF',
    marginBottom: 20,
    textAlign: 'center',
  },
  messageContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#014043',
  },
  messageText: {
    color: '#F0F8FF',
    fontSize: 16,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#014043',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  profile: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F0F8FF',
  },
  message: {
    fontSize: 16,
    color: '#B0BEC5',
    textAlign: 'center',
    marginTop: 20,
  },
});





